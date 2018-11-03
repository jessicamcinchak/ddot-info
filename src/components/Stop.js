
import React from 'react';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import _ from 'lodash';
import gql from 'graphql-tag'
import Toolbar from '@material-ui/core/Toolbar';
import { Card, CardHeader, Tabs, Tab, AppBar } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import TransferIcon from '@material-ui/icons/SwapHoriz';
import TopNav from './TopNav';
import StopWithPredictionMap from './StopWithPredictionMap';
import StopTransfers from './StopTransfers';
import RouteBadge from './RouteBadge';
import RouteLink from './RouteLink';
import RoutePredictionList from './RoutePredictionList';
import Helpers from '../helpers';
import { Query } from 'react-apollo';

const styles = {
  title: {
    fontWeight: 500,
    fontSize: '1.25em'
  }
}

const GET_STOP_DATA = gql`
  query getStopData($stop: String!) {
      stopByFeedIndexAndStopId(feedIndex: 1, stopId: $stop) {
        stopName
        stopDesc
        stopLat
        stopLon
        routesAtStopList{
          routeLongName
          routeShortName
          routeId
        }
        tripsAtStopList{
          tripId
          routeId
          directionId
          serviceId
        }
        stopsNearbyList {
          stopId
          stopName
          stopDesc
          stopLat
          stopLon
          routeDirectionAtStop
        }
      }
    }
`

