import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * ISO 20022 Message Handler
 * Handles conversion between internal transaction format and ISO 20022 standard
 */

// Generate ISO 20022 compliant Message ID
export function generateMsgId() {
    return `MSG${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

// Generate ISO 20022 End-to-End ID
export function generateEndToEndId(merchantId, transactionId) {
    return `E2E${merchantId.substring(0, 8)}${transactionId.substring(0, 12)}`.toUpperCase();
}

// Convert internal transaction to ISO 20022 pain.001 (Payment Initiation)
export function toISO20022PaymentInitiation(transaction, merchant) {
    return {
        GrpHdr: {
            MsgId: transaction.iso20022_message_id || generateMsgId(),
            CreDtTm: new Date(transaction.created_date).toISOString(),
            NbOfTxs: "1",
            CtrlSum: transaction.amount,
            InitgPty: {
                Nm: merchant?.business_name || transaction.merchant_name,
                Id: {
                    OrgId: {
                        Othr: {
                            Id: transaction.merchant_id
                        }
                    }
                }
            }
        },
        PmtInf: {
            PmtInfId: transaction.iso20022_payment_info_id || `PMT${transaction.transaction_id}`,
            PmtMtd: "CARD",
            PmtTpInf: {
                SvcLvl: {
                    Cd: transaction.type === "sale" ? "SEPA" : "NURG"
                },
                LclInstrm: {
                    Cd: transaction.payment_method || "CARD"
                },
                CtgyPurp: {
                    Cd: "SUPP"
                }
            },
            ReqdExctnDt: new Date(transaction.created_date).toISOString().split('T')[0],
            Dbtr: {
                Nm: transaction.customer_name || "Unknown",
                PstlAdr: {
                    Ctry: transaction.customer_country || "XX"
                }
            },
            DbtrAcct: {
                Id: {
                    Othr: {
                        Id: transaction.card_number || `****${transaction.card_last_four}`
                    }
                }
            },
            DbtrAgt: {
                FinInstnId: {
                    BIC: transaction.issuer_bank || "UNKNOWN"
                }
            },
            CdtTrfTxInf: [{
                PmtId: {
                    InstrId: transaction.transaction_id,
                    EndToEndId: transaction.iso20022_end_to_end_id || generateEndToEndId(transaction.merchant_id, transaction.transaction_id),
                    TxId: transaction.iso20022_transaction_id || transaction.transaction_id
                },
                Amt: {
                    InstdAmt: {
                        Ccy: transaction.currency || "USD",
                        Value: transaction.amount
                    }
                },
                ChrgBr: transaction.iso20022_charge_bearer || "SLEV",
                Cdtr: {
                    Nm: merchant?.business_name || transaction.merchant_name
                },
                CdtrAcct: {
                    Id: {
                        Othr: {
                            Id: transaction.mid
                        }
                    }
                },
                RmtInf: {
                    Ustrd: transaction.description || `Payment for transaction ${transaction.transaction_id}`
                }
            }]
        }
    };
}

// Convert internal transaction to ISO 20022 pacs.008 (Financial Institution Transfer)
export function toISO20022FITransfer(transaction, merchant) {
    return {
        GrpHdr: {
            MsgId: transaction.iso20022_message_id || generateMsgId(),
            CreDtTm: new Date(transaction.created_date).toISOString(),
            NbOfTxs: "1",
            TtlIntrBkSttlmAmt: {
                Ccy: transaction.currency || "USD",
                Value: transaction.amount
            },
            IntrBkSttlmDt: transaction.settlement_date || new Date().toISOString().split('T')[0],
            SttlmInf: {
                SttlmMtd: "CLRG"
            }
        },
        CdtTrfTxInf: [{
            PmtId: {
                InstrId: transaction.transaction_id,
                EndToEndId: transaction.iso20022_end_to_end_id || generateEndToEndId(transaction.merchant_id, transaction.transaction_id),
                TxId: transaction.iso20022_transaction_id || transaction.transaction_id,
                UETR: transaction.iso20022_uetr
            },
            IntrBkSttlmAmt: {
                Ccy: transaction.currency || "USD",
                Value: transaction.amount
            },
            ChrgBr: transaction.iso20022_charge_bearer || "SLEV",
            Dbtr: {
                Nm: transaction.customer_name || "Unknown"
            },
            DbtrAgt: {
                FinInstnId: {
                    BIC: transaction.issuer_bank || "UNKNOWN"
                }
            },
            CdtrAgt: {
                FinInstnId: {
                    BIC: merchant?.bank_code || "UNKNOWN"
                }
            },
            Cdtr: {
                Nm: merchant?.business_name || transaction.merchant_name
            },
            RmtInf: {
                Ustrd: transaction.description || `Payment for transaction ${transaction.transaction_id}`
            }
        }]
    };
}

// Convert internal transaction to ISO 20022 pain.002 (Payment Status Report)
export function toISO20022PaymentStatus(transaction) {
    const statusMap = {
        'approved': 'ACCP', // Accepted Customer Payment
        'settled': 'ACSC', // Accepted Settlement Completed
        'pending': 'PDNG', // Pending
        'declined': 'RJCT', // Rejected
        'failed': 'RJCT',
        'processing': 'ACTC' // Accepted Technical Validation
    };

    return {
        GrpHdr: {
            MsgId: generateMsgId(),
            CreDtTm: new Date().toISOString()
        },
        OrgnlGrpInfAndSts: {
            OrgnlMsgId: transaction.iso20022_message_id,
            OrgnlMsgNmId: "pain.001.001.03",
            GrpSts: statusMap[transaction.status] || 'PDNG'
        },
        TxInfAndSts: [{
            StsId: transaction.transaction_id,
            OrgnlEndToEndId: transaction.iso20022_end_to_end_id,
            OrgnlTxId: transaction.iso20022_transaction_id,
            TxSts: statusMap[transaction.status] || 'PDNG',
            StsRsnInf: transaction.status === 'declined' || transaction.status === 'failed' ? [{
                Rsn: {
                    Cd: transaction.response_code || "AC01"
                },
                AddtlInf: transaction.response_message
            }] : undefined
        }]
    };
}

// Parse ISO 20022 message and extract transaction data
export function fromISO20022PaymentInitiation(iso20022Message) {
    const pmtInf = iso20022Message.PmtInf;
    const cdtTrfTxInf = pmtInf.CdtTrfTxInf[0];
    
    return {
        iso20022_message_id: iso20022Message.GrpHdr.MsgId,
        iso20022_payment_info_id: pmtInf.PmtInfId,
        iso20022_end_to_end_id: cdtTrfTxInf.PmtId.EndToEndId,
        iso20022_transaction_id: cdtTrfTxInf.PmtId.TxId,
        transaction_id: cdtTrfTxInf.PmtId.InstrId,
        amount: cdtTrfTxInf.Amt.InstdAmt.Value,
        currency: cdtTrfTxInf.Amt.InstdAmt.Ccy,
        customer_name: pmtInf.Dbtr?.Nm,
        customer_country: pmtInf.Dbtr?.PstlAdr?.Ctry,
        description: cdtTrfTxInf.RmtInf?.Ustrd,
        iso20022_charge_bearer: cdtTrfTxInf.ChrgBr,
        payment_method: pmtInf.PmtTpInf?.LclInstrm?.Cd,
        created_date: new Date(iso20022Message.GrpHdr.CreDtTm)
    };
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, transaction_id, format } = await req.json();

        if (!action) {
            return Response.json({ error: 'Action required' }, { status: 400 });
        }

        // Fetch transaction
        const transactions = await base44.asServiceRole.entities.Transaction.filter({ transaction_id });
        if (transactions.length === 0) {
            return Response.json({ error: 'Transaction not found' }, { status: 404 });
        }
        const transaction = transactions[0];

        // Fetch merchant
        const merchants = await base44.asServiceRole.entities.Merchant.filter({ merchant_id: transaction.merchant_id });
        const merchant = merchants[0];

        let result;

        switch (action) {
            case 'to_payment_initiation':
                result = toISO20022PaymentInitiation(transaction, merchant);
                break;
            
            case 'to_fi_transfer':
                result = toISO20022FITransfer(transaction, merchant);
                break;
            
            case 'to_payment_status':
                result = toISO20022PaymentStatus(transaction);
                break;
            
            case 'generate_ids':
                // Generate and update ISO 20022 IDs for transaction
                const updates = {
                    iso20022_message_id: generateMsgId(),
                    iso20022_end_to_end_id: generateEndToEndId(transaction.merchant_id, transaction.transaction_id),
                    iso20022_transaction_id: transaction.transaction_id,
                    iso20022_payment_info_id: `PMT${transaction.transaction_id}`
                };
                await base44.asServiceRole.entities.Transaction.update(transaction.id, updates);
                result = updates;
                break;
            
            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

        return Response.json({
            success: true,
            format: 'ISO 20022',
            data: result
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});