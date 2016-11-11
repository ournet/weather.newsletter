'use strict';

require('dotenv').load();

const COUNTRIES = (process.env.COUNTRIES || '').trim().toLowerCase().split(/[;,| ]+/g);

const logger = require('./logger');

if (COUNTRIES.length === 0) {
	logger.error('No COUNTRIES');
	return;
}

const utils = require('./utils');
const Promise = utils.Promise;
const processCountry = require('./process_country');

logger.warn('START ' + COUNTRIES.join(','));

function end(error) {
	if (error && error.message) {
		logger.error(error);
	}
	logger.warn('END');
	return Promise.delay(1000 * 5).then(() => {
		/*eslint no-process-exit:1*/
		process.exit();
	});
}

Promise.each(COUNTRIES, processCountry).then(end).catch(end);
