'use strict';

const utils = require('./utils');
const Promise = utils.Promise;
const logger = require('./logger');
const Enumerator = require('./enumerator');
const processSubscriber = require('./process_subscriber');

module.exports = (country) => {
	logger.warn('START COUNTRY: ' + country, { country: country });

	const enumerator = new Enumerator({ group: 'weather-' + country, subscribed: true });

	let count = 0;

	function getSubscribers() {
		return enumerator.next()
			.then((list) => {
				if (list && list.length > 0) {
					// return processSubscriber(list[0]);
					return Promise.each(list, (subscriber) => {
						return processSubscriber(subscriber).then((rs) => {
							if (rs && rs.id) {
								count++;
							}
						});
					}).then(getSubscribers);
				}
			});
	}

	return getSubscribers().then(() => {
		logger.warn(country + ': Sent emails: ' + count);
	});
};
