let timer;

const config = {
    enableHighAccuracy: true,
    maximumAge: 5000
};
const MAX_TIME = 6000;

export const getLocation = () => {
    return new Promise((resolve, reject) => {
            if (!navigator || !navigator.geolocation) {
                reject();
                return;
            }
            navigator.geolocation.getCurrentPosition(resolve, reject, config);
		});
};

//Geometry
export const calculateDistance = (geo1, geo2) => {
    let a, c,
        dLat = self.toRad(geo1.latitude - +geo2.latitude),
        dLon = self.toRad(geo1.longitude - +geo2.longitude),
        lat1 = self.toRad(+geo2.latitude),
        lat2 = self.toRad(geo1.latitude);
    a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return self.metresToMiles(parseInt(r * c)).toFixed(2);
};

const metresToMiles = m => m * 0.000621371192;

const toRad = value => value * Math.PI / 180;

/**
 * math util to convert radians to latlong/degrees
 * @param value
 * @returns {number}
 */
const toDeg = value => value * 180 / Math.PI;