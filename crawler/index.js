const { PARSE_MONSTER_FROM_DB, PARSE_MONSTER_FROM_HTML, REQUEST_INTERVAL_MAX, REQUEST_INTERVAL_MIN } = require('./const');
const Monster = require('./Monster');
const { getMonsterDetail } = require('./api');
const { timeout, random } = require('./utils');

const chalk = require('chalk');
const log = console.log;

// new Monster(PARSE_MONSTER_FROM_HTML, undefined, )
const fetchMonster = async (id) => {
    return await fetchMonsters([id]);
}
const fetchMonsters = async (ids) => {
  for (id of ids) {
    log(chalk.green(`fetch monster[id: ${id}]:`));
    const $ = await getMonsterDetail(id);
    log(chalk.green('fetch done'));
    // log(chalk.blue('monster detail:'), $);
    let monster = new Monster(id, PARSE_MONSTER_FROM_HTML, undefined, $);
    timeout(random());
  }
}

module.exports = {
  fetchMonster,
  fetchMonsters,
}
