const _ = require('lodash');
const { processCellContent } = require('./utils');

const processActiveSkillsCN = $ => {
  let skills = [];
  $('h3+table').each((index, table) => {
    $(table).find('>tbody>tr').each((rowIndex, row) => {
      if (rowIndex > 0) {
        let skill = {};
        let arrNodes = [];
        const cells = $(row).find('>td');
        skill.skill_name = _.trim(cells.eq(0).text());
        skill.skill_description_cn = processCellContent($, cells.get(1));
        skills.push(skill);
      }
    });
  });
  return skills;
}

const processActiveSkillsJP = $ => {
  let skills = [];
  $('tr.atwiki_tr_1').closest('table').slice(1, 4).each((index, table) => {
    if (index > 0) {//ignore navi table
      $(table).find('>tbody>tr').each((rowIndex, row) => {
        let skill = {};
        const cells = $(row).find('>td');
        if (cells.length < 4 || _.trim(cells.eq(0).text()) == 'スキル名') {
          return;
        }
        skill.skill_name = _.trim(cells.eq(0).text().replace(/●|■/g, ''));
        let matched = _.trim(cells.eq(1).text()).match(/(\d)+/g);//"15(10)"
        skill.skill_init_turn = +matched[0];
        skill.skill_max_turn = +matched[1];
        skill.skill_description = _.trim(cells.eq(3).text());
        skill.same_monsters = [];
        cells.eq(4).find('a').each((aIndex, aTag) => {
          skill.same_monsters.push({
            name: _.trim($(aTag).text()),
            monster_id: +$(aTag).attr('title').match(/(\d+)/)[1]
          });
        });
        skills.push(skill);
      })
    }
  });
  return skills;
}

module.exports.processActiveSkills = ($, isJP) => {
  return isJP ? processActiveSkillsJP($) : processActiveSkillsCN($);
}
