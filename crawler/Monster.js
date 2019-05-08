const { PARSE_MONSTER_FROM_DB, PARSE_MONSTER_FROM_HTML } = require('./const');
const { getMonsterImage, getMonsterAttrId, getMonsterTypeId, getMonsterAwokenSkillId, getMonsterActiveSkillId } = require('./api');
const { processMonster } = require('./htmlProcess/processMonster');
const _ = require('lodash');

module.exports = class Monster {
  constructor(id, fromDBorHtml, dbModel, $) {//$: cheerio instance
    this.monster_id = id;
    if (fromDBorHtml == PARSE_MONSTER_FROM_HTML) {//from html
      // console.log($)
      this.$ = $;
      // this.processCheerio($);
    }
  }

  processCheerio() {
    return processMonster(this.monster_id, this.$);
  }

  async getPlainData() {
    let plainObj = this.processCheerio();
    //process urls => base64
    let monsterObj = {
      ..._.omit(plainObj, ['avatarUrl', 'charactorImageUrl']),
      ...await getMonsterImage(_.pick(plainObj, ['monster_id', 'avatarUrl', 'charactorImageUrl'])),
      monster_attr: await getMonsterAttrId(plainObj.monster_attr),
      monster_sub_attr: plainObj.monster_sub_attr && await getMonsterAttrId(plainObj.monster_sub_attr),
      monster_types: await Promise.all(_.map(plainObj.monster_types, async type => await getMonsterTypeId(type))),
      awoken_skills: await Promise.all(_.map(plainObj.awoken_skills, async skill => await getMonsterAwokenSkillId(skill))),
      break_skills: await Promise.all(_.map(plainObj.break_skills, async skill => await getMonsterAwokenSkillId(skill))),
      active_skill: await getMonsterActiveSkillId({ monster_id: this.monster_id, name: plainObj.name }, plainObj.active_skill),
      // active_skill_same_monsters: await Promise.all(_.map(plainObj.active_skill_same_monsters, async id => await getMonsterId(id))),
    }
    // console.log(monsterObj);
    return monsterObj;
  }
}
