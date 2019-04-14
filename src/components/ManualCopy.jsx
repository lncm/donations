import React from 'react';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';

// ManualCopy allows for manual copy of an element.  It does so by exposing two
//    ways to do it:
//      1. An input field prepopulated with the value specified via `text`
//      2. A copy button that once pressed copies `text` value to user's clipboard
//
// Allowed attributes:
//    `text` string - this is the value to be copy-able
//    `label` string - a label to be used to describe what the `text` is
//    `copyFn` fn(string) - a function that's called after copy button is pressed
//    `copied` string - previously copied value.  Should be maintained by the
//        parent component.
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
  copyFn: PropTypes.func,
  copied: PropTypes.string,
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
