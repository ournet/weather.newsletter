'use strict';

const utils = require('./utils');
const Promise = utils.Promise;
var places = require('ournet.data.places');
var weather = require('ournet.data.weather');
var cocoshel = require('cocoshel-mongo-storage');
var logger = require('./logger');
var cachify = require('transparentcache');
var accessWeather = weather.AccessService.instance;
var accessPlaces = places.AccessService.instance;
var holidays = Promise.promisify(require('public-holidays'));

weather.logger.set(logger);

exports.EmailSubscriber = new cocoshel.Subscriber(cocoshel.db(cocoshel.connect(process.env.COCOSHEL_CONNECTION)));

exports.places = {
	access: accessPlaces,
	search: places.SearchService.instance,
	Place: places.Place
};
exports.weather = {
	access: accessWeather,
	forecast: weather.forecast,
	helpers: weather.helpers
};

exports.holidays = cachify(holidays, {
	cachingStrategy: new cachify.strategies.Timeout({ ttl: 1000 * 60 * 30 }),
	parameters: [0]
});

// cachify places
//

cachify(accessPlaces, {
	cachingStrategy: new cachify.strategies.RingBuffer({ size: 100 }),
	methods: { placesByTypeAdm1: [0, 1] }
});

cachify(accessPlaces, {
	cachingStrategy: new cachify.strategies.Timeout({ ttl: 1000 * 60 * 10 }),
	methods: { places: [0, 1] }
});

cachify(accessPlaces, {
	cachingStrategy: new cachify.strategies.RingBuffer({ size: 500 }),
	methods: { place: [0, 1] }
});

// cachify weather
//

cachify(accessWeather, {
	cachingStrategy: new cachify.strategies.RingBuffer({ size: 500 }),
	methods: { getForecast: [0] }
});

// cachify EmailSubscriber
//

cachify(exports.EmailSubscriber, {
	cachingStrategy: new cachify.strategies.Timeout({ ttl: 1000 * 60 * 10 }),
	methods: {
		count: [0]
	}
});
