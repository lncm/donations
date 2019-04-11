import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import QRCode from 'qrcode.react';

import Qr from './components/Qr';
import AmountPicker from './components/AmountPicker';
import ManualCopy from './components/ManualCopy';
import {
  RECIPIENT,
  PAYMENT_URL,
  INFO_URL,
  MAX_LN_PAYMENT,
  DOMAIN,
} from './config';
import './css/main.scss';
import logo from './img/logo.png';

class App extends Component {
  static description(sats, isDonation = true, to = RECIPIENT) {
    const humanAmount = AmountPicker.labelFor(sats);
    return `${isDonation ? 'Donation' : 'Payment'} of ${humanAmount} to ${to}`;
  }

  static async newPayment(sats, only) {
    const body = {
      amount: parseInt(sats, 10),
      desc: App.description(sats, true),
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

  constructor(props) {
    super(props);
    this.state = {
      sats: -1,
      connString: '',
    };

    this.copyFn = this.copyFn.bind(this);
    this.updateAmount = this.updateAmount.bind(this);
  }

  async componentDidMount() {
    await this.updateAmount(0);
    await this.setConnString();
  }

  copyFn(copied) {
    this.setState({ copied });
  }

  async updateAmount(sats) {
    const { sats: prevSats, address: prevAddress } = this.state;

    if (sats === prevSats) {
      return;
    }

    this.setState({ sats: -1 });

    let only;
    if (prevAddress !== undefined) {
      only = 'ln';
    }

    if (sats >= MAX_LN_PAYMENT) {
      this.setState({ bolt11: '', hash: '' });

      if (prevAddress === undefined) {
        only = 'btc';
      }
    }

    if (sats <= MAX_LN_PAYMENT || prevAddress === undefined) {
      const { address, bolt11, hash } = await App.newPayment(sats, only);
      this.setState({ bolt11, hash });

      if (prevAddress === undefined) {
        this.setState({ address });
      }
    }

    this.setState({ sats });
  }

  async setConnString() {
    const info = await App.nodeInfo();

    if (!info || info.length === 0) {
      this.setState({ connString: 'Unknown at this time' });
      return;
    }

    const parts = info[0].split(/([@:])/);

    let connString = `${parts[0]}@${DOMAIN}`;

    if (parts.length === 5) {
      connString += `:${parts[4]}`;
    }

    this.setState({ connString });
  }

  render() {
    const { sats, bolt11, address, connString, copied } = this.state;

    let invoiceAmount;
    if (sats === -1) {
      invoiceAmount = 'Loading…';
    } else if (sats === 0) {
      invoiceAmount = 'Any';
    } else {
      invoiceAmount = AmountPicker.labelFor(sats);
    }

    return (
      <div id="app">
        <div id="logo">
          <img alt="logo" src={logo} />
          <h2>
            Donate to <b>{RECIPIENT}</b>
          </h2>
        </div>

        <Qr sats={sats} bolt11={bolt11} address={address} />

        <p id="choice">
          Invoice Amount: <b>{invoiceAmount}</b>
        </p>

        <AmountPicker min={0} max={1e7} updateAmount={this.updateAmount} />

        <div className="manuals">
          <ManualCopy
            label="BOLT11 Invoice"
            text={bolt11}
            copyFn={this.copyFn}
            copied={copied}
          />
          <ManualCopy
            label="Bitcoin Address"
            text={address}
            copyFn={this.copyFn}
            copied={copied}
          />
          <ManualCopy
            label="Connection String"
            text={connString}
            copyFn={this.copyFn}
            copied={copied}>
            <QRCode value={connString} size={250} renderAs="svg" />
          </ManualCopy>
        </div>
      </div>
    );
  }
}

export default hot(module)(App);
