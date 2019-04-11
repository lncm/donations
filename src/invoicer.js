import { INFO_URL, PAYMENT_URL, RECIPIENT } from './config';
import AmountPicker from './components/AmountPicker';

class Invoicer {
  static description(sats, isDonation = true, to = RECIPIENT) {
    const humanAmount = AmountPicker.labelFor(sats);
    return `${isDonation ? 'Donation' : 'Payment'} of ${humanAmount} to ${to}`;
  }

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

  static async nodeInfo() {
    return (await fetch(INFO_URL)).json();
  }
}

export default Invoicer;
