import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import QRCode from 'qrcode.react';
import qs from 'query-string';

import Qr from './components/Qr';
import AmountPicker from './components/AmountPicker';
import ManualCopy from './components/ManualCopy';
import { RECIPIENT, MAX_LN_PAYMENT, DOMAIN } from './config';
import './css/main.scss';
import logo from './img/logo.png';
import Invoicer from './invoicer';

class App extends Component {
  static getInitialAmountInSats() {
    const { amount } = qs.parse(window.location.search);

    if (!amount) {
      return 0;
    }

    const initialAmount = parseFloat(amount);
    if (Number.isNaN(initialAmount)) {
      return 0;
    }

    // assume Bitcoin
    if (initialAmount < 1) {
      return initialAmount * 1e8;
    }

    // assume sats
    return initialAmount;
  }

  constructor(props) {
    super(props);
    this.state = {
      first: true,
      sats: App.getInitialAmountInSats(),
      connString: '',
    };

    this.copyFn = this.copyFn.bind(this);
    this.updateAmount = this.updateAmount.bind(this);
  }

  async componentDidMount() {
    const { protocol, host, pathname } = window.location;
    window.history.replaceState(
      {},
      document.title,
      protocol + '//' + host + pathname,
    );

    const { sats = 0 } = this.state;

    await this.updateAmount(sats);
    await this.setConnString();
  }

  copyFn(copied) {
    this.setState({ copied });
  }

  async updateAmount(sats) {
    const { first, sats: prevSats, address: prevAddress } = this.state;

    if (sats === prevSats && !first) {
      return;
    }

    this.setState({ sats: -1, first: false });

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
      const { address, bolt11, hash } = await Invoicer.newPayment(sats, only);
      this.setState({ bolt11, hash });

      if (prevAddress === undefined) {
        this.setState({ address });
      }
    }

    this.setState({ sats });
  }

  async setConnString() {
    const info = await Invoicer.nodeInfo();

    if (!info || info.length === 0) {
      this.setState({ connString: 'Unknown at this time' });
      return;
    }

    let connString = info[0];

    if (!!DOMAIN && DOMAIN.length > 0) {
      const parts = connString.split(/([@:])/);

      connString = `${parts[0]}@${DOMAIN}`;

      if (parts.length === 5) {
        connString += `:${parts[4]}`;
      }
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

        <AmountPicker
          min={0}
          max={1e7}
          amount={sats}
          updateAmount={this.updateAmount}
        />

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
            copied={copied}
          >
            <QRCode value={connString} size={250} renderAs="svg" />
          </ManualCopy>
        </div>
      </div>
    );
  }
}

export default hot(module)(App);
