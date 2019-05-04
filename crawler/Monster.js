const { PARSE_MONSTER_FROM_DB, PARSE_MONSTER_FROM_HTML } = require('./const');
const _ = require('lodash');

module.exports = class Monster {
  constructor(id, fromDBorHtml, dbModel, $) {//$: cheerio instance
    this.id = id;
    if (fromDBorHtml == PARSE_MONSTER_FROM_HTML) {//from html
      // console.log($)
      this.$ = $;
      this.processCheerio($);
    }
  }

  processCheerio($) {
    this.name = _.trim($('h3').text()).replace(/^No\.\d+ - /, '');
    this.name_cn = $('h2').text();
    // console.log(this.plainData);
  }

  get plainData() {
    return {
      id: this.id,
      name: this.name,// + this.id,
      name_cn: this.name_cn,// + this.id
    };
  }
}
