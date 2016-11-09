'use strict';

require('dotenv').load();

var EmailSubscriber = require('./data').EmailSubscriber;

EmailSubscriber.list({
		where: {
			group: 'weather'
		},
		limit: 100
	})
	.each(function(subscriber) {
		console.log('subscriber', subscriber.email);
		return EmailSubscriber.update({
			id: subscriber.id,
			group: subscriber.group + '-' + subscriber.country
		});
	});
