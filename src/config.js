// DOMAIN points to the host name where invoicer resides
export const DOMAIN = 'meedamian.ddns.net';

// INVOICER_PORT defines port on which invoicer listens
export const INVOICER_PORT = 2048;

// following URLs define relevant Invoicer's API endpoins
export const PAYMENT_URL = `http://${DOMAIN}:${INVOICER_PORT}/api/payment`;
export const INFO_URL = `http://${DOMAIN}:${INVOICER_PORT}/api/info`;

// Used in Invoice descriptions, as well as header of the website
export const RECIPIENT = 'LNCM';

// Defines max allowed LN payment.  Max 2^32 per payment is currently defined in
// the spec
export const MAX_LN_PAYMENT = 2 ** 32; // = 4294967;
