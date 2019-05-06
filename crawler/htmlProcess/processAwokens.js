const _ = require('lodash');

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
    let arr = [];
    for (const node of cells[2].childNodes) {
      if (node.type == 'text') {
        arr.push(_.trim(node.nodeValue))
      }
      else if (node.type == 'tag') {
        if (node.name == 'img') {
          arr.push(`[${$(node).attr('alt')}]`);
        }
        else if (node.name == 'br') {
          arr.push('。');
        }
      }
    }
    skill.skill_description_cn = arr.join('');
    skills.push(skill);
  });
  return skills;
}
const processAwokensJP = $ => {
  return [];
}

module.exports.processAwokens = ($, isJP) => {
  return isJP ? processAwokensJP($) : processAwokensCN($);
}
