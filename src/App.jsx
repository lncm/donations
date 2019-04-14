import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import QRCode from 'qrcode.react';
import qs from 'query-string';

import Qr, {
  STATE_LOADING,
  STATE_PENDING,
  STATE_EXPIRED,
  STATE_PAID,
} from './components/Qr';
import AmountPicker from './components/AmountPicker';
import ManualCopy from './components/ManualCopy';
import { RECIPIENT, MAX_LN_PAYMENT, DOMAIN } from './config';
import './css/main.scss';
import logo from './img/logo.png';
import Invoicer from './invoicer';

// That thing needs to be split into chunks probably…
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
      state: STATE_LOADING,
      connString: '',
    };

    this.copyFn = this.copyFn.bind(this);
    this.updateAmount = this.updateAmount.bind(this);
  }

  async componentDidMount() {
    // After amount has been red from the URL, get rid of it
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

    // TODO: possible case on first open where amount doesn't change 0 => 0
    if (sats === prevSats && !first) {
      return;
    }

    this.setState({ state: STATE_LOADING, first: false });

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

    this.setState({ sats, state: STATE_PENDING });

    (async () => {
      const status = await this.trackStatus();

      if (status.error && status.error === STATE_EXPIRED) {
        this.setState({ state: STATE_EXPIRED });
        return;
      }

      if (status.ln) {
        // const { amount, is_paid: isPaid } = status.ln;
        const { is_paid: isPaid } = status.ln;

        if (!isPaid) {
          // TODO: show error somehow
          return;
        }

        // TODO: show received `amount` somehow
        this.setState({ state: STATE_PAID });
        return;
      }

      if (status.bitcoin) {
        // const { address, amount, confirmations, txids } = status.bitcoin;
        const { amount } = status.bitcoin;

        if (amount === 0) {
          // TODO: show error somehow
          return;
        }

        // TODO: show more info about received bitcoin transaction somehow
        this.setState({ state: STATE_PAID });
      }
    })();
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

  trackStatus() {
    const { address, hash } = this.state;
    return Invoicer.trackPayment(hash, address);
  }

  render() {
    const { sats, bolt11, address, state, connString, copied } = this.state;

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
        <a href="https://lncm.io" id="logo">
          <img alt="logo" src={logo} />
          <h2>
            Donate to <b>{RECIPIENT}</b>
          </h2>
        </a>

        <Qr state={state} sats={sats} bolt11={bolt11} address={address} />

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
