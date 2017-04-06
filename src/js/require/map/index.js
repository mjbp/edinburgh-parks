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
    userLocationMarker,
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
    map.addControl(nav, 'bottom-right');
    

    map.on('load', plotLocations);
    // map.on('load', () => {
    //     dataMassage(data).forEach(addMarker);
    // });
    

    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true,
            timeout:6000
        }
    }).on('geolocate', pos => {
        addUser(pos)
    }));

    //userLocation && addUser(userLocation);
    
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

            el.addEventListener('click', function() {
                addOverlay(marker.properties);
            });

            new mapboxgl.Marker(el, {offset: [-marker.properties.iconSize[0] / 2, -marker.properties.iconSize[1] / 2]})
                .setLngLat(marker.geometry.coordinates)
                .addTo(map);
        });

        map.on('click', handleMapClick);
};

const addUser = (pos) => {
    
    if(userLocationMarker) {
        userLocationMarker.setLngLat([pos.coords.longitude, pos.coords.latitude])
    }
    var el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = 'url(/img/user.svg)';
    el.style.width = '24px';
    el.style.height = '24px';
    	
    userLocationMarker = new mapboxgl.Marker(el)
        .setLngLat([pos.coords.longitude, pos.coords.latitude])
        .addTo(map);
    //remove element??
    /*
    map.addSource('user', { type: 'geojson', data: {
        "type": "Point",
        "coordinates": [-74.50, 40]
    }});

    map.addLayer({
        "id": "user-marker",
        "type": "symbol",
        "source": "user",
        "layout": {
            "icon-image": "airport-15",
            "icon-rotation-alignment": "map"
        }
    });

    map.getSource('drone').setData({
        "type": "Point",
        "coordinates": [pos.coords.longitude, pos.coords.latitude]
    });
*/
      
    
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