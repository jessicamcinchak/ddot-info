
import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import chroma from 'chroma-js';
import { AppBar } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import { Link } from 'react-router-dom';

import Helpers from '../helpers.js';
import RouteHeader from './RouteHeader.js';
import RouteBadge from './RouteBadge.js';
import DirectionPicker from './DirectionPicker.js';
import ServicePicker from './ServicePicker.js';
import routeDetails from '../data/routeDetails.js';

import ScheduleTable from './ScheduleTable.js';


/* GraphQL query string; accepts a coordinate point and radius (in feet) and returns events at addresses within the radius */ 
const GET_ROUTE_DATA = gql`
  query getRouteSchedule($route: String! ) {
      allRoutes(condition: {routeShortName: $route}) {
        edges {
          node {
            routeShortName
            routeLongName
            routeId
            routeColor
            tripsByFeedIndexAndRouteId {
              edges {
                node {
                  tripId
                  tripHeadsign
                  directionId
                  serviceId
                  stopTimesByFeedIndexAndTripId(condition: {timepoint: 1}) {
                    edges {
                      node {
                        stopSequence
                        stopId
                        stopByFeedIndexAndStopId {
                          stopName
                          stopDesc
                          stopLat
                          stopLon
                          stopId
                        }
                        arrivalTime {
                          hours
                          minutes
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
`;

/* Query component that fetches GraphQL data and attaches the results to your UI */
class RouteSchedule extends React.Component {

  constructor(props) {
    super(props)

    let routeDetail = routeDetails.filter(r => {return r.number.toString() === this.props.match.params.name})[0]


    this.state = {
      currentDirection: routeDetail.directions[0],
      availableDirections: routeDetail.directions,
      currentSvc: 'weekday',
      availableServices: Object.keys(routeDetail.services).length === 3 
                          ? ['weekday', 'saturday', 'sunday'] :
                          Object.keys(routeDetail.services).length === 2 
                            ? ['weekday', 'saturday'] : ['weekday']
    }

    this.handleDirectionChange = this.handleDirectionChange.bind(this);
    this.handleServiceChange = this.handleServiceChange.bind(this);
  }

  handleDirectionChange(event) {
    this.setState({
      currentDirection: event.target.value
    });
  }

  handleServiceChange(event) {
    this.setState({
      currentSvc: event.target.value
    });
  }

