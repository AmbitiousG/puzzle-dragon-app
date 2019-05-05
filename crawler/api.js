const _ = require('lodash');
const request = require('request');
const cheerio = require('cheerio');
const { generateUrl } = require('./utils');
const { proxy } = require('../db-config');
const { Monster, MonsterAttr, MonsterType } = require('../db/schema');

module.exports.getMonsterDetail = async id => {
  let url = generateUrl(id);

  return new Promise((resolve, reject) => {
    request({
      uri: url,
      jar: true, //hold cookie
      proxy
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

const getImageBase64 = module.exports.getImageBase64 = url => {
  if (url.indexOf('http') == -1) {
    url = `http://pad.skyozora.com/${url}`;
  }
  return new Promise((resolve, reject) => {
    request({
      url,
      encoding: null, //return Buffer
      proxy
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

module.exports.getMonsterImage = async ({ monster_id, avatarUrl, charactorImageUrl }) => {
  try {
    const monster = await Monster.findOne({ monster_id });
    if (!monster || !monster.monster_avatar_base64) {
      return {
        monster_avatar_base64: await getImageBase64(avatarUrl),
        monster_image_base64: await getImageBase64(charactorImageUrl)
      };
    }
    else {
      return _.pick(monster, ['monster_avatar_base64', 'monster_image_base64']);
    }
  }
  catch (e) {
    // console.log(e);
  }
};

module.exports.getMonsterAttrId = async ({ name, url }) => {
  try {
    const attr = await MonsterAttr.findOne({ name });
    if (attr) {
      return attr._id;
    }
    else {
      attr = await MonsterAttr.collection.insertOne({
        name,
        attr_image_base64: await getImageBase64(url)
      });
      return attr._id;
    }
  }
  catch (e) {
    // console.log(e);
  }
};

module.exports.getMonsterTypeId = async ({ name, url }) => {
  try {
    const attr = await MonsterType.findOne({ name });
    if (attr) {
      return attr._id;
    }
    else {
      attr = await MonsterType.collection.insertOne({
        name,
        type_image_base64: await getImageBase64(url)
      });
      return attr._id;
    }
  }
  catch (e) {
    // console.log(e);
  }
};
