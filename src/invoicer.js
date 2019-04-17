import { INFO_URL, PAYMENT_URL, RECIPIENT } from './config';
import AmountPicker from './components/AmountPicker';

// This class serves as a communication layer with invoicer, see: https://github.com/lncm/invoicer
class Invoicer {
  // description prepares description for a LN invoice
  static description(sats, isDonation = true, to = RECIPIENT) {
    let amount = '';
    if (sats !== 0) {
      amount = ` of ${AmountPicker.labelFor(sats)}`;
    }

    return `${isDonation ? 'Donation' : 'Payment'}${amount} to ${to}`;
  }

  // newPayment POSTs to Invoicer requesting either:
  //    (LN invoice AND bitcoin address) or (just LN invoice),
  //    if Bitcoin address have already been fetched for this session.
  static async newPayment(sats, only) {
    const body = {
      amount: parseInt(sats, 10),
      desc: Invoicer.description(sats, true),
    };

    if (only) {
      body.only = only;
    }

    const resp = await fetch(PAYMENT_URL, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return resp.json();
  }

  // trackPayment long-polls GET Invoicer for status changes in regards to
  //    payment status changes, either LN being paid, Bitcoin tx being broadcast,
  //    or both at the same time.
  static async trackPayment(hash, address) {
    const query = new URLSearchParams(
      Object.entries({ hash, address, flexible: true }),
    ).toString();

    const resp = await fetch(`${PAYMENT_URL}?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return resp.json();
  }

  // nodeInfo GETs and returns an array of all connections strings that lnd
  //    announces.  Currently always one.  Later hopefully *also* Tor.
  static async nodeInfo() {
    return (await fetch(INFO_URL)).json();
  }
}

export default Invoicer;
