'use strict';

const utils = require('../utils');
const Promise = utils.Promise;
const logger = require('../logger');
const Data = require('../data');
const Place = Data.places.Place;
const pug = require('pug');
const S = require('./locale');
const util = require('util');
const moment = require('moment-timezone');

function formatMessage(locals) {

	const place = locals.place;
	const lang = locals.currentCulture.lang;

	const startDate = locals.startDate;
	const startDateFormat = startDate.format('DD-MM-YYYY');
	const placeName = Place.getName(place, lang);

	let title = S.format('email_title', lang, placeName);
	if (locals.isWeekend) {
		title = S.format('email_title_weekend', lang, placeName);
	} else if (locals.isWeekstart) {
		title = S.format('email_title_weekstart', lang, placeName);
	}

	locals.title = title;

	const html = pug.renderFile(__dirname + '/email.pug', locals);

	return {
		subject: title,
		html: html,
		to: locals.subscriber.email,
		from: process.env.FROM_EMAIL
	};
}

module.exports = (subscriber, place, forecast, holidays) => {
	const formatDate = (d) => {
		return moment(d).tz(place.timezone).locale(subscriber.lang);
	};

	const weekday = (date) => {
		if (!date.day) {
			date = formatDate(date);
		}
		return date.isoWeekday();
	};

	const locals = {
		subscriber: subscriber,
		place: place,
		forecast: forecast,
		holidays: holidays,
		S: S,
		util: {
			format: util.format,
			moment: moment,
			date: formatDate,
			weekday: weekday,
			isWeekend: (date) => {
				// 1 - Luni
				return [5, 6].indexOf(weekday(date)) > -1;
			},
			isWeekstart: (date) => {
				// 1 - Luni
				return [1].indexOf(weekday(date)) > -1;
			},
			Place: Place
		},
		currentDate: formatDate(),
		currentCulture: {
			lang: subscriber.lang,
			country: subscriber.country
		}
	};

	locals.startDate = locals.currentDate.clone().add(1, 'd');
	locals.isWeekend = locals.util.isWeekend(locals.startDate);
	locals.isWeekstart = locals.util.isWeekstart(locals.startDate);

	const message = formatMessage(locals);

	return Promise.resolve(message);
};
