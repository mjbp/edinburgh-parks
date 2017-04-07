import CONSTANTS from '../../constants';
import Load from 'storm-load';
//import { calculateDistance, getLocation } from './libs/geolocation';

const template = data => `<div class="map__overlay js-overlay">
        <div class="map__overlay-row map__heading">${data.site}</div>
        <div class="map__overlay-row">${data.address}, ${data.postcode}</div>
        <div class="map__overlay-row">${data.facilities}</div>
        <div class="map__overlay-row-directions js-directions">
            <svg class="map__overlay-row-icon" fill="#ffffff" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.71 11.29l-9-9c-.39-.39-1.02-.39-1.41 0l-9 9c-.39.39-.39 1.02 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9c.39-.38.39-1.01 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/>
                <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
            Get directions
        </div>
        
        <svg class="js-map__close map__overlay-close" fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            <path d="M0 0h24v24H0z" fill="none"/>
        </svg>
    </div>`;

let map,
    userLocation,
    directionControl,
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
    mapboxgl.accessToken = CONSTANTS.MAPBOX.TOKEN;

    map = new mapboxgl.Map({
        container: CONSTANTS.MAPBOX.CONTAINER_ID,
        style:'mapbox://styles/mapbox/dark-v9',
        center: CONSTANTS.MAPBOX.DEFAULT_LAT_LNG,
        zoom: 13,
    });

    navigator && map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        }
    }).on('geolocate', pos => {
        if(pos.coords) {
            userLocation = [pos.coords.longitude, pos.coords.latitude]
        }
    }));

    let nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'bottom-right');
    

    map.on('load', plotLocations);
    
};

const initDirections = (coords) => {

    let directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: 'metric', // Use the metric system to display distances.
        profile: 'walking', // Set the initial profile to walking.
        container: 'directions', // Specify an element thats not the map container.
        proximity: [-79.45, 43.65] // Give search results closer to these coordinates higher priority.
    });

    directionControl = map.addControl(directions, 'top-left');
    directions.setOrigin(userLocation || CONSTANTS.MAPBOX.DEFAULT_LAT_LNG);
    directions.setDestination(coords);

    directions.on('route', function(e) {
        console.log(e.route); // Logs the current route shown in the interface.
    });

    console.log(directionControl);

    //remove directions controls
    // document.querySelector('.map__directions-close').addEventListener('click', () => {
    //     console.log('close');
    //     map.remove(directions)
    // });
};


const dataMassage = data => data.map(datum => {
    return {
        "type": "Feature",
        "properties": {
            "address": datum['Address'],
            "postcode": datum['Postcode'],
            "site": datum['Site'],
            "facilities": datum['Play facilities'],
            "iconSize": [24, 24]
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

        dataMassage(data).forEach(function(marker) {
            var el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundImage = 'url(/img/park.svg)';
            el.style.width = '24px';
            el.style.height = '24px';

            el.addEventListener('click', e => {
                addOverlay(marker.properties, marker.geometry.coordinates);
            });

            new mapboxgl.Marker(el, {offset: [-marker.properties.iconSize[0] / 2, -marker.properties.iconSize[1] / 2]})
                .setLngLat(marker.geometry.coordinates)
                .addTo(map);
        });
};

const addOverlay = (item, coords) => {
    document.querySelector('.js-map').insertAdjacentHTML('beforeend', template(item));
    document.querySelector('.js-map__close').addEventListener('click', removeOverlay);
    document.querySelector('.js-directions').addEventListener('click', () => {
        removeOverlay();
        initDirections(coords);
    });
};

const removeOverlay = () => {
    document.querySelector('.js-overlay').parentNode.removeChild(document.querySelector('.js-overlay'));
};

export default () => {
    Load(CONSTANTS.MAPBOX.API_SRC)
        .then(() => {
            getData();
            initMap();
        })
        .catch(err => {
            console.warn();
        });
};