'use strict';

const utils = require('./utils');
const Promise = utils.Promise;
const ms = utils.ms;
const logger = require('./logger');
const INTERVAL = ms(process.env.NEWSLETTER_INTERVAL || '2d');
const Data = require('./data');
const EmailSubscriber = Data.EmailSubscriber;
const processEmail = require('./email/process');
const LANGUAGES = ['ro'];

function getPlace(subscriber) {
	const placeId = parseInt(subscriber.target);

	return Data.places.access.place(placeId, { getRegion: true })
		.then((place) => {
			if (!place) {
				logger.error('Not found place: ' + placeId);
			}
			return place;
		});
}

function getForecast(place) {
	const selector = Data.weather.forecast.formatSelector(place);
	return Data.weather.access.getForecast(selector.key, selector, { provider: 'metno' }).timeout(1000 * 6);
}


module.exports = (subscriber) => {
	logger.info('START SUBSCRIBER: ' + subscriber.email);

	if (LANGUAGES.indexOf(subscriber.lang) < 0) {
		logger.info('Unsupported language: ' + subscriber.lang);
		return Promise.resolve();
	}

	if (subscriber.emailSentAt && subscriber.emailSentAt.toTime() + INTERVAL > Date.now()) {
		logger.info('emailSentAt is invalid');
		return Promise.resolve();
	}

	return getPlace(subscriber)
		.then((place) => {
			if (place) {
				return getForecast(place)
					.then((forecast) => {
						if (!forecast) {
							logger.error('no weather report: ' + place.name);
							return null;
						}
						return processEmail(subscriber, place, forecast)
							.then(() => {
								return null;
								return EmailSubscriber.update({
									id: subscriber.id,
									emailSentAt: new Date()
								});
							});
					});
			}
		})
		.catch((error) => {
			logger.error(error);
		});
};
