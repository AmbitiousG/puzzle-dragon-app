const _ = require('lodash');
const { processCellContent } = require('./utils');

const processAwokensCN = $ => {
  const table = $('h2').next().find('> table');
  let skills = [];
  table.find('>tbody >tr').each((index, row) => {
    let skill = {};
    const cells = $(row).find('td');
    skill.url = cells.eq(0).find('img').attr('src');
    skill.skill_name = _.trim(cells.eq(1).text());
    // let description = _.trim(cells.eq(2).html().replace(/\n/g, '').replace(/<br>|<br \/>|<br\/>/g, '。').replace(/[；。]+/g, '。'));
    // description = description.replace(/<img.*?([a-zA-Z+]*)\.png(.*?)alt="(.*?)"(.*?)>/g, '$3');
    skill.skill_description_cn = processCellContent($, cells[2]);
    skills.push(skill);
  });
  return skills;
}
const processAwokensJP = $ => {
  const table = $('table').eq(0);
  let skills = [];
  let note = '';
  let arrNote = [];
  table.find('>tbody > tr').each((index, row) => {
    if(index > 0) {//ignore head row
      let skill = {};
      const cells = $(row).find('td');
      if(cells.length == 5) {
        note = '';
        arrNote = [];
        let nodes = cells.eq(4).get(0).childNodes;
        for (const node of nodes) {
          if(node.type == 'text') {
            if(_.trim(node.nodeValue) != '') {
              arrNote.push(_.trim(node.nodeValue));
            }
          }
          else if(node.type == 'tag') {
            if(node.name == 'br') {
              arrNote.push('<br>');
            }
            else if(node.name == 'strong') {
              arrNote.push(`<strong>${_.trim($(node).text())}</strong>`);
            }
            else {
              arrNote.push(_.trim($(node).text()));
            }
          }
        }
        note = arrNote.join('');
      }
      skill.url = cells.eq(0).find('img.atwiki_plugin_image').data('original');
      skill.skill_name = _.trim(cells.eq(1).text());
      if(skill.skill_name == 'スキル封印耐性') {
        skill.skill_name = '封印耐性';
      }
      skill.skill_name = skill.skill_name.replace('+', '＋');
      skill.skill_description = _.trim(cells.eq(2).text());
      skill.note = note;
      skills.push(skill);
    }
  });
  return skills;
}

module.exports.processAwokens = ($, isJP) => {
  return isJP ? processAwokensJP($) : processAwokensCN($);
}
