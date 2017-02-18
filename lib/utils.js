'use strict';

const Isemail = require('isemail');

exports.Promise = require('bluebird');
exports._ = require('lodash');
exports.ms = require('ms');
exports.isemail = function(email) {
	return Isemail.validate(email);
};
