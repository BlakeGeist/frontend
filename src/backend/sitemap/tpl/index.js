'use strict';

const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const templates = {};
const load = name => templates[name] = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, name + '.hbs'), 'utf8'));

load('urlset');
load('url');
load('sitemapindex');

Object.freeze(templates);

module.exports = templates;
