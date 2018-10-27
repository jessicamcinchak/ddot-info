import {fromJS} from 'immutable';
import MAP_STYLE from './mapstyle.json';

// Add the vector tile source for counties
Object.assign(MAP_STYLE.sources, {
    ddotroutes: {
      type: 'vector',
      url: 'mapbox://cityofdetroit.cjljmaojh22zo2wogr9f5fzts-6wa2r'
    }
  });
  
Object.assign(MAP_STYLE.sources, {
    stops: {
        type: 'vector',
        url: 'mapbox://cityofdetroit.cjbeojxj72m3s34llgz0yt0u7-9mm9h'
    }
});

MAP_STYLE.layers.splice(
    MAP_STYLE.layers.findIndex(layer => layer.id === 'road-label-small'), 0,
    {
        "id": "ddot-routes-highlight",
        "type": "line",
        "source": "ddotroutes",
        "source-layer": "ddot_routes",
        "interactive": "true",
        "filter": [
            "==",
            "route_num",
            ""
        ],
        "layout": {
            "visibility": "visible",
            "line-cap": "round",
            "line-join": "round"
        },
        "paint": {
            "line-color": {
                "base": 1,
                "type": "categorical",
                "property": "orientation",
                "stops": [
                    [
                        "Downtown",
                        // "rgba(0,0,0,1)"
                        // "#44aa42"
                        // "#78AA77"
                        "#499147"
                    ],
                    [
                        "Connect Ten",
                        // "rgba(0,0,0,1)"
                        // "#44aa42"
                        // "#78AA77"
                        "#00787a"
                    ],
                    [
                        "East-West",
                        // "rgba(0,0,0,1)"
                        // "#0079c2"
                        // "#619EC2"
                        "#116FA8"
                    ],
                    [
                        "North-South",
                        // "rgba(0,0,0,1)"
                        // "#9b5ba5"
                        // "#A081A5"
                        "#865B8C"
                    ],
                    [
                        "Special",
                        // "rgba(0,0,0,1)"
                        "#d07c32"
                        // "#D0A681"
                        // "#B8773E"
                    ]
                ]
            },
            "line-width": {
                "base": 1,
                "stops": [[9,6],[16,24],[22,90]]
            },
            "line-offset": 0,
            "line-opacity": 0.6,
        }
    }
    );

MAP_STYLE.layers.splice(
MAP_STYLE.layers.findIndex(layer => layer.id === 'road-label-small'), 0,
{
    "id": "ddot-routes-case",
    "type": "line",
    "source": "ddotroutes",
    "source-layer": "ddot_routes",
    "interactive": "true",
    "filter": [
        "==",
        "route_num",
        ""
    ],
    "layout": {
        "visibility": "visible",
        "line-cap": "round",
        "line-join": "round"
    },
    "paint": {
        // "line-color": "red",
        "line-color": "black",
        "line-width": {
            "base": 1,
            "stops": [[9,1.5],[16,8],[22,69]]
        },
        "line-offset": 0,
        "line-opacity": 1,
    }
}
);

// Insert route layer before stops
MAP_STYLE.layers.splice(
MAP_STYLE.layers.findIndex(layer => layer.id === 'road-label-small'), 0,
{
    "id": "ddot-routes",
    "type": "line",
    "source": "ddotroutes",
    "source-layer": "ddot_routes",
    "filter": [
        "==",
        "route_num",
        ""
    ],
    "interactive": "true",
    "layout": {
        "visibility": "visible",
        "line-cap": "round",
        "line-join": "round"
    },
    "paint": {
        // "line-color": "red",
        "line-color": {
            "base": 1,
            "type": "categorical",
            "property": "orientation",
            "stops": [
                [
                    "Downtown",
                    // "rgba(0,0,0,1)"
                    // "#44aa42"
                    "#78AA77"
                    // "#499147"
                ],
                [
                    "Connect Ten",
                    "#006466"
                ],
                [
                    "East-West",
                    // "rgba(0,0,0,1)"
                    // "#0079c2"
                    "#619EC2"
                    // "#116FA8"
                ],
                [
                    "North-South",
                    // "rgba(0,0,0,1)"
                    // "#9b5ba5"
                    "#A081A5"
                    // "#865B8C"
                ],
                [
                    "Special",
                    // "rgba(0,0,0,1)"
                    // "#d07c32"
                    "#D0A681"
                    // "#B8773E"
                ]
            ]
        },
        "line-width": {
            "base": 1,
            "stops": [[9,1],[16,6],[22,60]]
        },
        "line-offset": 0,
        "line-opacity": 1,
    }
}
);
  
export const routeLineIndex =
MAP_STYLE.layers.findIndex(layer => layer.id === 'ddot-routes');
export const routeCaseIndex =
MAP_STYLE.layers.findIndex(layer => layer.id === 'ddot-routes-case');
export const routeHighlightIndex =
MAP_STYLE.layers.findIndex(layer => layer.id === 'ddot-routes-highlight');
export const routeLabelIndex =
MAP_STYLE.layers.findIndex(layer => layer.id === 'ddot-new copy');
export const timepointLabelIndex =
MAP_STYLE.layers.findIndex(layer => layer.id === 'timepoint-labels');
export const stopLabelIndex =
MAP_STYLE.layers.findIndex(layer => layer.id === 'stop-labels');
export const stopPointIndexTwo =
MAP_STYLE.layers.findIndex(layer => layer.id === 'stop-points');
export const stopPointIndex =
MAP_STYLE.layers.findIndex(layer => layer.id === 'busstop-points');
export const highlightLabelIndex =
MAP_STYLE.layers.findIndex(layer => layer.id === 'highlight-labels');
export const highlightPointIndex =
MAP_STYLE.layers.findIndex(layer => layer.id === 'highlight-points');
export const realtimeLabelIndex =
MAP_STYLE.layers.findIndex(layer => layer.id === 'realtime');
export const realtimeIconIndex =
MAP_STYLE.layers.findIndex(layer => layer.id === 'realtime-background');
export const walkRadiusLabelIndex =
MAP_STYLE.layers.findIndex(layer => layer.id === 'walk-radius-label');


export const defaultMapStyle = fromJS(MAP_STYLE);