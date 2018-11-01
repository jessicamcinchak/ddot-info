import React from 'react';
import PropTypes from 'prop-types';

import routeDetails from '../data/routeDetails.js';
import _ from 'lodash';
import RouteHeader from './RouteHeader';
import RouteMap from './RouteMap';
import RouteDetails from './RouteDetails';
import Helpers from '../helpers';

/** Top level component for /route/{#} page */
class BusRoute extends React.Component {
 
  render() {
    const route = _.find(routeDetails, a => { return a.number === parseInt(this.props.match.params.name, 10) });
    
    return (
      <div className="BusRoute" style={{ background: Helpers.colors['background'] }}>
        <RouteHeader number={this.props.match.params.name} page={this.props.match.url.split("/").slice(-1)} />
        <RouteMap route={route} />
        <RouteDetails id={this.props.match.params.name} />
      </div>
    );
  }
}

BusRoute.propTypes = {
  match: PropTypes.shape({
    isExact: PropTypes.bool,
    params: PropTypes.shape({
      name: PropTypes.string,
    }),
    path: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
}

export default BusRoute;
