const _ = require('lodash');
const request = require('request');
const cheerio = require('cheerio');
const { generateUrl } = require('./utils');
const { proxy } = require('../db-config');
const { Monster, MonsterAttr, MonsterType, AwokenSkill, ActiveSkill } = require('../db/schema');
const { AWOKEN_SKILL_PAGE_URL, AWOKEN_SKILL_PAGE_JP_URL } = require('./const');
const { processAwokens } = require('./htmlProcess/processAwokens');

module.exports.getMonsterDetail = id => {
  const url = generateUrl(id);

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

module.exports.getAwokenSkills = (isJP = false) => {
  const url = isJP ? AWOKEN_SKILL_PAGE_JP_URL : AWOKEN_SKILL_PAGE_URL;

  return new Promise((resolve, reject) => {
    request({
      uri: url,
      jar: true, //hold cookie
      proxy
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(body);
        resolve(processAwokens($, isJP));
      }
      else {
        reject();
      }
    })
  })
}

module.exports.checkAwokenImage = async () => {
  const awoken = await AwokenSkill.findOne({});
  return awoken && (awoken.skill_image_base64 || '') != '';
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
        monster_image_url: charactorImageUrl
      };
    }
    else {
      return _.pick(monster, ['monster_avatar_base64', 'monster_image_url']);
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
      const result = await MonsterAttr.collection.insertOne({
        name,
        attr_image_base64: await getImageBase64(url)
      });
      return result.insertedId;
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
      const result = await MonsterType.collection.insertOne({
        name,
        type_image_base64: await getImageBase64(url)
      });
      return result.insertedId;
    }
  }
  catch (e) {
    // console.log(e);
  }
};

module.exports.getMonsterAwokenSkillId = async ({ skill_name, skill_description, url }) => {
  try {
    const skill = await AwokenSkill.findOne({ skill_name });
    if (skill) {
      return skill._id;
    }
    else {
      const result = await AwokenSkill.collection.insertOne({
        skill_name,
        skill_description_cn: skill_description,
        skill_image_base64: await getImageBase64(url)
      });
      return result.insertedId;
    }
  }
  catch (e) {
    console.log(e);
  }
}

module.exports.getMonsterActiveSkillId = async ({ skill_name, skill_description_cn, skill_init_turn, skill_max_turn }) => {
  try {
    const skill = await ActiveSkill.findOne({ skill_name });
    if (skill) {
      return skill._id;
    }
    else {
      const result = await ActiveSkill.collection.insertOne({
        skill_name,
        skill_description_cn,
        skill_init_turn,
        skill_max_turn
      });
      return result.insertedId;
    }
  }
  catch (e) {
    console.log(e);
  }
}

module.exports.getMonsterId = async (id) => {
  try {
    const monster = await Monster.findOne({ monster_id: id });
    if (monster) {
      return monster._id;
    }
    else {
      const result = await Monster.collection.insertOne({
        monster_id: id
      });
      return result.insertedId;
    }
  }
  catch (e) {
    console.log(e);
  }
}
