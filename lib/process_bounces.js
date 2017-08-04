'use strict';

const logger = require('./logger');
const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');
const Data = require('./data');

let app;

function handleMessage(message, done) {
	// console.log(message);

	const emails = JSON.parse(JSON.parse(message.Body).Message).bounce.bouncedRecipients.map(r => r.emailAddress);

	logger.warn('removing emails', emails);

	Data.EmailSubscriber.remove({ where: { email: { $in: emails } } })
		.then(function(removed) {
			// logger.warn('removed emails', removed);
			done();
		}, done);
}

exports.start = function(callback) {
	if (app) {
		throw new Error('App exists');
	}

	app = Consumer.create({
		queueUrl: process.env.SQS_BOUNCES_LIST,
		handleMessage: handleMessage,
		sqs: new AWS.SQS({
			accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY
		})
	});

	app.on('error', (err) => {
		logger.error(err);
	});

	app.on('empty', callback);

	app.start();
};

exports.stop = function() {
	if (app) {
		app.stop();
	}
	app = null;
};
