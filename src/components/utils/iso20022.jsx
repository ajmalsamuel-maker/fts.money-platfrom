// ISO 20022 Payment Message Standards
// References: moov-io/iso20022, pain001, AWS samples

// ISO 20022 Message Types
export const MESSAGE_TYPES = {
    PACS_008: 'pacs.008.001.08', // Financial Institution Credit Transfer
    PACS_009: 'pacs.009.001.08', // Financial Institution Credit Transfer Return
    PAIN_001: 'pain.001.001.09', // Customer Credit Transfer Initiation
    PAIN_002: 'pain.002.001.10', // Customer Payment Status Report
    CAMT_053: 'camt.053.001.08', // Bank to Customer Statement
    CAMT_054: 'camt.054.001.08', // Bank to Customer Debit/Credit Notification
};

// Generate ISO 20022 pacs.008 Message (Credit Transfer)
export const generatePacs008 = (transaction) => {
    const msgId = `${transaction.merchant_id}-${Date.now()}`;
    const endToEndId = transaction.iso20022_end_to_end_id || `E2E-${transaction.transaction_id}`;
    const txId = transaction.iso20022_transaction_id || `TXN-${transaction.transaction_id}`;
    
    return {
        FIToFICstmrCdtTrf: {
            GrpHdr: {
                MsgId: msgId,
                CreDtTm: new Date().toISOString(),
                NbOfTxs: '1',
                TtlIntrBkSttlmAmt: {
                    _: transaction.amount.toFixed(2),
                    Ccy: transaction.currency || 'USD'
                },
                IntrBkSttlmDt: new Date().toISOString().split('T')[0],
                SttlmInf: {
                    SttlmMtd: 'CLRG',
                    ClrSys: {
                        Cd: 'RT1' // Real-time
                    }
                }
            },
            CdtTrfTxInf: {
                PmtId: {
                    InstrId: msgId,
                    EndToEndId: endToEndId,
                    TxId: txId,
                    UETR: transaction.iso20022_uetr || generateUETR()
                },
                PmtTpInf: {
                    InstrPrty: transaction.iso20022_instruction_priority || 'NORM',
                    SvcLvl: {
                        Cd: 'SEPA'
                    },
                    LclInstrm: {
                        Cd: transaction.iso20022_purpose_code || 'SUPP'
                    },
                    CtgyPurp: {
                        Cd: transaction.iso20022_category_purpose || 'CASH'
                    }
                },
                IntrBkSttlmAmt: {
                    _: transaction.amount.toFixed(2),
                    Ccy: transaction.currency || 'USD'
                },
                IntrBkSttlmDt: new Date().toISOString().split('T')[0],
                ChrgBr: transaction.iso20022_charge_bearer || 'SLEV',
                Dbtr: {
                    Nm: transaction.customer_name,
                    PstlAdr: {
                        Ctry: transaction.customer_country || 'US'
                    }
                },
                DbtrAcct: {
                    Id: {
                        IBAN: transaction.debtor_iban || generateIBAN(transaction.customer_country)
                    }
                },
                DbtrAgt: {
                    FinInstnId: {
                        BIC: transaction.debtor_bic || 'BOFAUS3NXXX'
                    }
                },
                CdtrAgt: {
                    FinInstnId: {
                        BIC: transaction.creditor_bic || 'CHASUS33XXX'
                    }
                },
                Cdtr: {
                    Nm: transaction.merchant_name,
                    PstlAdr: {
                        Ctry: transaction.country || 'US'
                    }
                },
                CdtrAcct: {
                    Id: {
                        IBAN: transaction.creditor_iban || generateIBAN(transaction.country)
                    }
                },
                RmtInf: {
                    Ustrd: transaction.description || `Payment ${transaction.transaction_id}`
                }
            }
        }
    };
};

