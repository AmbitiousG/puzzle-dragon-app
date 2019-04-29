const Monster = require('./Monster');
const {PARSE_MONSTER_FROM_DB, PARSE_MONSTER_FROM_HTML} = require('./const');
const request = require('request');

    // new Monster(PARSE_MONSTER_FROM_HTML, undefined, )
const fetchMonster = async (id) => {
  return await fetchMonsters([id]);
}
const fetchMonsters = async (ids) => {
  
}

module.exports = {
  fetchMonster,
  fetchMonsters,
}
