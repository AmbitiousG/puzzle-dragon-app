const _ = require('lodash');
const request = require('request');
const cheerio = require('cheerio');
const { generateUrl } = require('./utils');
const { proxy } = require('../db-config');
const { Monster, MonsterAttr, MonsterType, AwokenSkill, ActiveSkill, LeaderSkill, Dungeon } = require('../db/schema');
const { AWOKEN_SKILL_PAGE_URL, AWOKEN_SKILL_PAGE_JP_URL, ACTIVE_SKILL_PAGE_JP_URL, ACTIVE_SKILL_PAGE_URL, LEADER_SKILL_PAGE_JP_URL } = require('./const');
const { processAwokens } = require('./htmlProcess/processAwokens');
const { processActiveSkills } = require('./htmlProcess/processActiveSkills');
const { processLeaderSkills } = require('./htmlProcess/processLeaderSkills');

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

module.exports.getActiveSkills = (isJP = false) => {
  const url = isJP ? ACTIVE_SKILL_PAGE_JP_URL : ACTIVE_SKILL_PAGE_URL;

  return new Promise((resolve, reject) => {
    request({
      uri: url,
      jar: true, //hold cookie
      proxy
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(body);
        resolve(processActiveSkills($, isJP));
      }
      else {
        reject();
      }
    })
  })
}

module.exports.getLeaderSkills = (isJP = false) => {
  isJP = true;
  const url = LEADER_SKILL_PAGE_JP_URL;

  return new Promise((resolve, reject) => {
    request({
      uri: url,
      jar: true, //hold cookie
      proxy
    }, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(body);
        resolve(processLeaderSkills($, isJP));
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
        // monster_avatar_base64: await getImageBase64(avatarUrl),
        monster_avatar_url: avatarUrl,
        monster_image_url: charactorImageUrl
      };
    }
    else {
      return _.pick(monster, ['monster_avatar_url', 'monster_image_url']);
      // return _.pick(monster, ['monster_avatar_base64', 'monster_image_url']);
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

module.exports.getMonsterActiveSkillId = async ({ monster_id, name }, { skill_name, skill_description_cn, skill_init_turn, skill_max_turn }) => {
  try {
    const skill = await ActiveSkill.findOne({ skill_name });
    if (skill) {
      const monsterId = await getMonsterId({ monster_id, name });
      _.assign(skill, {
        skill_description_cn,
        skill_init_turn,
        skill_max_turn,
        same_monsters: _.unionBy(skill.same_monsters || [], [monsterId], item => item.toString())
      });
      await skill.save();
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

module.exports.getMonsterLeaderSkillId = async ({ monster_id, name }, { skill_name, skill_description_cn }) => {
  try {
    const skill = await LeaderSkill.findOne({ skill_name });
    if (skill) {
      const monsterId = await getMonsterId({ monster_id, name });
      _.assign(skill, {
        skill_description_cn,
        same_monsters: _.unionBy(skill.same_monsters || [], [monsterId], item => item.toString())
      });
      await skill.save();
      return skill._id;
    }
    else {
      const result = await LeaderSkill.collection.insertOne({
        skill_name,
        skill_description_cn
      });
      return result.insertedId;
    }
  }
  catch (e) {
    console.log(e);
  }
}

const getMonsterId = module.exports.getMonsterId = async ({ monster_id, name } = {}) => {
  if (!monster_id) return null;
  try {
    const monster = await Monster.findOne({ monster_id });
    if (monster) {
      return monster._id;
    }
    else {
      const result = await Monster.collection.insertOne({
        monster_id,
        name
      });
      return result.insertedId;
    }
  }
  catch (e) {
    console.log(e);
  }
}

const getDungeonId = module.exports.getDungeonId = async ({ dungeon_name }) => {
  try {
    const dungeon = await Dungeon.findOne({ dungeon_name });
    if (dungeon) {
      return dungeon._id;
    }
    else {
      const result = await Dungeon.collection.insertOne({
        dungeon_name
      });
      return result.insertedId;
    }
  }
  catch (e) {
    console.log(e);
  }
}

module.exports.getAndUpdateMonsterIds = async (monsters = []) => {
  try {
    // await Monster.collection.insertMany(monsters, {
    //   ordered: false
    // });
    const bulkOp = Monster.collection.initializeOrderedBulkOp();
    for (const monster of monsters) {
      bulkOp.find({ monster_id: monster.monster_id }).upsert().updateOne({
        $set: monster
      });
    }
    monsters.length > 0 && await bulkOp.execute();
  }
  catch (e) {
    // console.log(e);
  }
  const allMonsters = await Monster.find({}, { monster_id: 1 });
  return _.reduce(monsters, (res, { monster_id }) => {
    res[monster_id] = _.find(allMonsters, { monster_id })._id;
    return res;
  }, {});
}

module.exports.getShinkaMonsters = async ({
  normalShinka,
  shinkaFrom,
  shinkaMaterials,
  megaShinkaMonsters,
  assistShinka,
  dotShinka,
  tenseiShinka
}) => {
  let materials = _.concat(shinkaMaterials || [],
    _(megaShinkaMonsters || []).map('shinkaMaterials').flatten().compact().value(),
    _(megaShinkaMonsters || []).map(m => _.pick(m, 'monster_id')).compact().value());
  let monsterObj = await module.exports.getAndUpdateMonsterIds(materials);
  shinkaMaterials = _.map(shinkaMaterials, material => monsterObj[material.monster_id]);
  megaShinkaMonsters = _.map(megaShinkaMonsters, monster => ({
    ...monster,
    shinkaMaterials: _.map(monster.shinkaMaterials, m => monsterObj[m.monster_id])
  }));
  monsterObj = await module.exports.getAndUpdateMonsterIds(_.compact([...megaShinkaMonsters, normalShinka, shinkaFrom, assistShinka, dotShinka, tenseiShinka]));
  megaShinkaMonsters = _.map(megaShinkaMonsters, monster => monsterObj[monster.monster_id]);
  return {
    normalShinka: normalShinka ? monsterObj[normalShinka.monster_id] : null,
    shinkaFrom: shinkaFrom ? monsterObj[shinkaFrom.monster_id] : null,
    shinkaMaterials,
    megaShinkaMonsters,
    assistShinka: assistShinka ? monsterObj[assistShinka.monster_id] : null,
    dotShinka: dotShinka ? monsterObj[dotShinka.monster_id] : null,
    tenseiShinka: tenseiShinka ? monsterObj[tenseiShinka.monster_id] : null
  }
}
