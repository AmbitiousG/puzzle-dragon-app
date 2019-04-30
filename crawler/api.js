const _ = require('lodash');
const request = require('request');
const { generateUrl } = require('./utils');
const cheerio = require('cheerio');

module.exports.getMonsterDetail = async id => {
  let url = generateUrl(id);

  return new Promise((resolve, reject) => {
    request({
      uri: url,
      jar: true //hold cookie
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(cheerio.load(body));
      }
      else {
        reject();
      }
    })
  })
}

module.exports.getImageBase64 = url => {
  return new Promise((resolve, reject) => {
    request({
      url,
      encoding: null //return Buffer
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(body.toString('base64'));
      }
      else {
        reject();
      }
    })
  });
}
