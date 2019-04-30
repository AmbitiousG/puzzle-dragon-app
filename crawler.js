const request = require("request");
const crawler = require('./crawler/index');
const { getFetchingArray } = require('./crawler/utils');


crawler.fetchMonsters(getFetchingArray());
