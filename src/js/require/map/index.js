import CONSTANTS from '../../constants';
import Load from 'storm-load';
import { calculateDistance, getLocation } from './libs/geolocation';

const template = data => `<div class="map__overlay js-overlay">
        <div class="map__overlay-row">${data.site}</div>
        <div class="map__overlay-row">${data.address}, ${data.postcode}</div>
        <div class="map__overlay-row">${data.facilities}</div>
        <svg class="js-map__close map__overlay-close" fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            <path d="M0 0h24v24H0z" fill="none"/>
        </svg>
    </div>`;

let map,
    userLocation,
    data;

//get 
const getData = () => {
    fetch('/data.json')
        .then(res => res.json())
        .then(json => {
            data = json;
        })
        .catch(err => {
            console.warn();
        });
};

const initMap = () => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWpicCIsImEiOiJjaXdybmRiZmIwMDA5MnRwY2g4MnlwZ3pkIn0._v0nFJRW97AIekeT6XfnAw';

    map = new mapboxgl.Map({
        container: CONSTANTS.MAPBOX.CONTAINER_ID,
        style:'mapbox://styles/mapbox/dark-v9',
        center: CONSTANTS.MAPBOX.DEFAULT_LAT_LNG,
        zoom: 13,
    });

    let nav = new mapboxgl.NavigationControl();
    map.addControl(new mapboxgl.AttributionControl(), 'bottom-left');
    map.addControl(nav, 'bottom-right');

    map.on('load', plotLocations);
    // map.on('load', () => {
    //     dataMassage(data).forEach(addMarker);
    // });
    map.on('click', handleMapClick);
    // map.on('mousemove', handleMapClickfunction (e) {
    //     let features = map.queryRenderedFeatures(e.point, { layers: ['places'] });
    //     map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
    // });

    map.addSource('single-point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    });

    map.addLayer({
        "id": "point",
        "source": "single-point",
        "type": "circle",
        "paint": {
            "circle-radius": 5,
            "circle-color": "#007cbf"
        }
    });
    addUser();
};

const dataMassage = data => data.map(datum => {
    return {
        "type": "Feature",
        "properties": {
            "address": datum['Address'],
            "postcode": datum['Postcode'],
            "site": datum['Site'],
            "facilities": datum['Play facilities'],
            "icon": "playground",
            "iconSize": [40, 40]
        },
        "geometry": {
            "type": "Point",
            "coordinates": [datum.Location.split(',')[1], datum.Location.split(',')[0]]
        }
    }
});

const plotLocations = () => {
        map.addLayer({
            "id": "places",
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": dataMassage(data)
                }
            },
            "layout": {
                "icon-image": "{icon}-15",
                "icon-allow-overlap": true
            }
        });
};

// const addMarker = marker => {
//     let el = document.createElement('div');
//     el.className = 'marker';
//     el.style.backgroundImage = 'url(https://placekitten.com/g/40/40)';
//     el.style.width = '40px';
//     el.style.height = '40px';

//     el.addEventListener('click', function() {
//         console.log(eature.properties.facilities);
//     });

//     // add marker to map
//     new mapboxgl.Marker(el, {})
//         .setLngLat(marker.geometry.coordinates)
//         .addTo(map);
// };

const addUser = () => {
    if(!userLocation) return;
    console.log(userLocation);
    map.getSource('single-point').setData({
        "type": "Point",
        "coordinates": [userLocation.coords.longitude, userLocation.coords.latitude]
    });
    
};

const handleMapClick = e => {
    let features = map.queryRenderedFeatures(e.point, { layers: ['places'] });

    if (!features.length) return;

    let feature = features[0];

    addOverlay(feature.properties);
};

const addOverlay = item => {
    document.querySelector('.js-map').insertAdjacentHTML('beforeend', template(item));
    document.querySelector('.js-map__close').addEventListener('click', removeOverlay);
};

const removeOverlay = () => {
    document.querySelector('.js-overlay').parentNode.removeChild(document.querySelector('.js-overlay'));
};

export default () => {
    Load(CONSTANTS.MAPBOX.API_SRC)
        .then(() => {

            getLocation()
                .then(pos => {
                    userLocation = pos;
                })
                .catch(err => {
                    console.log(err);
                });
                
            getData();
            initMap();

            

        })
        .catch(err => {
            console.warn();
        });

};