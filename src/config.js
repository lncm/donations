export const DOMAIN = 'meedamian.ddns.net';
export const INVOICER_PORT = 2048;
export const PAYMENT_URL = `http://${DOMAIN}:${INVOICER_PORT}/api/payment`;
export const INFO_URL = `http://${DOMAIN}:${INVOICER_PORT}/api/info`;
export const RECIPIENT = 'LNCM';

export const MAX_LN_PAYMENT = 2 ** 32; // 4294967;
