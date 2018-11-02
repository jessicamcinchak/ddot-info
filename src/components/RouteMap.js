import React from 'react';
import mapboxgl from 'mapbox-gl';
import {Card, CardHeader, CardContent} from '@material-ui/core';
import DirectionsBus from '@material-ui/icons/DirectionsBus';
import LiveIcon from '@material-ui/icons/SpeakerPhone';
import ScheduleIcon from '@material-ui/icons/Schedule';
import Helpers from '../helpers'
import _ from 'lodash';
import chroma from 'chroma-js';
import moment from 'moment';
// import Schedules from '../data/schedules.js'
import routeDetails from '../data/routeDetails';
import Stops from '../data/stops.js'
import RouteBadge from './RouteBadge';

import mapStyle from '../mapstyle.json';
mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eW9mZGV0cm9pdCIsImEiOiJjamw1eDB4YWgycmVkM3VwZ2gxMTNrNGFuIn0.NnF2kxfQfZpM_hooo53pmw';

class RouteMap extends React.Component {

  constructor(props) {
    super(props);

    this.route = Helpers.getRouteDetails(this.props.route.number)

    // make timepoint GeoJSON
    const firstDir = this.route.directions[0]
    const firstDirTimepoints = this.route.timepoints[firstDir]
    const timepointFeatures = firstDirTimepoints.map(t => {      
      return {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [Stops[t].lon, Stops[t].lat]
        },
        "properties": {
          "id": t,
          "name": Stops[t].name.toUpperCase().indexOf('ROSA PARKS TR') > -1 ? "Rosa Parks TC" : Stops[t].name,
          "stop_code": Stops[t].dir,
          "offset": Stops[t].offset || [3,1],
          "align": Stops[t].align || 'center'
        }
      }
    })

