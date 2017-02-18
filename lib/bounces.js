'use strict';

require('dotenv').load();

const logger = require('./logger');

const utils = require('./utils');
const Promise = utils.Promise;
const processBounces = require('./process_bounces');
let tm;

logger.warn('START process bounces');

function end(error) {
	clearTimeout(tm);
	processBounces.stop();
	if (error && error.message) {
		logger.error(error);
	}
	logger.warn('END');
	return Promise.delay(1000 * 5).then(() => {
		/*eslint no-process-exit:1*/
		process.exit();
	});
}

tm = setTimeout(end, 1000 * 60 * 30);

processBounces.start(end);
