const _ = require('lodash');

const processActiveSkillsCN = $ => {
  let skills = [];
  return skills;
}
const processActiveSkillsJP = $ => {
  let skills = [];
  return skills;
}

module.exports.processActiveSkills = ($, isJP) => {
  return isJP ? processActiveSkillsJP($) : processActiveSkillsCN($);
}
