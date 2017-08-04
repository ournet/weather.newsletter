'use strict';

require('dotenv').load();
const logger = require('./logger');
const processSubscriber = require('./process_subscriber');
const subscriber = {
    id: "097587d8d7deb13ef54479e8869f6518",
    group: "weather-md",
    target: "618196",
    email: "canteadumitru@gmail.com",
    lang: process.env.LANG || "ro",
    country: process.env.COUNTRY || "md"
};

processSubscriber(subscriber).then(() => console.log('END OK'), console.error).then(() => process.exit());
