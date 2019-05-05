const _ = require('lodash');
const { FETCHING_START_ID, FETCHING_LENGTH } = require('./const');

module.exports.generateUrl = monster_id => {
  return `http://pad.skyozora.com/pets/${monster_id}`;
};

module.exports.getFetchingArray = () => {
  let arr = new Array(FETCHING_LENGTH);
  return _.map(arr, (value, index) => index + FETCHING_START_ID);
};

module.exports.timeout = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports.random = (max = 1500, min = 500) => _.random(min, max);
