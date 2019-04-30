const request= require("request");
const crawler = require('./crawler/index');
const {getFetchingArray} = require('./crawler/utils');

// function getImage() {
//   request({
//     url: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
//     encoding: null
//   }, (err, res, body) => {
//     console.log(12);

//   });

// }

// getImage();

crawler.fetchMonsters(getFetchingArray());
