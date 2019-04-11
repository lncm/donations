import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const MySlider = Slider.createSliderWithTooltip(Slider);

const sliderCurve = v => (v === 0 ? 0 : Math.exp(v));
const inverseCurve = Math.log;

class AmountPicker extends Component {
  static labelFor(x) {
    if (x === 0) {
      return 'Custom';
    }

    if (x < 1e3) {
      return `${Math.round(x)} sat`;
    }

    if (x === 1e3 || x === 1e4 || x === 1e5) {
      return `${x / 1e3}k sat`;
    }

    if (x < 1e6) {
      const formatted = Math.round(x)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      return `${formatted} sat`;
    }

    if (x === 1e6 || x === 1e7) {
      return `${x / 1e8} BTC`;
    }

    return `${(x / 1e8).toFixed(8)} BTC`;
  }

  static generateMarks(start, end) {
    if (start !== 0 && start !== 1 && !Number.isInteger(Math.log10(start))) {
      throw new Error('`start` must be 0, 1 or a multiple of 10');
    }

    if (!Number.isInteger(Math.log10(end))) {
      throw new Error('`end` must be a multiple of 10');
    }

    const marks = {};
    marks[inverseCurve(start)] = AmountPicker.labelFor(start);

    for (let i = 10 * (!start ? 1 : start); i <= end; i *= 10) {
      marks[inverseCurve(i)] = AmountPicker.labelFor(i);
    }

    return marks;
  }

  constructor(x) {
    super(x);

    this.handleAfterChange = this.handleAfterChange.bind(this);
  }

  handleAfterChange(value) {
    const { updateAmount } = this.props;
    const sats = Math.round(sliderCurve(value));

    updateAmount(sats);
  }

  render() {
    const { min, max, amount } = this.props;

    return (
      <MySlider
        defaultValue={inverseCurve(amount)}
        min={inverseCurve(!min ? 1 : min)}
        max={inverseCurve(max)}
        marks={AmountPicker.generateMarks(min, max)}
        step={(inverseCurve(max) - inverseCurve(!min ? 1 : min)) / (max / 10)}
        railStyle={{ backgroundColor: 'gold' }}
        trackStyle={{ backgroundColor: 'goldenrod' }}
        handleStyle={{ backgroundColor: 'goldenrod' }}
        activeDotStyle={{ borderColor: 'goldenrod' }}
        dotStyle={{ borderColor: 'gold' }}
        tipFormatter={value =>
          !value
            ? 'Specify in wallet'
            : AmountPicker.labelFor(sliderCurve(value))
        }
        onAfterChange={this.handleAfterChange}
      />
    );
  }
}

AmountPicker.propTypes = {
  updateAmount: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  amount: PropTypes.number,
};

export default AmountPicker;
