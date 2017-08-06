'use strict';

const logger = require('./logger');
const Consumer = require('sqs-consumer');
const AWS = require('aws-sdk');
const Data = require('./data');

class Bounces {
	constructor(queue) {
		this.queue = queue;
	}

	start(callback) {
		if (this.app) {
			throw new Error('App exists');
		}

		logger.info('start ' + this.queue);

		this.app = Consumer.create({
			queueUrl: this.queue,
			handleMessage: handleMessage,
			sqs: new AWS.SQS({
				accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
				secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY
			})
		});

		this.app.on('error', (err) => {
			logger.error(err);
		});

		this.app.on('empty', callback);

		this.app.start();
	}

	stop() {
		if (this.app) {
			this.app.stop();
		}
		this.app = null;
	}
}
//process.env.SQS_BOUNCES_LIST
function handleMessage(message, done) {
	// console.log(message);

	let json = JSON.parse(JSON.parse(message.Body).Message);
	json = (json.bounce || json.complaint);

	const emails = (json.bouncedRecipients || json.complainedRecipients).map(r => r.emailAddress);

	logger.warn('removing emails', emails);

	Data.EmailSubscriber.remove({ where: { email: { $in: emails } } })
		.then(function (removed) {
			// logger.warn('removed emails', removed);
			done();
		}, done);
}

let bounces;
let complaints;

exports.start = function (callback) {
	bounces = new Bounces(process.env.SQS_BOUNCES_LIST);
	complaints = new Bounces(process.env.SQS_COMPLAINTS_LIST);

	let endCount = 0;

	function end() {
		endCount++;
		if (endCount === 2) {
			return callback();
		}
	}

	bounces.start(() => {
		logger.info('end bounces');
		end();
	});
	complaints.start(() => {
		logger.info('end complaints');
		end();
	});
}

exports.stop = function () {
	bounces.stop();
	complaints.stop();
}