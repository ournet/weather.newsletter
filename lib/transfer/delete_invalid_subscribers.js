'use strict';

require('dotenv').load();

const utils = require('../utils');
const Promise = utils.Promise;
const logger = require('../logger');
const Enumerator = require('../enumerator');
const EmailSubscriber = require('../data').EmailSubscriber;

function deleteInvalidSubscribers(country) {
    logger.warn('START COUNTRY: ' + country, { country: country });

    const enumerator = new Enumerator({ group: 'weather-' + country });

    let count = 0;

    function getSubscribers() {
        return enumerator.next()
            .then((list) => {
                if (list && list.length > 0) {
                    return Promise.each(list, (subscriber) => {
                        const id = EmailSubscriber.createId(subscriber);
                        if (id !== subscriber.id) {
                            console.log('\t!=id', subscriber.id, id);
                            return EmailSubscriber.remove({ where: { _id: subscriber.id } }).then(() => console.log('deleted id=' + id));
                        }
                    }).then(getSubscribers);
                }
            });
    }

    return getSubscribers().then(() => {
        logger.warn(country + ': Sent emails: ' + count);
    });
};

const COUNTRIES = (process.env.COUNTRIES || '').trim().toLowerCase().split(/[;,| ]+/g);

Promise.each(COUNTRIES, country => {
    return deleteInvalidSubscribers(country);
}).then(() => console.log('END OK'), error => console.error(error)).then(() => process.exit());