// Generate ISO 20022 pain.001 Message (Customer Initiation)
export const generatePain001 = (transaction) => {
    const msgId = `PAIN-${Date.now()}`;
    const pmtInfId = `PMT-${transaction.transaction_id}`;
    
    return {
        CstmrCdtTrfInitn: {
            GrpHdr: {
                MsgId: msgId,
                CreDtTm: new Date().toISOString(),
                NbOfTxs: '1',
                CtrlSum: transaction.amount.toFixed(2),
                InitgPty: {
                    Nm: transaction.customer_name,
                    Id: {
                        OrgId: {
                            Othr: {
                                Id: transaction.customer_email
                            }
                        }
                    }
                }
            },
            PmtInf: {
                PmtInfId: pmtInfId,
                PmtMtd: 'TRF',
                BtchBookg: false,
                NbOfTxs: '1',
                CtrlSum: transaction.amount.toFixed(2),
                PmtTpInf: {
                    InstrPrty: 'NORM',
                    SvcLvl: {
                        Cd: 'SEPA'
                    }
                },
                ReqdExctnDt: new Date().toISOString().split('T')[0],
                Dbtr: {
                    Nm: transaction.customer_name
                },
                DbtrAcct: {
                    Id: {
                        IBAN: transaction.debtor_iban
                    }
                },
                DbtrAgt: {
                    FinInstnId: {
                        BIC: transaction.debtor_bic
                    }
                },
                ChrgBr: 'SLEV',
                CdtTrfTxInf: {
                    PmtId: {
                        EndToEndId: `E2E-${transaction.transaction_id}`,
                        TxId: `TXN-${transaction.transaction_id}`
                    },
                    Amt: {
                        InstdAmt: {
                            _: transaction.amount.toFixed(2),
                            Ccy: transaction.currency || 'USD'
                        }
                    },
                    CdtrAgt: {
                        FinInstnId: {
                            BIC: transaction.creditor_bic
                        }
                    },
                    Cdtr: {
                        Nm: transaction.merchant_name
                    },
                    CdtrAcct: {
                        Id: {
                            IBAN: transaction.creditor_iban
                        }
                    },
                    RmtInf: {
                        Ustrd: transaction.description || `Payment ${transaction.transaction_id}`
                    }
                }
            }
        }
    };
};

// Generate UETR (Unique End-to-End Transaction Reference) - RFC 4122 v4 UUID
const generateUETR = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Generate sample IBAN (for demo purposes)
const generateIBAN = (country = 'US') => {
    const countryCode = (country || 'US').substring(0, 2).toUpperCase();
    const checkDigits = '89';
    const bankCode = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const accountNumber = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    return `${countryCode}${checkDigits}${bankCode}${accountNumber}`;
};

// Parse ISO 20022 Response
export const parseISO20022Response = (xmlString) => {
    // Simple parser for demonstration
    return {
        status: 'ACTC', // Accepted Technical Validation
        messageId: extractValue(xmlString, 'MsgId'),
        transactionId: extractValue(xmlString, 'TxId'),
        statusReasonCode: extractValue(xmlString, 'Cd'),
    };
};

const extractValue = (xml, tag) => {
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`);
    const match = xml.match(regex);
    return match ? match[1] : null;
};

// Charge Bearer Codes
export const CHARGE_BEARER = {
    DEBT: 'Debtor bears all charges',
    CRED: 'Creditor bears all charges',
    SHAR: 'Shared between debtor and creditor',
    SLEV: 'Service level charges apply'
};

// Purpose Codes (Common)
export const PURPOSE_CODES = {
    CASH: 'Cash Management Transfer',
    CORT: 'Trade Settlement',
    DVPM: 'Delivery Versus Payment',
    INTC: 'Intra-Company Payment',
    SUPP: 'Supplier Payment',
    SALA: 'Salary Payment',
    TREA: 'Treasury Payment',
    TAXS: 'Tax Payment',
    VATX: 'Value Added Tax Payment',
    GDDS: 'Purchase of Goods',
    SERV: 'Purchase of Services'
};

// Convert Transaction to ISO 20022
export const transactionToISO20022 = (transaction, messageType = 'pacs.008') => {
    switch (messageType) {
        case 'pacs.008':
            return generatePacs008(transaction);
        case 'pain.001':
            return generatePain001(transaction);
        default:
            return generatePacs008(transaction);
    }
};