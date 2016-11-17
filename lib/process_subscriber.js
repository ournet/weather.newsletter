'use strict';

const utils = require('./utils');
const Promise = utils.Promise;
const ms = utils.ms;
const logger = require('./logger');
const INTERVAL = ms(process.env.NEWSLETTER_INTERVAL || '2d');
const Data = require('./data');
const EmailSubscriber = Data.EmailSubscriber;
const processEmail = require('./email/process');
const LANGUAGES = ['ro', 'ru'];
const EMAIL_WEEKDAY = parseInt(process.env.EMAIL_WEEKDAY || 5);
const moment = require('moment-timezone');

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

	if (subscriber.emailSentAt && subscriber.emailSentAt.getTime() + INTERVAL > Date.now()) {
		logger.warn('emailSentAt is invalid', subscriber);
		return Promise.resolve();
	}

	return getPlace(subscriber)
		.delay(1000 * 1)
		.then((place) => {
			if (place) {
				const weekday = moment().tz(place.timezone).isoWeekday();
				if (weekday !== EMAIL_WEEKDAY) {
					logger.warn('Invalid weekday: ' + weekday);
					return;
				}
				return getForecast(place)
					.then((forecast) => {
						if (!forecast) {
							logger.error('no weather report: ' + place.name);
							return null;
						}
						return processEmail(subscriber, place, forecast)
							.then(() => {
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
