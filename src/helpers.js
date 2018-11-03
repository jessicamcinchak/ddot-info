import routeDetails from './data/routeDetails'
import _ from 'lodash';

const Helpers = {
  /**
   * Config vars
   */
  endpoint: `https://ddot-beta.herokuapp.com/api/api/where`,
  geocoder: `https://gis.detroitmi.gov/arcgis/rest/services/DoIT/StreetCenterlineLatLng/GeocodeServer/reverseGeocode`,
  mapboxStyle: `mapbox://styles/cityofdetroit/cjdev3yttex3c2trljmnm4hrz`,
  mapboxApiAccessToken: `pk.eyJ1IjoiY2l0eW9mZGV0cm9pdCIsImEiOiJjamNiY2RuZDcwMTV1MnF0MW9kbGo5YTlyIn0.5s818a6deB6YJJK4yFkMwQ`,


  /**
   * Colors & formatting
   */
  colors: {
    'northbound': '#c4c4c4',
    'eastbound': '#c4c4c4',
    'southbound': '#B0D27B',
    'westbound': '#B0D27B',
    'clockwise': 'rgb(23, 214, 42)',
    'background': 'rgba(0, 68, 69, 0.2)'  
  },
  lookup: {
    'eastbound': 'EB',
    'westbound': 'WB',
    'southbound': 'SB',
    'northbound': 'NB',
    'clockwise': 'CW'
  },

  /**
   * Translate a day of the week to its service range
   * @param {int}
   * @returns {string}
   */
  dowToService: function(dow) {
    if (dow === 0) {
      return 'sunday';
    } else if (dow === 6) {
      return 'saturday';
    } else { 
      return 'weekday';
    }
  },
  /**
   * Given a route ID, return the route details
   */
  getRouteDetails: function(number) {
    return routeDetails.filter(rd => rd.number === parseInt(number,10))[0]
  },

  /**
   * Given a list of trips, return unique route and direction
   */
  getUniqueRoutes: function(trips) {
    let uniqRouteDirection = _.uniqBy(trips, e => { return `${e.directionId}${e.routeId }`})
    let returned = uniqRouteDirection.map(u => {
      let route = _.filter(routeDetails, rd => { return rd.rt_id === parseInt(u.routeId, 10)})[0]
      return [route.number.toString(), route.directions[parseInt(u.directionId, 10)]]
    })
    return returned;
  },

  /**
   * Given an array [routeId, directionNumber] return [routeNumber, directionText]
   */
  transformRouteDirection: function(routeDir) {
    let route = _.filter(routeDetails, rd => { return rd.rt_id === routeDir[0]})[0]
    return [route.number.toString(), route.directions[routeDir[1]]]
  }
};

export default Helpers;
