export type PAYMENT_TERMS_TYPE =
  | 'ADVANCE_PAYMENT'
  | 'OUTSTANDING_BALANCE'
  | 'CREDIT'
  | 'ADVANCE_PAYMENT_OUTSTANDING_BALANCE'
  | 'ADVANCE_PAYMENT_CREDIT';


  export const PAYMENT_TERMS_TYPE_ITEM: Record<PAYMENT_TERMS_TYPE, string> = {
    'ADVANCE_PAYMENT': 'Pago anticipado',
    'OUTSTANDING_BALANCE': 'Pago pendiente',
    'CREDIT': 'Crédito',
    'ADVANCE_PAYMENT_OUTSTANDING_BALANCE': 'Pago pendiente de pago anticipado',
    'ADVANCE_PAYMENT_CREDIT': 'Crédito por pago anticipado'
  };