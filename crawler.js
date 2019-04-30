const request = require("request");
const crawler = require('./crawler/index');
const { getFetchingArray } = require('./crawler/utils');
const { connDB } = require('./db/index');


const startFetch = async () => {
  await connDB();
  crawler.fetchMonsters(getFetchingArray());
}

startFetch();
