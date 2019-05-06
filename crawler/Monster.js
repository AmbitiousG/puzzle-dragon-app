const { PARSE_MONSTER_FROM_DB, PARSE_MONSTER_FROM_HTML } = require('./const');
const { getMonsterImage, getMonsterAttrId, getMonsterTypeId, getMonsterAwokenSkillId } = require('./api');
const _ = require('lodash');

module.exports = class Monster {
  constructor(id, fromDBorHtml, dbModel, $) {//$: cheerio instance
    this.monster_id = id;
    if (fromDBorHtml == PARSE_MONSTER_FROM_HTML) {//from html
      // console.log($)
      this.$ = $;
      this.processCheerio($);
    }
  }

  processCheerio($) {
    this.processCharactorImage($);
    const mainTables = $('.previous_next').closest('table').parent().find('>table');
    this.processMainInfo($, $(mainTables[1]));
    this.processMonsterStatus($, $(mainTables[2]));
    this.processAwokens($, $(mainTables[6]));
  }

  processMainInfo($, table) {//avatarUrl
    // rare
    // name
    // name_cn
    // monster_attr
    // monster_sub_attr
    // monster_types
    // growth
    // cost
    // maxExp
    const tds = table.find('> tbody > tr:nth-child(1) > td');
    this.avatarUrl = $(tds[0]).find('img').attr('src');
    for (const node of $(tds[0]).find('td')[1].childNodes) {
      let val = _.trim($(node).text());
      if (node.nodeType == 3) {//Node.TEXT_NODE
        if (val !== '') {
          this.rare = val.length;
        }
      }
      else if (node.tagName.toUpperCase() == 'H3') {
        this.name = val.replace(/^No\.\d+ - /, '');
      }
      else if (node.tagName.toUpperCase() == 'H2') {
        this.name_cn = val;
      }
    }
    //process attr
    let aTags = $(tds[1]).find('.tooltip');
    if (aTags.length > 0) {
      this.monster_attr = {
        name: $(aTags[0]).attr('title').replace('主屬性:', ''),
        url: $(aTags[0]).find('img').attr('src')
      };
      if (aTags.length > 1) {
        this.monster_sub_attr = {
          name: $(aTags[1]).attr('title').replace('副屬性:', ''),
          url: $(aTags[1]).find('img').attr('src')
        }
      }
    }
    //process type
    this.monster_types = [];
    $(tds[2]).find('.tooltip').each((index, aTag) => {
      this.monster_types.push({
        name: $(aTag).attr('title'),
        url: $(aTag).find('img').attr('src')
      });
    });

    //
    let td = table.find('> tbody > tr:nth-child(2) > td');
    const matched = _.trim(td.text()).match(/成長類型: (\d+)萬　COST: (\d+)/);
    this.growth = +matched[1];
    this.cost = +matched[2];

    td = table.find('> tbody > tr:nth-child(3) > td');
    this.maxExp = +_.trim(td.text().replace('滿等所需經驗值:', ''));
  }

  processMonsterStatus($, table) {//hp, atk...
    const rows = table.find('>tbody>tr');
    //row0
    let cells = $(rows[0]).find('table td');
    this.hp_lv1 = +_.trim($(cells[1]).text().replace(/hp:/i, ''));
    this.atk_lv1 = +_.trim($(cells[2]).text().replace(/攻擊力:/i, ''));
    this.rcv_lv1 = +_.trim($(cells[3]).text().replace(/回復力:/i, ''));

    //row1
    cells = $(rows[1]).find('table td');
    this.maxLv = +_.trim($(cells[0]).text().replace(/lv\./i, ''));
    this.hp_max = +_.trim($(cells[1]).text().replace(/hp:/i, ''));
    this.atk_max = +_.trim($(cells[2]).text().replace(/攻擊力:/i, ''));
    this.rcv_max = +_.trim($(cells[3]).text().replace(/回復力:/i, ''));

    if (rows.length > 3) {
      const row = $(rows[rows.length - 2]);
      if(row.find('td').eq(0).text().indexOf('等級界限突破') != -1) {

        cells = row.find('table td');
        this.hp_break = +_.trim($(cells[1]).text().replace(/hp:/i, ''));
        this.atk_break = +_.trim($(cells[2]).text().replace(/攻擊力:/i, ''));
        this.rcv_break = +_.trim($(cells[3]).text().replace(/回復力:/i, ''));
      }
    }
  }

  processAwokens($, table) {
    const rows = table.find('>tbody > tr')
    this.awokenSkills = [];
    this.breakSkills = [];
    rows.each((index, row) => {
      const key = index == 0 ? 'awokenSkills' : 'breakSkills';
      const aTags = $(row).find('.tooltip');
      aTags.each((index, aTag) => {
        const title = $(aTag).attr('title');
        const matched = title.replace(/\n/g, '').match(/^【(.*?)】(.*?)$/);
        this[key].push({
          skill_name: matched[1],
          skill_description: matched[2],
          url: $(aTag).find('img').attr('src')
        });
      });
    });
    // console.log(this.awokenSkills)
    // console.log(this.breakSkills)
  }

  processCharactorImage($) {
    const td = $('.previous_next').next();
    this.charactorImageUrl = td.find('img').attr('src');
    // this.awoken_skills = [];
    // td.find('.kakusei').each((index, div) => {
    //   this.awoken_skills.push({

    //   })
    // });
  }

  async getPlainData() {
    //process urls => base64
    let monsterObj = {
      monster_id: this.monster_id,
      name: this.name,// + this.id,
      name_cn: this.name_cn,// + this.id
      ...await getMonsterImage({
        monster_id: this.monster_id,
        avatarUrl: this.avatarUrl,
        charactorImageUrl: this.charactorImageUrl
      }),
      monster_attr: await getMonsterAttrId(this.monster_attr),
      monster_sub_attr: this.monster_sub_attr && await getMonsterAttrId(this.monster_sub_attr),
      monster_types: await Promise.all(_.map(this.monster_types, async type => await getMonsterTypeId(type))),
      awoken_skills: await Promise.all(_.map(this.awokenSkills, async skill => await getMonsterAwokenSkillId(skill))),
      break_skills: await Promise.all(_.map(this.breakSkills, async skill => await getMonsterAwokenSkillId(skill))),
      growth: this.growth,
      cost: this.cost,
      maxExp: this.maxExp,
      maxLv: this.maxLv,
      hp_lv1: this.hp_lv1,
      atk_lv1: this.atk_lv1,
      rcv_lv1: this.rcv_lv1,
      hp_max: this.hp_max,
      atk_max: this.atk_max,
      rcv_max: this.rcv_max,
      hp_break: this.hp_break,
      atk_break: this.atk_break,
      rcv_break: this.rcv_break,
    }
    // console.log(monsterObj);
    return monsterObj;
  }
}
