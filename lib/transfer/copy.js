'use strict';

require('dotenv').load();

const utils = require('../utils');
const Promise = utils.Promise;
const logger = require('../logger');
const Enumerator = require('../enumerator');
const EmailSubscriber = require('../data').EmailSubscriber;
const fs = require('fs');

function deleteInvalidSubscribers() {

    const enumerator = new Enumerator({});

    let allList = [];

    function getSubscribers() {
        return enumerator.next()
            .then((list) => {
                if (list && list.length > 0) {
                    allList = allList.concat(list);
                    return getSubscribers();
                }
            });
    }

    return getSubscribers().then(() => {
        fs.writeFileSync('./list.json', JSON.stringify(allList), { encoding: 'utf8' });
    });
};

deleteInvalidSubscribers().then(() => console.log('END OK'), error => console.error(error)).then(() => process.exit());