    const stopFeatures = _.filter(Stops, s => { return s.routes.map(r => r[0]).indexOf(this.route.number.toString()) > -1 }).map(t => {
      return {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [t.lon, t.lat]
        },
        "properties": {
          "id": t.id,
          "name": t.name.toUpperCase().indexOf('ROSA PARKS TR') > -1 ? "Rosa Parks TC" : t.name,
          "stop_code": t.dir,
        }
      }
    });

    
    this.state = {
      height: window.innerWidth < 768 ? 300 : ((window.innerHeight - 170) * 1 - 104),
      realtimeTrips: [],
      selectedRealtimeTrip: null,
      fetchedData: false,
      directions: this.route.directions,
      timepointFeatures: timepointFeatures,
      stopFeatures: stopFeatures
    }
  }

    fetchData() {
      fetch(`${Helpers.endpoint}/trips-for-route/DDOT_${this.props.route.rt_id}.json?key=BETA&includeStatus=true&includePolylines=false`)
      .then(response => response.json())
      .then(d => {
        let geojson = _.sortBy(d.data.list, 'status.tripId').map((bus, i) => {
          let tripDetail = d.data.references.trips.filter(a => a.id === bus.status.activeTripId)[0]
          let direction = this.route.directions[parseInt(tripDetail.directionId)]          
          return {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [bus.status.position.lon, bus.status.position.lat]
            },
            "properties": {
              "tripId": bus.status.activeTripId,
              "displayTripId": bus.status.activeTripId.slice(-4,),
              "scheduledDistanceAlongTrip": bus.status.scheduledDistanceAlongTrip,
              "nextStop": bus.status.nextStop,
              "nextStopOffset": bus.status.nextStopTimeOffset,
              "predicted": bus.status.predicted,
              "scheduleDeviation": bus.status.scheduleDeviation,
              "updateTime": moment(bus.status.lastUpdateTime).format("h:mm:ss a"),
              "onTime": bus.status.scheduleDeviation / 60,
              "lastStop": this.route.timepoints[direction] ? this.route.timepoints[direction].slice(-1)[0] : ``,
              "direction": direction
            }
          }
        });
        let realtimeTrips = _.filter(geojson, o => { return o.properties.direction !== undefined });
        this.setState({ 
          realtimeTrips: realtimeTrips,
          fetchedData: true
        });
      })
      .catch(e => console.log(e));
    }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: mapStyle,
      center: [-83.1, 42.5],
      zoom: 15.5
    })

    this.popup = new mapboxgl.Popup({
      closeButton: false,
      offset: 20
    })

    this.fetchData();
    this.interval = setInterval(() => this.fetchData(), 3000);

    this.map.on('load', e => {
      // this.map.fitBounds(scheduleRoute.bbox, {padding: 20, duration: 0})
      this.map.setFilter('ddot-routes', ["==", "route_num", parseInt(this.props.route.number, 10)])
      this.map.setFilter('ddot-routes-case', ["==", "route_num", parseInt(this.props.route.number, 10)])
      this.map.getSource("timepoints").setData({"type": "FeatureCollection", "features": this.state.timepointFeatures})
      this.map.getSource("busstops").setData({"type": "FeatureCollection", "features": this.state.stopFeatures})
      this.map.setPaintProperty("timepoint-labels", "text-color", chroma(this.props.route.color).darken(2).hex())
      this.map.setPaintProperty("timepoint-labels", "text-halo-color", "#fff")


      this.map.addSource("realtimeTrips", {
        "type": "geojson",
        "data": {"type": "FeatureCollection", "features": this.state.realtimeTrips}
      })

      this.map.addLayer({
        "id": "realtimeTripsHighlight",
        "source": "realtimeTrips",
        "type": "circle",
        "filter": ["==", "tripId", ""],
        "paint": {
          "circle-radius": 20,
          "circle-color": "rgba(241,244,66,0.8)",
          "circle-blur": 0.3
        }
      })
      this.map.addLayer({
        "id": "realtimeTrips",
        "source": "realtimeTrips",
        "type": "symbol",
        "layout": {
          "icon-image": "bus-15",
          "icon-size": 1.25,
          "icon-allow-overlap": true
        }
      })

      this.map.on('click', e => {
        const features = this.map.queryRenderedFeatures(e.point, {layers: ["realtimeTrips"]})
        if(features.length > 0) {
          const bus = features[0]
          this.popup
            .setLngLat(bus.geometry.coordinates)
            .setHTML(`
              <span>${_.capitalize(bus.properties.direction)}<h3>
              <span>to ${Stops[this.route.timepoints[bus.properties.direction].slice(-1)].name}</span>
              <h5>Next stop</h5>
              <h3>${Stops[bus.properties.nextStop.slice(5,)].name}</h3><span>${bus.properties.updateTime}</span>
              `)    
          this.setState({
            selectedRealtimeTrip: bus.properties.tripId
          })
          if(!this.popup.isOpen()) {
            this.popup.addTo(this.map)
          }
          this.map.setFilter("realtimeTripsHighlight", ["==", "tripId", bus.properties.tripId])
          this.map.easeTo({
            center: bus.geometry.coordinates,
            zoom: 14
          })
        }
        else {
          this.setState({selectedRealtimeTrip: null})
          this.map.setFilter("realtimeTripsHighlight", ["==", "tripId", ""])
        }
      })

    })

    window.addEventListener('resize', this._resize);
  }

  componentWillUpdate(nextProps, nextState) {
    if(this.state.fetchedData) {
      this.map.getSource("realtimeTrips").setData({"type": "FeatureCollection", "features": nextState.realtimeTrips})
    }
    if(nextState.selectedRealtimeTrip) {
      const bus = nextState.realtimeTrips.filter(rt => { return nextState.selectedRealtimeTrip === rt.properties.tripId })[0]
      this.popup
        .setLngLat(bus.geometry.coordinates)
        .setHTML(`
          <h4>${_.capitalize(bus.properties.direction)}</h4>
          <span>to ${Stops[this.route.timepoints[bus.properties.direction].slice(-1)].name}</b></span>
          <br />
          <h5>Next stop</h5>
          <h3>${Stops[bus.properties.nextStop.slice(5,)].name}</h3>
          `)        
        if(!this.popup.isOpen()) {
        this.popup.addTo(this.map)
      }
    }
    else {
      this.popup.remove()
    }
  }

  _resize = () => {
    if (window.innerWidth > 768) {
      this.setState({
        height: ((window.innerHeight - 800))
      });
    } else {
      this.setState({
        height: 300
      });
    }
  }

  render() {

    const route = this.props.route;

    return (
        <Card className="routeMap" elevation={0}>
        <CardContent style={{ padding: 0, margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardHeader 
              title={<RouteBadge id={route.number.toString()} showName />} 
              subheader={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Zoom in for all stops and real-time bus info.
                </div>} />
              <div style={{display: 'grid', gridTemplate: 'repeat(2, 1fr) / 1fr 1fr', gridGap: 10, marginRight: '.5em', background: 'rgba(0,0,0,0.05)', padding: 10}}>
                <div style={{display: 'flex', alignItems: 'center', alignContent: 'center', fontWeight: 700}}>
                  <span style={{textAlign: 'center', textSize: '1.5em'}}></span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', alignContent: 'space-between'}}>
                  <DirectionsBus style={{height: 17, width: 17, padding: 1, borderRadius: 9999, color: 'white', background: 'rgba(0,0,0,1)'}}/>
                  <span style={{marginLeft: '.5em'}}>Active buses</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', alignContent: 'space-between'}}>
                  <span style={{borderRadius: 9999, border: '3px solid black', width: 13, height: 13, background: '#000'}}></span>
                  <span style={{marginLeft: '.5em', textAlign: 'center'}}>Major stops</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', alignContent: 'space-between'}}>
                  <span style={{borderRadius: 9999, border: `3px solid ${this.props.route.color}`, width: 13, height: 13, background: '#fff'}}></span>
                  <span style={{marginLeft: '.5em'}}>Local stops</span>
                </div>
              </div>
          </div>
          <div ref={el => this.mapContainer = el} style={{height: this.state.height, width: '100%'}} />
        </CardContent>
      </Card>
    );
  }

}

export default RouteMap;