const _ = require('lodash');

const processLeaderSkillsCN = $ => {
  let skills = [];
  return skills;
}

const processLeaderSkillsJP = $ => {
  let skills = [];
  $('tr.atwiki_tr_1').closest('table').each((index, table) => {
    $(table).find('>tbody>tr').each((rowIndex, row) => {
      let skill = {};
      const cells = $(row).find('>td');
      if (cells.length < 4 || _.trim(cells.eq(0).text()) == 'スキル名') {
        return;
      }
      skill.skill_name = _.trim(cells.eq(0).text());
      skill.skill_description = _.trim(cells.eq(1).text());
      skill.same_monsters = [];
      cells.eq(2).find('a').each((aIndex, aTag) => {
        skill.same_monsters.push({
          name: _.trim($(aTag).text()),
          monster_id: +$(aTag).attr('title').match(/(\d+)/)[1]
        });
      });
      skills.push(skill);
    })
  });
  return skills;
}

module.exports.processLeaderSkills = ($, isJP) => {
  return isJP ? processLeaderSkillsJP($) : processLeaderSkillsCN($);
}
