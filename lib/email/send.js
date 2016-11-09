'use strict';

const utils = require('../utils');
const Promise = utils.Promise;
const logger = require('../logger');
const Data = require('../data');

const nodemailer = require('nodemailer');
const ses = require('nodemailer-ses-transport');
const transporter = Promise.promisifyAll(nodemailer.createTransport(ses({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION
})));

module.exports = (message) => {
	console.log(message);
	return;
	return transporter.sendMail(message);
};
