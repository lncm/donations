import React, { Component } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import Loader from 'react-loader-spinner';
import { MAX_LN_PAYMENT } from '../config';

class Qr extends Component {
  formatString() {
    const { sats, bolt11, address } = this.props;

    if (!address && !bolt11) {
      return '';
    }

    if (!address) {
      return `lightning:${bolt11.toUpperCase()}`;
    }

    let str = `bitcoin:${address}`;

    if (sats > 0 || bolt11) {
      str += '?';
    }

    if (sats > 0) {
      str += `amount=${Number((sats / 1e8).toFixed(8)).toString()}`;

      if (!bolt11 || sats >= MAX_LN_PAYMENT) {
        return str;
      }

      str += '&';
    }

    return `${str}lightning=${bolt11.toUpperCase()}`;
  }

  render() {
    const { sats } = this.props;
    if (sats === -1) {
      return <Loader type="MutatingDot" height="100" width="100" />;
    }

    const value = this.formatString();
    return (
      <a id="qr" href={value}>
        <QRCode value={value} size={500} renderAs="svg" />
      </a>
    );
  }
}

Qr.propTypes = {
  sats: PropTypes.number,
  bolt11: PropTypes.string,
  address: PropTypes.string,
};

Qr.defaultProps = {
  sats: -1,
};

export default Qr;