  render () {
    const match = this.props.match;

    const serviceMap = {
      "weekday": 1,
      "saturday": 2,
      "sunday": 3  
    }

    return (
      <Query 
        query={GET_ROUTE_DATA} 
        variables={{ route: match.params.name.padStart(3, '0') }}
      >
        {({ loading, error, data }) => {

          const routeDetail = routeDetails.filter(r => {return r.number.toString() === match.params.name})[0]
          if (loading) {
            return (
              <div className="BusRoute" style={{ background: Helpers.colors['background'] }}>
                <RouteHeader number={match.params.name} page="schedule" />
                <div className="schedule">                  
                  <AppBar position="static" color="default" elevation={0} style={{ display: 'flex', background: 'white' }}>
                    <Toolbar elevation={0} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ margin: 0, padding: '.5em 0em', fontSize: '1.5em', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <span style={{ marginLeft: '.25em' }}><RouteBadge id={match.params.name} showName/></span>: <span style={{ fontWeight: 700, paddingLeft: '.2em' }}>Schedule</span>
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '.5em' }}>
                        <span style={{ fontSize: '.9em' }}><b>Major stops</b> </span>
                        <span style={{ height: '15px', width: '15px', backgroundColor: '#000', border: '1px solid #000', borderRadius: '3em', margin: '.25em' }}></span>
                        <span style={{ fontSize: '.9em' }}> are shown in order in the top row; look down the column to see scheduled departure times from that bus stop.</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '.5em' }}>
                        <span style={{ fontSize: '.9em' }}>Buses make additional stops between major stops; see a list of all stops on the <Link to={{ pathname: `/route/${match.params.name}/stops` }} style={{ color: 'black' }}>BUS STOPS</Link> tab.</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '.5em' }}>
                        <span style={{ fontSize: '.9em' }}>Displaying AM times, <b>PM times</b>, and </span>
                        <span style={{ background: chroma(routeDetail.color).alpha(0.25).css(), fontSize: '.9em', marginLeft: '.25em', padding: '.15em' }}> current trips.</span>
                      </div>
                    </Toolbar>
                  </AppBar>
                  Loading...
                </div>
              </div>
            )
          }
          if (error) return `Error! ${error.message}`;
    
          if (data) {
            console.log(data)
            let route = data.allRoutes.edges[0].node
            console.log(routeDetail)
            return (
              <div className="BusRoute" style={{ background: Helpers.colors['background'] }}>
                <RouteHeader number={match.params.name} page="schedule" />
                <div className="schedule">
                  <AppBar position="static" color="default" elevation={0} style={{ display: 'flex', background: 'white' }}>
                    <Toolbar elevation={0} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ margin: 0, padding: '.5em 0em', fontSize: '1.5em', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <span style={{ marginLeft: '.25em' }}><RouteBadge id={match.params.name} showName/></span>: <span style={{ fontWeight: 700, paddingLeft: '.2em' }}>Schedule</span>
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '.5em' }}>
                        <span style={{ fontSize: '.9em' }}><b>Major stops</b> </span>
                        <span style={{ height: '15px', width: '15px', backgroundColor: '#000', border: '1px solid #000', borderRadius: '3em', margin: '.25em' }}></span>
                        <span style={{ fontSize: '.9em' }}> are shown in order in the top row; look down the column to see scheduled departure times from that bus stop.</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '.5em' }}>
                        <span style={{ fontSize: '.9em' }}>Buses make additional stops between major stops; see a list of all stops on the <Link to={{ pathname: `/route/${match.params.name}/stops` }} style={{ color: 'black' }}>BUS STOPS</Link> tab.</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '.5em' }}>
                        <span style={{ fontSize: '.9em' }}>Displaying AM times, <b>PM times</b>, and </span>
                        <span style={{ background: chroma(route.routeColor).alpha(0.25).css(), fontSize: '.9em', marginLeft: '.25em', padding: '.15em' }}> current trips.</span>
                      </div>
                    </Toolbar>
                  </AppBar>
                  <AppBar position="static" color="default" elevation={0} style={{ display: 'flex', flexWrap: 'wrap', padding: '.5em 0em', marginBottom: '1em' }}>
                    <Toolbar elevation={0} style={{ justifyContent: 'flex-start', alignItems: 'start', marginLeft: '.5em' }}>
                      <ServicePicker
                        services={this.state.availableServices}
                        currentSvc={this.state.currentSvc}
                        onChange={this.handleServiceChange} />
                      <DirectionPicker 
                        directions={routeDetail.directions}
                        currentDirection={this.state.currentDirection}
                        onChange={this.handleDirectionChange}
                        between={routeDetail.between} />
                    </Toolbar>
                  </AppBar>
                  <ScheduleTable 
                    trips={route.tripsByFeedIndexAndRouteId.edges.map(e => e.node)}
                    direction={routeDetail.directions.indexOf(this.state.currentDirection)}
                    service={serviceMap[this.state.currentSvc]}
                    color={routeDetail.color}
                    />
                  {/* <ScheduleTable 
                    schedule={this.state[this.state.currentSvc]} 
                    direction={this.state.currentDirection} 
                    liveTrips={_.map(this.state.realtimeTrips, 'properties.tripId')} 
                    color={this.state.color} /> */}
                  {/* <Card style={{ marginTop: '1em', backgroundColor: '#fff' }}>
                    <CardContent>
                      <PrintSchedule routePdf={_.find(routeDetails, { 'number': parseInt(this.props.match.params.name, 10) }).pdf} />
                    </CardContent>
                  </Card> */}
                </div>
              </div>
            );
          }
    
        }}
      </Query>
    )
  }
}
export default RouteSchedule;