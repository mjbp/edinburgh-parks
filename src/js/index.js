//import './polyfills';
import styles from '../css/app.css';
import CONSTANTS from './constants';
import Map from './require/map';

//when DOMContentLoaded, run these tasks
const onDOMContentLoadedTasks = [
	Map,
	() => {
		if ('serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js') });
	}
];
if('addEventListener' in window)
    !!onDOMContentLoadedTasks.length && window.addEventListener('DOMContentLoaded', () => { onDOMContentLoadedTasks.forEach((fn) => fn()); });
