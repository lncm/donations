import { INFO_URL, PAYMENT_URL, RECIPIENT } from './config';
import { AmountPicker } from './components';
import { fetch } from './modules';

const description = (satoshis, isDonation = true, to = RECIPIENT) => {
  const amount = (satoshis !== 0) ? ` of ${AmountPicker.labelFor(satoshis)}` : '';

  return `${isDonation ? 'Donation' : 'Payment'}${amount} to ${to}`;
};

/*
This class serves as a communication layer with invoicer,
see: https://github.com/lncm/invoicer
*/

export default {
  description,

  /*
  newPayment POSTs to Invoicer requesting either:
  (LN invoice AND bitcoin address) or (just LN invoice),
  if Bitcoin address have already been fetched for this session.
  */
  newPayment: (satoshis, only) => fetch(PAYMENT_URL, {
    method: 'POST',
    body: JSON.stringify({
      amount: parseInt(satoshis, 10),
      desc: description(satoshis, true),
      only,
    }),
  }),

  /*
  trackPayment long-polls GET Invoicer for status changes in regards to
  payment status changes, either LN being paid, Bitcoin tx being broadcast,
  or both at the same time.
  */
  trackPayment: (hash, address) => {
    const queryParams = new URLSearchParams(
      Object.entries({ hash, address, flexible: true }),
    ).toString();

    return fetch(`${PAYMENT_URL}?${queryParams}`);
  },

  /*
  nodeInfo GETs and returns an array of all connections strings that lnd
  announces.  Currently always one.  Later hopefully *also* Tor.
  */
  nodeInfo: () => fetch(INFO_URL),
};
