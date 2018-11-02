import React from 'react';
import mapboxgl from 'mapbox-gl';
import {Card, CardHeader, CardContent} from '@material-ui/core';
import _ from 'lodash';
import BusStop from './BusStop.js';

import mapStyle from '../mapstyle.json';
mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eW9mZGV0cm9pdCIsImEiOiJjamw1eDB4YWgycmVkM3VwZ2gxMTNrNGFuIn0.NnF2kxfQfZpM_hooo53pmw';

class StopWithPredictionMap extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      height: window.innerWidth < 768 ? 300 : (window.innerHeight - 190),
    }
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: mapStyle,
      center: this.props.center,
      zoom: 15.5
    })

    this.map.on('load', e => {
      this.map.addSource("thisStop", {
        "type": "geojson",
        "data": {"type": "FeatureCollection", "features": [{
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              this.props.stop.stopLon,
              this.props.stop.stopLat
            ]
          }
        },]}
      })
    })

    window.addEventListener('resize', this._resize);

  }

  componentWillUpdate(nextProps, nextState) {
    // console.log(nextProps, nextState)
  }

  _resize = () => {
    if (window.innerWidth > 768) {
      this.setState({
        height: (window.innerHeight - 104)
      });
    } else {
      this.setState({
        height: 300
      });
    }
  }

  render() {
    return (
        <Card className="routeMap" elevation={0}>
          <div style={{ display: 'flex', alignItems: 'center', padding: 0 }}>
           <BusStop style={{ marginLeft: '1em', backgroundColor: 'rgba(0, 0, 0, .8)', color: 'yellow', borderRadius: 999, height: '1.8em', width: '1.8em' }}/>
           <CardHeader title={this.props.stop.stopName} subheader={`Stop ID: #${this.props.stopId}`} style={{ fontSize: '1.2em', position: 'sticky'}}/>
         </div>
        <CardContent style={{ padding: 0, margin: 0 }}>
          <div ref={el => this.mapContainer = el} style={{height: this.state.height, width: '100%'}} />
        </CardContent>
      </Card>
    );
  }

}

export default StopWithPredictionMap;