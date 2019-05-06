const _ = require('lodash');
const mongoose = require('mongoose');

const dbConfig = require('../db-config.json');
const schemas = require('./schema');
const { getImageBase64 } = require('../crawler/api');

// const conn = mongoose.connection;

module.exports.saveMonsters = async monsters => {
  try {
    const bulkOp = schemas.Monster.collection.initializeOrderedBulkOp();
    for (const monster of monsters) {
      bulkOp.find({ monster_id: monster.monster_id }).upsert().updateOne(monster);
    }
    monsters.length > 0 && await bulkOp.execute();
    return true;
    // return await schemas.Monster.collection.insertMany(monsters, {
    //   ordered: false // 插入失败则跳过
    // })
  }
  catch (e) {
    console.log(e);
    return false;
  }
}

module.exports.saveAwokenSkills = async skills => {
  try {
    const bulkOp = schemas.AwokenSkill.collection.initializeOrderedBulkOp();
    for (const skill of skills) {
      bulkOp.find({ skill_name: skill.skill_name }).upsert().updateOne(skill);

    }
    skills.length > 0 && await bulkOp.execute();
    return true;
    // return await schemas.Monster.collection.insertMany(monsters, {
    //   ordered: false // 插入失败则跳过
    // })
  }
  catch (e) {
    console.log(e);
    return false;
  }
}

module.exports.connDB = async (isReadonly = false) => {
  const dbUrl = `${dbConfig.server}/${dbConfig.db}`;
  const connInstance = await mongoose.connect(dbUrl, {
    user: isReadonly ? dbConfig.readonly_user : dbConfig.user,
    pass: isReadonly ? dbConfig.readonly_pwd : dbConfig.pwd,
    useCreateIndex: true,
    useNewUrlParser: true
  });
  if (!connInstance) {
    console.error.bind(console, 'connection error:')
  }
  console.log('database connected: ' + dbUrl);

  const mongo = mongoose.connection

  // mongo.on('error', error => { debug('mongo: ' + error.name) })
  // mongo.on('connected', () => { debug('mongo: Connected') })
  mongoose.connection.on('disconnected', () => { console.log('database Disconnected') })
  return connInstance;
}
