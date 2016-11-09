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

logger.warn('START');

Promise.each(COUNTRIES, processCountry)
	.lastly(() => {
		logger.warn('END');
		/*eslint no-process-exit:1*/
		process.exit();
	});
