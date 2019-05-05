const mongoose = require('mongoose');
const objectIdType = mongoose.Schema.Types.ObjectId;

const monsterTypeSchema = new mongoose.Schema({
  name: String,
  type_image_base64: String
});

const monsterAttrSchema = new mongoose.Schema({
  name: String,
  attr_image_base64: String
});

const monsterSeriesSchema = new mongoose.Schema({
  series_id: {
    type: Number,
    unique: true,
    index: true
  },
  name: String
});

const monsterActiveSkillSchema = new mongoose.Schema({
  active_skill_id: {
    type: Number,
    unique: true,
    index: true
  },
  skill_name: String,
  skill_description: String,
  skill_description_cn: String,
  skill_init_turn: Number,
  skill_max_turn: Number
});

const monsterLeaderSkillSchema = new mongoose.Schema({
  leader_skill_id: {
    type: Number,
    unique: true,
    index: true
  },
  skill_name: String,
  skill_description: String,
  skill_description_cn: String
});

const monsterAwokenSkillSchema = new mongoose.Schema({
  skill_image_base64: String,
  skill_name: String,
  skill_description: String,
});

const dungeonSchema = new mongoose.Schema({
  dungeon_id: {
    type: Number,
    unique: true,
    index: true
  },
  dungeon_name: String
});

const monsterSchema = new mongoose.Schema({
  monster_id: {
    type: Number,
    unique: true,
    index: true
  },
  monster_types: [{ type: objectIdType, ref: "MonsterType" }],
  monster_avatar_base64: String,
  monster_image_base64: String,
  name: String,
  name_cn: String,
  monster_attr: { type: objectIdType, ref: "MonsterAttr" },
  monster_sub_attr: { type: objectIdType, ref: "MonsterAttr" },
  series: { type: objectIdType, ref: "MonsterSeries" },
  rare: Number,
  cost: Number,
  growth: Number,
  maxExp: Number,
  maxLv: Number,
  hp_lv1: Number,
  atk_lv1: Number,
  rcv_lv1: Number,
  hp_max: Number,
  atk_max: Number,
  rcv_max: Number,
  hp_break: Number,
  atk_break: Number,
  rcv_break: Number,
  sell_gold: Number,
  sell_gold_str: String,
  sell_gold_max: Number,
  sell_mp: Number,
  feed_exp: Number,
  feed_exp_str: String,
  feed_exp_max: Number,
  active_skill: { type: objectIdType, ref: "ActiveSkill" },
  leader_skill: { type: objectIdType, ref: "LeaderSkill" },
  awoken_skills: [{ type: objectIdType, ref: "AwokenSkill" }],
  break_skills: [{ type: objectIdType, ref: "AwokenSkill" }],
  isAssistive: Boolean,
  fromEvolution: Boolean,
  fromShop: Boolean,
  fromFriendship: Boolean,
  fromColabo: Boolean,
  colaboName: String,
  fromDungeon: Boolean,
  dungeonList: [{ type: objectIdType, ref: "Dungeon" }],
  monsterSwitchable: Boolean,
  shinkaMonster: { type: objectIdType, ref: "Monster" },
  megaShinkaMonster: [{ type: objectIdType, ref: "Monster" }],
  shinkaFrom: { type: objectIdType, ref: "Monster" },
  shinkaMaterials: [{ type: objectIdType, ref: "Monster" }],
  shinkaAssist: { type: objectIdType, ref: "Monster" }
});

module.exports.MonsterType = mongoose.model("MonsterType", monsterTypeSchema);
module.exports.MonsterAttr = mongoose.model("MonsterAttr", monsterAttrSchema);
module.exports.MonsterSeries = mongoose.model("MonsterSeries", monsterSeriesSchema);
module.exports.ActiveSkill = mongoose.model("ActiveSkill", monsterActiveSkillSchema);
module.exports.LeaderSkill = mongoose.model("LeaderSkill", monsterLeaderSkillSchema);
module.exports.AwokenSkill = mongoose.model("AwokenSkill", monsterAwokenSkillSchema);
module.exports.Dungeon = mongoose.model("Dungeon", dungeonSchema);
module.exports.Monster = mongoose.model("Monster", monsterSchema);

// module.exports.MonsterType = MonsterType;
// module.exports.MonsterAttr = MonsterAttr;
// module.exports.MonsterSeries = MonsterSeries;
// module.exports.ActiveSkill = ActiveSkill;
// module.exports.LeaderSkill = LeaderSkill;
// module.exports.AwokenSkill = AwokenSkill;
// module.exports.Dungeon = Dungeon;
// module.exports.Monster = Monster;
