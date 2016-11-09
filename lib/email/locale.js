'use strict';

const locales = require('./locales');
const format = require('util').format;

function get(name, lang) {
	return locales[name] && locales[name][lang] || name;
}

module.exports = get;

module.exports.format = function() {
	const args = Array.prototype.slice.call(arguments);
	const name = args[0];
	const lang = args[1];
	args.splice(0, 2, get(name, lang));

	return format.apply(null, args);
};
