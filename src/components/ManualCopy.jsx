import React from 'react';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';

function ManualCopy(props) {
  const { text, label, children, copyFn, copied } = props;

  let copyContent;
  if (children !== undefined && !!text && text.length > 0) {
    copyContent = <div className="copy-extra">{children}</div>;
  }

  return (
    <fieldset className="copy">
      <legend>{label}</legend>
      <input disabled value={text} />

      <CopyToClipboard
        disabled={!text || text.length === 0}
        text={text}
        onCopy={() => copyFn(text)}
      >
        <FontAwesomeIcon
          icon={
            copied === undefined || copied !== text
              ? faClipboard
              : faClipboardCheck
          }
        />
      </CopyToClipboard>
      {copyContent}
    </fieldset>
  );
}

ManualCopy.propTypes = {
  text: PropTypes.string,
  label: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string,
  ]),
  copyFn: PropTypes.func,
  copied: PropTypes.string,
};

ManualCopy.defaultProps = {
  text: '',
};

export default ManualCopy;
