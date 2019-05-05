const { PARSE_MONSTER_FROM_DB, PARSE_MONSTER_FROM_HTML, REQUEST_INTERVAL_MAX, REQUEST_INTERVAL_MIN, SAVE_AMOUNT } = require('./const');
const Monster = require('./Monster');
const { getMonsterDetail } = require('./api');
const { timeout, random } = require('./utils');
const { logFetchStart, logFetchEnd, logFetchError } = require('../logger');
const { saveMonsters } = require('../db/index');

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
