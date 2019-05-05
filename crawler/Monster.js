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
    this.processMainInfo($, mainTables);
    this.processAwokens($, mainTables);
  }

  processMainInfo($, mainTables) {
    const table = $(mainTables[1]);
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

  processAwokens($, mainTables) {
    const table = $(mainTables[6]);
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
      maxExp: this.maxExp
    }
    // console.log(monsterObj);
    return monsterObj;
  }
}
