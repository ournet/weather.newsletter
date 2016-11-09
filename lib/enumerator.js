'use strict';

const Subscriber = require('./data').EmailSubscriber;

module.exports = class Enumerator {
	constructor(where, limit) {
		this.where = where;
		this.offset = 0;
		this.limit = limit || 50;
	}

	next(offset) {
		if (typeof offset !== 'number') {
			offset = this.offset;
		}

		return Subscriber.list({
				where: this.where,
				limit: this.limit,
				offset: offset
			})
			.then((list) => {
				this.offset += this.limit;
				return list;
			});
	}
};
