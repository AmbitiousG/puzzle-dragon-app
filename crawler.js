const request = require("request");
const {fetchMonsters, fetchAwokens, fetchActiveSkills} = require('./crawler/index');
const { getFetchingArray } = require('./crawler/utils');
const { connDB } = require('./db/index');
const { Monster, AwokenSkill, ActiveSkill } = require('./db/schema');
const _ = require('lodash');

const startFetch = async () => {
  await connDB();
  fetchMonsters(getFetchingArray());
  // await fetchAwokens(true);
  // await fetchActiveSkills(true);
  // await fetchActiveSkills(false);
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
  // let res = await ActiveSkill.find({}).limit(100).populate('same_monsters', 'name monster_id -_id');
  // res = _.map(res, skill => {
  //   return {
  //     ..._.pick(skill, ['skill_name', 'skill_description']),
  //     same_monsters: _.map(skill.same_monsters, m => _.pick(m, ['name', 'monster_id']))
  //   };
  // });
  // console.log(res); 
  // const monster = await Monster.findOne({monster_id: 5301});
  // console.log(monster);
}

startFetch();
// crawler.fetchMonsters(getFetchingArray());
