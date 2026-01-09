export type PAYMENT_TERMS_TYPE =
  | 'ADVANCE_PAYMENT'
  | 'OUTSTANDING_BALANCE'
  | 'CREDIT'
  | 'ADVANCE_PAYMENT_OUTSTANDING_BALANCE'
  | 'ADVANCE_PAYMENT_CREDIT';

export const PAYMENT_TERMS_TYPE_ITEM: Record<PAYMENT_TERMS_TYPE, string> = {
  ADVANCE_PAYMENT: 'Pago anticipado',
  OUTSTANDING_BALANCE: 'Pago pendiente',
  CREDIT: 'Crédito',
  ADVANCE_PAYMENT_OUTSTANDING_BALANCE: 'Pago anticipado + pago pendiente',
  ADVANCE_PAYMENT_CREDIT: 'Pago anticipado + Crédito',
};

export type TermConfig = {
  adv?: number;
  credit?: number;
  balance?: number;
  days?: number;
  disableAdv: boolean;
};

export const TERM_CONFIG: Record<PAYMENT_TERMS_TYPE, TermConfig> = {
  ADVANCE_PAYMENT: {
    adv: 100,
    credit: 0,
    balance: 0,
    days: 0,
    disableAdv: true,
  },
  OUTSTANDING_BALANCE: {
    adv: 100,
    credit: 0,
    balance: 0,
    days: 0,
    disableAdv: true,
  },
  CREDIT: { adv: 0, balance: 0, disableAdv: true },
  ADVANCE_PAYMENT_OUTSTANDING_BALANCE: {
    credit: 0,
    days: 0,
    disableAdv: false,
  },
  ADVANCE_PAYMENT_CREDIT: { adv: 0, balance: 0, disableAdv: false },
};
