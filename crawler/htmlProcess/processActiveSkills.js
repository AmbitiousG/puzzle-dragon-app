const _ = require('lodash');
const DROP_TYPES = {
  "fire": "[火]",
  "water": "[水]",
  "wood": "[木]",
  "light": "[光]",
  "dark": "[暗]",
  "heart": "[回复]",
  "fire+": "[火强化]",
  "water+": "[水强化]",
  "wood+": "[木强化]",
  "light+": "[光强化]",
  "dark+": "[暗强化]",
  "heart+": "[回复强化]",
  "dead": "[邪魔]",
  "poison": "[毒]",
  "poison+": "[猛毒]",
  "bomb": "[炸弹]"
}

const processActiveSkillsCN = $ => {
  let skills = [];
  $('h3+table').each((index, table) => {
    $(table).find('>tbody>tr').each((rowIndex, row) => {
      if (rowIndex > 0) {
        let skill = {};
        let arrNodes = [];
        const cells = $(row).find('>td');
        skill.skill_name = _.trim(cells.eq(0).text());
        for (const node of cells.get(1).childNodes) {
          if (node.type == 'text') {
            arrNodes.push(_.trim(node.nodeValue));
          }
          else if (node.type == 'tag') {
            if (node.name == 'br') {
              arrNodes.push('\n');
            }
            else if (node.name == 'img') {
              let src = $(node).attr('src');
              let matched = src.match(/.*\/(.*?)\.png.*/);
              if(matched && matched.length > 0) {
                let imgName = matched[1].toLowerCase();
                DROP_TYPES[imgName] && arrNodes.push(DROP_TYPES[imgName]);
                if(src.indexOf('change.gif') != -1) {
                  arrNodes.push('=>');
                }
              }
            }
          }
        }
        skill.skill_description_cn = arrNodes.join('');
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
