import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Radio, RadioGroup } from '@material-ui/core';
import { FormControl, FormControlLabel } from '@material-ui/core';

/** Service direction picker for RouteSchedule and RouteStopList */
class DirectionPicker extends React.Component {
  render() {
    return (
      <FormControl component="fieldset" required>
        <RadioGroup name="directions" value={this.props.currentDirection} onChange={this.props.onChange}>
          {this.props.directions.map((s, i) => (
            <FormControlLabel key={s} value={s} control={<Radio/>} label={window.innerWidth > 650 ? `${_.capitalize(s)} to ${this.props.between[i]}` : `${_.capitalize(s)}`} />
          ))}
        </RadioGroup>
      </FormControl>
    );
  }
}

DirectionPicker.propTypes = {
  directions: PropTypes.array.isRequired,
  currentDirection: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  between: PropTypes.array.isRequired
}

export default DirectionPicker;