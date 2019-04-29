const {PARSE_MONSTER_FROM_DB, PARSE_MONSTER_FROM_HTML} = require('./const');

module.exports = class Monster {
  constructor(id, fromDBorHtml, dbModel, $) {//$: cheerio instance
    this.id = id;
    if(fromDBorHtml == PARSE_MONSTER_FROM_HTML) {//from html
      // console.log($)
      this.$ = $;
      this.processCheerio($);
    }
  }

  processCheerio($) {
    // this.name = 
  }

  // get name() {
  //   return "aaa";
  // }
}
