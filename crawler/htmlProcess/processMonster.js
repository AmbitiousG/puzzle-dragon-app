const _ = require('lodash');
const { processCellContent } = require('./utils');

const processCharactorImage = ($) => {
  const td = $('.previous_next').next();
  return { charactorImageUrl: td.find('img').attr('src') };
};

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
  let matched = _.trim(td.text()).match(/成長類型: (\d+)萬　COST: (\d+)/);
  if (matched) {
    info.growth = +matched[1];
    info.cost = +matched[2];
  }
  else {
    matched = _.trim(td.text()).match(/COST: (\d+)/);
    info.cost = +matched[1];
  }

  td = table.find('> tbody > tr:nth-child(3) > td');
  info.maxExp = +_.trim(td.text().replace('滿等所需經驗值:', '')) || 0;

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
  activeSkill.skill_max_turn = +_.trim(cells.eq(4).text().replace(/[^0-9]/g, ''));

  //row1
  activeSkill.skill_description_cn = processCellContent($, rows.eq(1).find('td').get(0));

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

const processAssisAndKillerAwoken = ($, table) => {
  const rows = $(table).find('>tbody>tr');
  const isAssistive = rows.eq(1).text().indexOf('✔') != -1;
  return {
    isAssistive
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

const processLeaderSkill = ($, table) => {//leader_skill
  const rows = $(table).find('>tbody>tr');
  let skill = {};
  skill.skill_name = _.trim(rows.eq(0).find('td').eq(0).find('a').text());

  skill.skill_description_cn = processCellContent($, rows.eq(1).find('td').get(0));
  return {
    leader_skill: skill
  };
};

const processExtraInfo = ($, table) => {
  const rows = table.find('>tbody>tr').slice(1);
  let fromEvolution;
  let fromShop;
  let fromFriendship;
  let fromGatcha;
  let gachaName;
  let fromDungeon;
  let fromDungeonList = [];
  let switchable;
  function getTxt(row) {
    return row.find('td').eq(1).text();
  }
  fromEvolution = getTxt(rows.eq(0)).indexOf('✔') != -1;
  fromShop = getTxt(rows.eq(1)).indexOf('✔') != -1;
  fromFriendship = getTxt(rows.eq(2)).indexOf('✔') != -1;
  fromGatcha = getTxt(rows.eq(3)).indexOf('✖') == -1;
  if (fromGatcha) {
    gachaName = _.trim(getTxt(rows.eq(3)));
  }
  // fromDungeon = getTxt(rows.eq(4)).indexOf('✔');
  rows.eq(4).find('a').each((index, aTag) => {
    fromDungeonList.push({
      dungeon_name: _.trim($(aTag).text())
    });
  });
  fromDungeon = fromDungeonList.length > 0;

  switchable = getTxt(rows.eq(5)).indexOf('寵物交換所') != -1;

  return {
    fromEvolution,
    fromShop,
    fromFriendship,
    fromGatcha,
    gachaName,
    fromDungeon,
    fromDungeonList,
    switchable
  };
};

const processEvolution = ($, table, monster_id) => {
  // const aTags = $(table).find('.EvoTarget');
  let curMonsterTag = $(table).find('.pic').parent();
  let materials = [];
  let shinkaMonster;
  let megaShinkaMonster = [];
  let shinkaFrom;
  let shinkaAssist;
  if(curMonsterTag) {
    curMonsterTag.nextAll('.tooltip').each((index, aTag) => {
      const arr = $(aTag).attr('title').split('-');
      materials.push({
        monster_id: +_.trim(arr[0]),
        name: _.trim(arr[1])
      });
    });
    //process shinka monsters
    let 
    curMonsterTag.nextAll('ul').find('>li').each((index, li) => {
      const evoTags = $('li').find('>.EvoTarget');
      const type = evoTags.eq(0).attr('href');
      const shikaMonster_id = +evoTags.eq(1).attr('href').replace(/[^0-9]/g, '');
    });

  }
  return {
    shinkaMaterials: materials
  };
};

module.exports.processMonster = (monster_id, $) => {
  const mainTables = $('.previous_next').closest('table').parent().find('>table');
  let extraInfoTable = mainTables.eq(8);
  if (extraInfoTable.find('>tbody>tr').eq(0).text().indexOf('入手方法') == -1) {
    extraInfoTable = extraInfoTable.nextAll('table').eq(0);
  }
  return {
    monster_id,
    ...processCharactorImage($),
    ...processMainInfo($, $(mainTables[1])),
    ...processMonsterStatus($, $(mainTables[2])),
    ...processMonsterValue($, $(mainTables[3])),
    ...processActiveSkill($, $(mainTables[4])),
    ...processAssisAndKillerAwoken($, $(mainTables[5])),
    ...processAwokens($, $(mainTables[6])),
    ...processLeaderSkill($, $(mainTables[7])),
    ...processExtraInfo($, extraInfoTable),
    ...processEvolution($, extraInfoTable.nextAll('table').eq(0), monster_id)
  }
}