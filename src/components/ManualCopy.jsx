import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';

class ManualCopy extends Component {
  constructor() {
    super();

    this.state = {
      lastText: undefined,
    };
  }

  render() {
    const { text, label, children } = this.props;
    const { lastText } = this.state;

    return (
      <fieldset className="copy">
        <legend>{label}</legend>
        <input disabled value={text} />

        <CopyToClipboard
          disabled={!text || text.length === 0}
          text={text}
          onCopy={() => this.setState({ lastText: text })}
        >
          <button type="button">
            <FontAwesomeIcon
              icon={
                lastText === undefined || lastText !== text
                  ? faClipboard
                  : faClipboardCheck
              }
            />
          </button>
        </CopyToClipboard>
        {children}
      </fieldset>
    );
  }
}

ManualCopy.propTypes = {
  text: PropTypes.string,
  label: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string,
  ]),
};

ManualCopy.defaultProps = {
  text: '',
};

export default ManualCopy;
