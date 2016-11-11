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
const links = require('ournet.links');
const path = require('path');

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

	const html = pug.renderFile(path.join(__dirname, 'email.pug'), locals);

	return {
		subject: title,
		html: html,
		to: locals.subscriber.email,
		from: util.format('"%s" <%s>',locals.links.projectName(locals.currentCulture.country) , process.env.FROM_EMAIL)
	};
}

module.exports = (subscriber, place, forecast, holidays) => {
	// console.log('holidays', holidays);

	const currentCulture = {
		lang: subscriber.lang,
		country: subscriber.country
	};

	const formatDate = (d) => {
		return moment(d).tz(place.timezone).locale(subscriber.lang);
	};

	const weekday = (date) => {
		if (!date.day) {
			date = formatDate(date);
		}
		return date.isoWeekday();
	};

	const placeName = (thePlace) => {
		return Place.getName(thePlace, currentCulture.lang);
	};

	const locals = {
		subscriber: subscriber,
		place: place,
		forecast: forecast,
		holidays: holidays,
		S: S,
		links: links,
		countryLinks: links.country(subscriber.country),
		placeWeatherTitle: util.format(S('place_weather_title', currentCulture.lang), placeName(place)),
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
			placeName: placeName,
			symbolName: (symbol) => {
				return Data.weather.helpers.symbolName(symbol, currentCulture.lang);
			}
		},
		currentDate: formatDate(),
		currentCulture: currentCulture
	};

	locals.startDate = locals.currentDate.clone().add(1, 'd');
	locals.isWeekend = locals.util.isWeekend(locals.startDate);
	locals.isWeekstart = locals.util.isWeekstart(locals.startDate);

	const message = formatMessage(locals);

	return Promise.resolve(message);
};