/** Top level component at /stops/{#} */
class Stop extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      predictions: {},
      scheduledStops: {},
      fetchedStopSchedule: false,
      fetchedPredictions: false,
      multipleDirs: false,
      slideIndex: 0,
      tripId: null,
      tripData: null,
      route: null
    }

    this.handleRoutePredictionChange = this.handleRoutePredictionChange.bind(this)
  }

  fetchRealtimeData(id) {
    fetch(`${Helpers.endpoint}/arrivals-and-departures-for-stop/DDOT_${id}.json?key=BETA&includePolylines=false`)
    .then(response => response.json())
    .then(d => {
      d.data.entry.arrivalsAndDepartures = _.filter(d.data.entry.arrivalsAndDepartures, ad => {
        return (ad.predicted && ad.predictedArrivalTime > d.currentTime) || !ad.predicted
      })
      this.setState({
        tripData: this.state.tripId ? _.filter(this.state.predictions.data.entry.arrivalsAndDepartures, a => {return a.tripId === this.state.tripId})[0] : null,
        predictions: d, 
        fetchedPredictions: true,
      })
    })
    .catch(e => console.log(e));
  }

  fetchStopScheduleData(id) {
    fetch(`${Helpers.endpoint}/schedule-for-stop/DDOT_${id}.json?key=BETA&includePolylines=false`)
    .then(response => response.json())
    .then(d => {
      let multipleDirs = false
      d.data.entry.stopRouteSchedules.forEach(srs => {
        if (srs.stopRouteDirectionSchedules.length > 1) {
          multipleDirs = true
        }
      });
      this.setState({ 
        scheduledStops: d, 
        fetchedStopSchedule: true,
        multipleDirs: multipleDirs
      })
    })
    .catch(e => console.log(e));
  }

  handleTabsChange = (event, slideIndex) => {
    if (typeof event === 'number') {
      this.setState({ slideIndex: event, tripData: null, tripId: null })
    } else {
      this.setState({ slideIndex: slideIndex, tripData: null, tripId: null })
    }
  }

  handleRoutePredictionChange = (tripId, route) => {
    this.setState({
      tripData: _.filter(this.state.predictions.data.entry.arrivalsAndDepartures, a => {return a.tripId === tripId})[0],
      tripId: tripId,
      route: route
    })
  }

  componentDidMount() {
    this.fetchRealtimeData(this.props.match.params.name);
    this.fetchStopScheduleData(this.props.match.params.name);
    this.interval = setInterval(() => this.fetchRealtimeData(this.props.match.params.name), 5000);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      fetchedStopSchedule: false, 
      slideIndex: 0,
      tripId: null,
      tripData: null
    });

    if (this.props.match.params.name !== nextProps.match.params.name) {
      this.fetchStopScheduleData(nextProps.match.params.name);
      this.fetchRealtimeData(nextProps.match.params.name);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const stopId = this.props.match.params.name;
    const { slideIndex } = this.state;
    return (
      <Query
        query={GET_STOP_DATA}
        variables={{stop: this.props.match.params.name}}>
        {({ loading, error, data }) => {
          if(loading) {
            return <div>loading</div>
          }
          if(error) return `Error! ${error.message}`
          if(data) {
            const stop = data.stopByFeedIndexAndStopId
            const stopCoords = [stop.stopLon, stop.stopLat];
            const stopRoutes = Helpers.getUniqueRoutes(stop.tripsAtStopList).sort(function(a, b) {return a[0] - b[0];});
            const stopTransfers = stop.stopsNearbyList.map(snl => [...Helpers.transformRouteDirection(JSON.parse(snl.routeDirectionAtStop)), snl.stopId])
            return ( 
              <div className='App' style={{ background: Helpers.colors['background']}}>
                <TopNav />
                <StopWithPredictionMap 
                  stopId={stopId} 
                  center={stopCoords} 
                  prediction={this.state.tripData} 
                  route={this.state.route} 
                  stop={stop} /> 
                <div className='routes'>
                  <Card>
                    <div style={{ display: 'flex', alignItems: 'center', padding: 0 }}>
                      <CardHeader title="Bus routes that stop here" subheader="Showing next arrivals and today's schedule. Transfers tab shows nearby routes" classes={{ title: this.props.classes.title }} style={{ fontSize: '1.1em' }}/>
                    </div>
                  </Card>
                  <AppBar position="static" color="default" style={{ display: 'flex' }} elevation={0}>
                    <Toolbar>
                      <Tabs
                        onChange={this.handleTabsChange}
                        value={slideIndex}
                        indicatorColor="primary"
                        textColor="primary"
                        scrollable={stopRoutes.length > 5 ? true : false}>
                        {stopRoutes.map((r, i) => (
                          <Tab label={<RouteBadge id={r[0]} />} value={i} style={{ minWidth: 40, width: 50 }} key={i} />
                        ))}
                        <Tab label={<div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', height: 120}}><TransferIcon />Transfers</div>} value={stopRoutes.length} style={{fontWeight: 700}} />
                      </Tabs>
                    </Toolbar>
                  </AppBar>
                  <SwipeableViews
                    axis='x'
                    index={slideIndex}
                    onChangeIndex={this.handleTabsChange}>
                    {stopRoutes.map((r, i) => (
                      <div key={i}>
                        <AppBar position="static" color="default" elevation={0} style={{ display: 'flex' }}>
                          <Toolbar style={{ justifyContent: 'space-between' }} elevation={0}>
                            <RouteLink id={r[0]} />
                          </Toolbar>
                        </AppBar>
                        <div>
                        {this.state.fetchedPredictions && this.state.fetchedStopSchedule ?
                            <div style={{ display: 'block', padding: '0em 0em', width: '100%' }}>
                              <RoutePredictionList
                                predictions={_.filter(this.state.predictions.data.entry.arrivalsAndDepartures, function(o) { return o.routeShortName === r[0].padStart(3, '0')})} 
                                references={this.state.predictions.data.references}
                                stop={stopId}
                                multipleDirs={this.state.multipleDirs}
                                isOpen={i === slideIndex}
                                onChange={this.handleRoutePredictionChange} />
                            {/* <StopRouteSchedule 
                              schedules={this.state.scheduledStops.data.entry.stopRouteSchedules.filter} 
                              route={r[0]}
                              multipleDirs={this.state.multipleDirs}
                              predictions={_.filter(this.state.predictions.data.entry.arrivalsAndDepartures, function(o) { return o.routeShortName === r[0].padStart(3, '0')}).map(p => p.tripId)} 
                              /> */}
                              </div> : ``}
                          </div>
                        </div>
                    ))}
                    <div>
                      {stopTransfers.length > 0 && 
                        this.state.fetchedStopSchedule && 
                        this.state.fetchedPredictions ? 
                        <StopTransfers stops={stopTransfers} /> : 
                        null}
                    </div>
                    </SwipeableViews>
                </div>
              </div>
            )
            }
          } 
        }
      </Query>
    );
  }
}

Stop.propTypes = {
  match: PropTypes.shape({
    isExact: PropTypes.bool,
    params: PropTypes.shape({
      name: PropTypes.string,
    }),
    path: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
  location: PropTypes.object,
  history: PropTypes.object,
}

export default withStyles(styles)(Stop);