'use strict';

require('dotenv').load();

const utils = require('../utils');
const Promise = utils.Promise;
const logger = require('../logger');
const EmailSubscriber = require('../data').EmailSubscriber;

function upload() {
    const list = require('../../list.json');
    console.log('count', list.length);
    return Promise.each(list, (subscriber) => {
        const id = EmailSubscriber.createId(subscriber);
        if (id === subscriber.id) {
            return EmailSubscriber.create(subscriber).then(() => console.log('created id=' + id), error => console.log('error', error.message));
        } else {
            console.log('invalid id', subscriber.id);
        }
    });
};

upload().then(() => console.log('END OK'), error => console.error(error)).then(() => process.exit());
