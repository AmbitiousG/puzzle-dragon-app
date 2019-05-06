const request = require("request");
const crawler = require('./crawler/index');
const { getFetchingArray } = require('./crawler/utils');
const { connDB } = require('./db/index');
const { Monster } = require('./db/schema');
const _ = require('lodash');

const startFetch = async () => {
  await connDB();
  crawler.fetchMonsters(getFetchingArray());
  // const monsters = await Monster
  //   .find({})
  //   .populate('awoken_skills', 'skill_name -_id')
  //   .populate('monster_attr', 'name -_id')
  //   .populate('monster_sub_attr', 'name -_id');
  // let mapped = _.map(monsters, m => _.pick(m, ['monster_id', 'name', 'monster_attr', 'monster_sub_attr', 'awoken_skills']));
  // mapped = _.map(mapped, m => ({
  //   ...m,
  //   monster_attr: m.monster_attr && m.monster_attr.name,
  //   monster_sub_attr: m.monster_sub_attr && m.monster_sub_attr.name,
  //   awoken_skills: _.map(m.awoken_skills, 'skill_name')
  // }));
}

startFetch();
