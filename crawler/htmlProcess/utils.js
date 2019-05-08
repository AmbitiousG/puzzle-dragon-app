const _ = require('lodash');
const { DROP_TYPES } = require('../const');

module.exports.processCellContent = ($, cell) => {
  let arrNodes = [];
  for (const node of cell.childNodes) {
    if (node.type == 'text') {
      arrNodes.push(_.trim(node.nodeValue));
    }
    else if (node.type == 'tag') {
      if (node.name == 'br') {
        arrNodes.push('\n');
      }
      else if (node.name == 'img') {
        let src = $(node).attr('src');
        let matched = src.match(/.*\/(.*?)\.png.*/);
        if (matched && matched.length > 0) {
          let imgName = matched[1].toLowerCase();
          DROP_TYPES[imgName] && arrNodes.push(DROP_TYPES[imgName]);
          if (src.indexOf('change.gif') != -1) {
            arrNodes.push('=>');
          }
        }
      }
    }
  }
  return arrNodes.join('');
};
