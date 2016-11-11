'use strict';

const utils = require('./utils');
const Promise = utils.Promise;
const logger = require('./logger');
const Enumerator = require('./enumerator');
const processSubscriber = require('./process_subscriber');

module.exports = (country) => {
	logger.warn('START COUNTRY: ' + country, { country: country });

	const enumerator = new Enumerator({ group: 'weather-' + country, subscribed: true });

	function getSubscribers() {
		return enumerator.next()
			.then((list) => {
				if (list && list.length > 0) {
					// return processSubscriber(list[0]);
					return Promise.each(list, processSubscriber).then(getSubscribers);
				}
			});
	}

	return getSubscribers();
};
