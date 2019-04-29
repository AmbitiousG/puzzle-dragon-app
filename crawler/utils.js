const _ = require('lodash');

const generateUrl = monster_id => {
  return `http://pad.skyozora.com/pets/${monster_id}`;
}

const timeout = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const random = (max = 1500, min = 500) => _.random(min, max);

module.exports = {
  generateUrl,
  timeout,
  random
}
