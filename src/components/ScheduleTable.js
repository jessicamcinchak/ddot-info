import React from 'react';
import _ from 'lodash';
import { withStyles } from "@material-ui/core";
import { Link } from 'react-router-dom';

import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import Arrow from '@material-ui/icons/KeyboardArrowRight';

const styles = theme => ({
  head: {
    position: "sticky",
    top: 0,
    backgroundColor: 'white',
  }
});

class ScheduleTable extends React.Component {
  render() {
    
    let {classes, trips, direction, service, color} = this.props;

    let filteredTrips = trips.filter(a => 
      a.directionId === direction && a.serviceId === service.toString()
    );

    let timepointModelTrip = _.maxBy(filteredTrips, a => {
      return a.stopTimesByFeedIndexAndTripId.edges.length
    })
    
    let timepoints = timepointModelTrip.stopTimesByFeedIndexAndTripId.edges.map(e => 
      e.node.stopByFeedIndexAndStopId
    )

    let sortedTrips = filteredTrips.sort((a, b) => {
      let aValue = a.stopTimesByFeedIndexAndTripId.edges[0].node.arrivalTime.hours * 60 + a.stopTimesByFeedIndexAndTripId.edges[0].node.arrivalTime.minutes
      let bValue = b.stopTimesByFeedIndexAndTripId.edges[0].node.arrivalTime.hours * 60 + b.stopTimesByFeedIndexAndTripId.edges[0].node.arrivalTime.minutes
      return aValue - bValue
    })

    const formatTime = (arrivalTime) => {
      let minutes = arrivalTime.minutes ? arrivalTime.minutes.toString().padStart(2, '0') : '00'
      let hours = arrivalTime.hours < 13 ? arrivalTime.hours :
                    arrivalTime.hours < 25 ? arrivalTime.hours - 12 : arrivalTime.hours - 24
      return (<span style={{fontWeight: arrivalTime.hours > 11 && arrivalTime.hours < 24 ? 700 : 300}}>{hours}:{minutes}</span>)
    }

    const styles = {
      tblHeadCell: {
        borderBottom: 0,
        padding: 0
      }
    }

    return (
      <div style={{ overflow: 'auto', maxHeight: window.innerHeight / 2, backgroundColor: 'white' }}>
        <Table>
          <TableHead>
            <TableRow>
              {timepoints.map((t, i) => (
                <TableCell
                  className={classes.head}
                  style={styles.tblHeadCell}
                  key={i}>
                  <div style={{ borderBottom: '0', height: '50px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '.2em .5em' }}>
                    <Link style={{ fontSize: '1.1em', color: 'black', fontWeight: 700 }} to={{ pathname: `/stop/${t.stopId}/` }}  >
                      {t.stopName}
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '11px', height: '8px', right: i === 0 ? 0 : null, width: (i === timepoints.length - 1) || i === 0 ? '50%' : '100%', backgroundColor: color, verticalAlign: 'center' }}></div>
                    <Arrow style={{ color: i === timepoints.length - 1 ? '#000' : 'white', backgroundColor: '#000', height: '24px', width: '24px', borderRadius: '2em', border: '3px solid #fff', margin: 'auto', verticalAlign: 'center', zIndex: '200' }} />
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedTrips.map((t, j) => (
              <TableRow
                key={t.trip_id}
                >
                {timepoints.map((tp, i) => {
                  let tripTimepoints = t.stopTimesByFeedIndexAndTripId.edges.map(e => e.node.stopByFeedIndexAndStopId.stopName)
                  if(tripTimepoints.indexOf(tp.stopName) > -1) {
                    let time = formatTime(t.stopTimesByFeedIndexAndTripId.edges[tripTimepoints.indexOf(tp.stopName)].node.arrivalTime)
                    return (
                      <TableCell
                      style={{ borderBottom: (j+1) % 5 === 0 ? `2px solid ${this.props.color}` : 0, borderRight: '1px solid #ccc', textAlign: 'center' }}
                      key={i}>
                      {time}
                    </TableCell>
                    )
                  }
                  else {
                    return (
                      <TableCell style={{ borderBottom: (j+1) % 5 === 0 ? `2px solid ${this.props.color}` : 0, borderRight: '1px solid #ccc', textAlign: 'center' }}>
                        —
                      </TableCell>
                    )                      
                  }
                })}

              </TableRow>
            ))}
          </TableBody>


        </Table>
      </div>
    )
  }
}
export default withStyles(styles)(ScheduleTable);