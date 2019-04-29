const {PARSE_MONSTER_FROM_DB, PARSE_MONSTER_FROM_HTML} = require('./const');

module.exports = class Monster {
  constructor(fromDBorHtml, dbModel, htmlParsed) {
    if(fromDBorHtml == PARSE_MONSTER_FROM_HTML) {//from html
      console.log(htmlParsed)
    }
  }

  // get name() {
  //   return "aaa";
  // }
}
