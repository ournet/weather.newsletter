'use strict';

var logger = module.exports = require('ournet.logger');

if (process.env.NODE_ENV === 'production') {
	logger.loggly({
		tags: ['weather-newsletter', 'app'],
		json: true
	});
	if (process.env.MODE !== 'dev') {
		logger.removeConsole();
	}
}
