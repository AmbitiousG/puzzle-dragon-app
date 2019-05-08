const { PARSE_MONSTER_FROM_DB, PARSE_MONSTER_FROM_HTML, REQUEST_INTERVAL_MAX, REQUEST_INTERVAL_MIN, SAVE_AMOUNT } = require('./const');
const Monster = require('./Monster');
const { getMonsterDetail, getAwokenSkills, getImageBase64, checkAwokenImage, getActiveSkills, getAndUpdateMonsterIds, getLeaderSkills } = require('./api');
const { timeout, random } = require('./utils');
const { logFetchStart, logFetchEnd, logFetchError } = require('../logger');
const { saveMonsters, saveAwokenSkills, saveActiveSkills, saveLeaderSkills } = require('../db/index');
const _ = require('lodash');

// new Monster(PARSE_MONSTER_FROM_HTML, undefined, )
module.exports.fetchMonster = async (id) => {
  return await fetchMonsters([id]);
}
module.exports.fetchMonsters = async (ids) => {
  let monsterArr = [];
  for (id of ids) {
    try {
      logFetchStart(id);
      const $ = await getMonsterDetail(id);
      let monster = new Monster(id, PARSE_MONSTER_FROM_HTML, undefined, $);
      let monsterObj = await monster.getPlainData()
      monsterArr.push(monsterObj);
      logFetchEnd(monsterObj.monster_id, monsterObj.name, monsterObj.name_cn);
    }
    catch (e) {
      console.log(e)
      // logFetchError(id, e);
    }
    if (id == ids[ids.length - 1] || monsterArr.length == SAVE_AMOUNT) {
      // console.log(await saveMonsters(monsterArr));
      await saveMonsters(monsterArr);
      monsterArr = [];
    }
    timeout(random());
  }
}

module.exports.fetchAwokens = async (isJP = false) => {
  const imageDone = await checkAwokenImage();
  try {
    let skills = await getAwokenSkills(isJP);
    if (imageDone) {
      skills = _.map(skills, skill => _.omit(skill, 'url'));
    }
    else {
      skills = await Promise.all(_.map(skills, async skill => ({
        ..._.omit(skill, 'url'),
        skill_image_base64: await getImageBase64(skill.url)
      })));
    }
    await saveAwokenSkills(skills);
  }
  catch (e) {
    console.log(e)
    // logFetchError(id, e);
  }
}

module.exports.fetchActiveSkills = async (isJP = false) => {
  try {
    let skills = await getActiveSkills(isJP);
    let sameMonsters = _(skills).map('same_monsters').compact().flatten().uniqBy('monster_id').value();
    if (sameMonsters.length > 0) {
      let monsterObj = await getAndUpdateMonsterIds(sameMonsters);
      skills = _.map(skills, skill => ({
        ...skill,
        same_monsters: _.map(skill.same_monsters, monster => monsterObj[monster.monster_id])
      }));
    }
    await saveActiveSkills(skills);
  }
  catch (e) {
    console.log(e)
    // logFetchError(id, e);
  }
}

module.exports.fetchLeaderSkills = async (isJP = false) => {
  try {
    let skills = await getLeaderSkills(isJP);
    let sameMonsters = _(skills).map('same_monsters').compact().flatten().uniqBy('monster_id').value();
    if (sameMonsters.length > 0) {
      let monsterObj = await getAndUpdateMonsterIds(sameMonsters);
      skills = _.map(skills, skill => ({
        ...skill,
        same_monsters: _.map(skill.same_monsters, monster => monsterObj[monster.monster_id])
      }));
    }
    await saveLeaderSkills(skills);
  }
  catch (e) {
    console.log(e)
    // logFetchError(id, e);
  }
}
