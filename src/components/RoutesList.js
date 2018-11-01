import React, { Component } from 'react';
import PropTypes from 'prop-types';

import RouteLink from './RouteLink';

/** List of all routes matching search input for RouteSearch on Homepage */
class RoutesList extends Component {

  render() {

    const gridStyle = {
      display: 'grid', 
      gridTemplateColumns: `repeat(auto-fit, minmax(350px, 1fr))`, 
      gridGap: `.5em`, 
      maxHeight: 370, 
      overflowY: 'scroll',
      boxSizing: 'border-box',
      padding: 10
    }

    console.log(this.props.lines)
    return (
      <div style={gridStyle}>
        {this.props.lines.map(line =>
          <RouteLink key={line.number} id={line.number.toString()} routeId={line.rt_id} icons />
        )}
      </div>
    );

  }
}

RoutesList.propTypes = {
  lines: PropTypes.arrayOf(PropTypes.shape({
    agencyId: PropTypes.string,
    color: PropTypes.string,
    description: PropTypes.string,
    id: PropTypes.string,
    textColor: PropTypes.string,
    type: PropTypes.number,
    url: PropTypes.string,
  })).isRequired,
}

export default RoutesList;
