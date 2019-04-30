const { PARSE_MONSTER_FROM_DB, PARSE_MONSTER_FROM_HTML, REQUEST_INTERVAL_MAX, REQUEST_INTERVAL_MIN, SAVE_AMOUNT } = require('./const');
const Monster = require('./Monster');
const { getMonsterDetail } = require('./api');
const { timeout, random } = require('./utils');
const { logFetchStart, logFetchEnd } = require('../logger');
const {saveMonsters} = require('../db/index');

// new Monster(PARSE_MONSTER_FROM_HTML, undefined, )
module.exports.fetchMonster = async (id) => {
  return await fetchMonsters([id]);
}
module.exports.fetchMonsters = async (ids) => {
  let monsterArr = [];
  for (id of ids) {
    // log(chalk.green(`fetch monster[id: ${id}]:`));
    logFetchStart(id);
    const $ = await getMonsterDetail(id);
    // log(chalk.green('fetch done'));
    // log(chalk.blue('monster detail:'), $);
    let monster = new Monster(id, PARSE_MONSTER_FROM_HTML, undefined, $);
    logFetchEnd(monster.id, monster.name, monster.name_cn);
    monsterArr.push(monster.plainData);
    if(id == ids[ids.length - 1] || monsterArr.length == SAVE_AMOUNT) {
      await saveMonsters(monsterArr);
      monsterArr = [];
    }
    timeout(random());
  }
}
