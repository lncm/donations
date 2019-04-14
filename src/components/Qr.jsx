import React, { Component } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import Loader from 'react-loader-spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
} from '@fortawesome/free-regular-svg-icons';
import { MAX_LN_PAYMENT } from '../config';

export const STATE_LOADING = 'loading';
export const STATE_PENDING = 'pending';
export const STATE_EXPIRED = 'expired';
export const STATE_PAID = 'paid';

// Qr displays a QR code of a payment.  It can occur in four states:

//
//    The attributes it accepts are:
//      `sats` int - a value of the payment
//      `bolt11` string - raw LN invoice
//      `address` string - bitcoin address to receive a payment to
//      `state` one_of(STATE_*) - state in which the QR should be displayed in:
//          `STATE_LOADING` -  shows loader; a state when the amount is known, but the
//              invoice wasn't fetched yet
//          `STATE_PENDING` - everything is ready is displayed, and we're waiting for
//              user's payment
//          `STATE_EXPIRED` - displayed invoice has expired
//          `STATE_PAID` - user has paid the invoice successfully
class Qr extends Component {
  // formatString takes all available data and returns either BIP21, BOLT11 or
  //    a hybrid.
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
      str += `amount=${(sats / 1e8).toFixed(8).replace(/\.*0+$/, '')}`;

      if (!bolt11 || sats >= MAX_LN_PAYMENT) {
        return str;
      }

      str += '&';
    }

    return `${str}lightning=${bolt11.toUpperCase()}`;
  }

  render() {
    const { state } = this.props;

    if (state === STATE_LOADING) {
      return (
        <div className="qr qr-loading">
          <Loader type="MutatingDot" height="100" width="100" />
        </div>
      );
    }

    const value = this.formatString();
    return (
      <a className={`qr qr-${state}`} href={value}>
        <div className="qr-overlay qr-success">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>
            <b>
              Payment received&nbsp;
              <span role="img" aria-label="celebration">
                🎉
              </span>
            </b>
            <br />
            Thank you!&nbsp;
            <span role="img" aria-label="gratitude">
              🙌🏻
            </span>
          </span>
        </div>

        <div className="qr-overlay qr-fail">
          <FontAwesomeIcon icon={faTimesCircle} />
          <span>
            <b>
              Invoice expired&nbsp;
              <span role="img" aria-label="time's up">
                ⌛️
              </span>
            </b>
            <br />
            You can try again by selecting another value on the bottom&nbsp;
            <span role="img" aria-label="point down">
              👇🏻
            </span>
          </span>
        </div>

        <QRCode className="qr-code" value={value} size={500} renderAs="svg" />
      </a>
    );
  }
}

Qr.propTypes = {
  sats: PropTypes.number,
  bolt11: PropTypes.string,
  address: PropTypes.string,
  state: PropTypes.oneOf([
    STATE_LOADING,
    STATE_PENDING,
    STATE_EXPIRED,
    STATE_PAID,
  ]),
};

Qr.defaultProps = {
  sats: -1,
  state: STATE_LOADING,
};

export default Qr;
