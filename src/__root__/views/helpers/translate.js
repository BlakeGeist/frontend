'use strict';

var Handlebars = require('handlebars');
var _ = require('lodash');

module.exports = function (target, context) {
  var settings = context.data.root.settings;
  var language = settings.language;
  var strings = context.data.root.strings;
  var string = _.find(strings, '_id', target);
  var translatedString = string[language];
  if(!translatedString){
    translatedString = '{{NO STRING FOUND}}'
  }
  return translatedString;
}
