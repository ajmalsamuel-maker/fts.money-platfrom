import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const {
            action,
            transaction_id,
            psp_code,
            merchant_id,
            transaction_data
        } = await req.json();

        if (action === 'generate_pacs008') {
            // Generate pacs.008 (Financial Institution Transfer) with LEI
            
            // Get credentials
            const pspCreds = await base44.asServiceRole.entities.LEICredential.filter({
                entity_type: 'psp',
                psp_code: psp_code
            });

            const merchantCreds = merchant_id ? await base44.asServiceRole.entities.LEICredential.filter({
                entity_type: 'merchant',
                entity_id: merchant_id
            }) : null;

            const pspLEI = pspCreds?.[0]?.lei || null;
            const merchantLEI = merchantCreds?.[0]?.lei || null;

            // Build ISO 20022 pacs.008 message with LEI
            const pacs008 = {
                "FIToFICstmrCdtTrf": {
                    "GrpHdr": {
                        "MsgId": transaction_id,
                        "CreDtTm": new Date().toISOString(),
                        "NbOfTxs": "1",
                        "SttlmInf": {
                            "SttlmMtd": "CLRG"
                        }
                    },
                    "CdtTrfTxInf": {
                        "PmtId": {
                            "InstrId": transaction_id,
                            "EndToEndId": transaction_data.end_to_end_id || transaction_id
                        },
                        "IntrBkSttlmAmt": {
                            "Ccy": transaction_data.currency,
                            "value": transaction_data.amount
                        },
                        "ChrgBr": "SLEV",
                        "Dbtr": {
                            "Nm": transaction_data.debtor_name,
                            "Id": {
                                "OrgId": {
                                    "LEI": merchantLEI // Merchant LEI embedded
                                }
                            }
                        },
                        "DbtrAgt": {
                            "FinInstnId": {
                                "LEI": pspLEI // PSP LEI embedded
                            }
                        },
                        "Cdtr": {
                            "Nm": transaction_data.creditor_name,
                            "Id": {
                                "OrgId": {
                                    "LEI": transaction_data.creditor_lei // Creditor LEI if available
                                }
                            }
                        },
                        "CdtrAgt": {
                            "FinInstnId": {
                                "BIC": transaction_data.creditor_bic
                            }
                        },
                        "RmtInf": {
                            "Ustrd": transaction_data.remittance_info
                        },
                        "SplmtryData": {
                            "PlcAndNm": "vLEI_Provenance",
                            "Envlp": {
                                "credential_chain": [pspLEI, merchantLEI].filter(Boolean),
                                "vlei_signature": transaction_data.vlei_signature || null
                            }
                        }
                    }
                }
            };

            // Log message generation
            await base44.functions.invoke('signedAuditLogger', {
                actor_lei: pspLEI,
                actor_email: 'system',
                actor_name: pspCreds?.[0]?.entity_name || 'Unknown PSP',
                actor_role: 'psp',
                action: 'iso20022_message_generated',
                action_category: 'transaction',
                target_entity_type: 'Transaction',
                target_entity_id: transaction_id,
                metadata: {
                    message_type: 'pacs.008',
                    includes_lei: true,
                    psp_lei: pspLEI,
                    merchant_lei: merchantLEI
                }
            });

            return Response.json({
                success: true,
                message_type: 'pacs.008',
                message: pacs008,
                lei_embedded: true,
                credential_chain: [pspLEI, merchantLEI].filter(Boolean)
            });
        }

        if (action === 'generate_pacs002') {
            // Generate pacs.002 (Payment Status Report) with LEI
            const pspCreds = await base44.asServiceRole.entities.LEICredential.filter({
                entity_type: 'psp',
                psp_code: psp_code
            });

            const pspLEI = pspCreds?.[0]?.lei || null;

            const pacs002 = {
                "FIToFIPmtStsRpt": {
                    "GrpHdr": {
                        "MsgId": `STATUS-${transaction_id}`,
                        "CreDtTm": new Date().toISOString()
                    },
                    "OrgnlGrpInfAndSts": {
                        "OrgnlMsgId": transaction_id,
                        "GrpSts": transaction_data.status
                    },
                    "TxInfAndSts": {
                        "StsId": transaction_data.status_id,
                        "OrgnlEndToEndId": transaction_id,
                        "TxSts": transaction_data.transaction_status,
                        "StsRsnInf": {
                            "Rsn": {
                                "Cd": transaction_data.reason_code
                            }
                        },
                        "InstgAgt": {
                            "FinInstnId": {
                                "LEI": pspLEI // PSP LEI in status report
                            }
                        },
                        "SplmtryData": {
                            "PlcAndNm": "vLEI_StatusSignature",
                            "Envlp": {
                                "signed_by_lei": pspLEI,
                                "signature": transaction_data.status_signature || null
                            }
                        }
                    }
                }
            };

            return Response.json({
                success: true,
                message_type: 'pacs.002',
                message: pacs002,
                lei_embedded: true
            });
        }

        return Response.json({
            success: false,
            error: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        console.error('ISO 20022 handler error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});