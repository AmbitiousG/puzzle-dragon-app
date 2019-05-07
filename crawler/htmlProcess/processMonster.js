const _ = require('lodash');

const processMainInfo = ($, table) => {//avatarUrl
  // rare
  // name
  // name_cn
  // monster_attr
  // monster_sub_attr
  // monster_types
  // growth
  // cost
  // maxExp
  let info = {};
  const tds = table.find('> tbody > tr:nth-child(1) > td');
  info.avatarUrl = $(tds[0]).find('img').attr('src');
  for (const node of $(tds[0]).find('td')[1].childNodes) {
    let val = _.trim($(node).text());
    if (node.nodeType == 3) {//Node.TEXT_NODE
      if (val !== '') {
        info.rare = val.length;
      }
    }
    else if (node.tagName.toUpperCase() == 'H3') {
      info.name = val.replace(/^No\.\d+ - /, '');
    }
    else if (node.tagName.toUpperCase() == 'H2') {
      info.name_cn = val;
    }
  }
  //process attr
  let aTags = $(tds[1]).find('.tooltip');
  if (aTags.length > 0) {
    info.monster_attr = {
      name: $(aTags[0]).attr('title').replace('主屬性:', ''),
      url: $(aTags[0]).find('img').attr('src')
    };
    if (aTags.length > 1) {
      info.monster_sub_attr = {
        name: $(aTags[1]).attr('title').replace('副屬性:', ''),
        url: $(aTags[1]).find('img').attr('src')
      }
    }
  }
  //process type
  info.monster_types = [];
  $(tds[2]).find('.tooltip').each((index, aTag) => {
    info.monster_types.push({
      name: $(aTag).attr('title'),
      url: $(aTag).find('img').attr('src')
    });
  });

  //
  let td = table.find('> tbody > tr:nth-child(2) > td');
  const matched = _.trim(td.text()).match(/成長類型: (\d+)萬　COST: (\d+)/);
  info.growth = +matched[1];
  info.cost = +matched[2];

  td = table.find('> tbody > tr:nth-child(3) > td');
  info.maxExp = +_.trim(td.text().replace('滿等所需經驗值:', ''));

  return info;
};

const processMonsterStatus = ($, table) => {//hp, atk...
  let status = {};
  const rows = table.find('>tbody>tr');
  //row0
  let cells = $(rows[0]).find('table td');
  status.hp_lv1 = +_.trim($(cells[1]).text().replace(/hp:/i, ''));
  status.atk_lv1 = +_.trim($(cells[2]).text().replace(/攻擊力:/i, ''));
  status.rcv_lv1 = +_.trim($(cells[3]).text().replace(/回復力:/i, ''));

  //row1
  cells = $(rows[1]).find('table td');
  status.maxLv = +_.trim($(cells[0]).text().replace(/lv\./i, ''));
  status.hp_max = +_.trim($(cells[1]).text().replace(/hp:/i, ''));
  status.atk_max = +_.trim($(cells[2]).text().replace(/攻擊力:/i, ''));
  status.rcv_max = +_.trim($(cells[3]).text().replace(/回復力:/i, ''));

  if (rows.length > 3) {
    const row = $(rows[rows.length - 2]);
    if (row.find('td').eq(0).text().indexOf('等級界限突破') != -1) {

      cells = row.find('table td');
      status.hp_break = +_.trim($(cells[1]).text().replace(/hp:/i, ''));
      status.atk_break = +_.trim($(cells[2]).text().replace(/攻擊力:/i, ''));
      status.rcv_break = +_.trim($(cells[3]).text().replace(/回復力:/i, ''));
    }
  }
  return status;
};

const processMonsterValue = ($, table) => {//sell_gold...
  /*sell_gold
  sell_mp
  feed_exp*/
  const ret = {};
  let cell = table.find('#sc');
  ret.sell_gold = +cell.text();
  cell = table.find('.yellow.bold');
  ret.sell_mp = +cell.text();
  cell = table.find('#mc');
  ret.feed_exp = +cell.text();
  return ret;
};

const processActiveSkill = ($, table) => {//active_skill...
  const rows = table.find('>tbody>tr');
  //row0
  let activeSkill = {};
  let cells = $(rows[0]).find('td');
  activeSkill.skill_name = _.trim(cells.eq(0).find('span').text());
  activeSkill.skill_init_turn = +_.trim(cells.eq(2).text());
  activeSkill.skill_max_turn = +_.trim(cells.eq(4).text());

  //row1
  activeSkill.skill_description_cn = $(rows[1]).find('td').html();

  //row2
  // let aTags = $(rows[2]).find('.tooltip');
  // let active_skill_same_monsters = [];
  // aTags.each((index, aTag) => {
  //   active_skill_same_monsters.push(+$(aTag).attr('href').replace('pets/', ''));
  // });
  return {
    active_skill: activeSkill,
    // active_skill_same_monsters
  };
};

const processAwokens = ($, table) => {
  const rows = table.find('>tbody > tr')
  let awokenSkills = [];
  let breakSkills = [];
  rows.each((i, row) => {
    const aTags = $(row).find('.tooltip');
    aTags.each((j, aTag) => {
      const title = $(aTag).attr('title');
      const matched = title.replace(/\n/g, '').match(/^【(.*?)】(.*?)$/);
      (i == 0 ? awokenSkills : breakSkills).push({
        skill_name: matched[1],
        // skill_description: matched[2],
        // url: $(aTag).find('img').attr('src')
      });
    });
  });
  return {
    awoken_skills: awokenSkills,
    break_skills: breakSkills
  };
};

const processCharactorImage = ($) => {
  const td = $('.previous_next').next();
  return { charactorImageUrl: td.find('img').attr('src') };
};

module.exports.processMonster = ($) => {
  const mainTables = $('.previous_next').closest('table').parent().find('>table');
  return {
    ...processCharactorImage($),
    ...processMainInfo($, $(mainTables[1])),
    ...processMonsterStatus($, $(mainTables[2])),
    ...processMonsterValue($, $(mainTables[3])),
    ...processActiveSkill($, $(mainTables[4])),
    ...processAwokens($, $(mainTables[6])),
  }
}