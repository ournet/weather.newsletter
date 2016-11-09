'use strict';

const utils = require('../utils');
const Promise = utils.Promise;
const ms = utils.ms;
const logger = require('../logger');
const Data = require('../data');
const formatEmail = require('./format');
const START = Date.now() - ms('1d');
const END = Date.now() + ms('7d');
const sendEmail = require('./send');

module.exports = (subscriber, place, forecast) => {
	return Data.holidays({
		country: subscriber.country,
		lang: subscriber.lang,
		start: START,
		end: END
	}).then((holidays) => {
		holidays = holidays || [];
		return formatEmail(subscriber, place, forecast, holidays)
			.then((message) => {
				if (message) {
					return sendEmail(message);
				}
				return Promise.reject(new Error('No message formated'));
			});
	});
};
