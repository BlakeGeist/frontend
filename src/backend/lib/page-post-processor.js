"use strict";

const _ = require('lodash');
const co = require('co');
const cheerio = require('cheerio');
const utils = require('ominto-utils');
const configs = require('../../../configs.json');
utils.currency.init(configs);
const localize$$ = utils.currency.localizeCurrency;
const bufferFrom = require('buffer-from');

const PROCS = [
  fixCurrencies
];

/*
 * to write a post-processor:
 *   - write a generator function with the following signature:
 *     `function * myPostProc ($, html, ctx);`
 *   - arguments are as follows:
 *     `$` - cheerio-parsed version of the html (cheerio's a lightweight subset of the jquery api which runs against a virtual dom in node)
 *     `html` - a copy of the html as a string. modifications to this string will be ignored. this is most useful for quickly checking if your proc needs to run
 *     `ctx` - the `this` context of the render call.
 *   - your processor should make changes to the dom using the cheerio object
 *   - return true from your processor if you made changes, false if you didn't. if no processors return true, the step of re-rendering the cheerio node into html will be skipped.
 *   - add your processor to PROCS array above
 */

function * fixCurrencies ($, html, ctx) {
  if (html.indexOf('dollars-string') === -1) return false; // nothing to change if there's no html that this would affect

  const language = _.get(ctx.state, 'language', 'en');
  const idealCurrency = getIdealCurrency(ctx);

  $('[data-currency="dollars-string"]').each(function (index, elem) {
    const $elem = $(elem);
    $elem.attr('data-dollars', $elem.text());
    const value = Number($elem.text().replace(/(^\D+|\D+$)/g, '').replace(/[^\d.]/g, ''));
    $elem.attr('data-currency', idealCurrency + '-string').text(localize$$(value, idealCurrency, language, ctx, 0));
  });

  return true;
}

function getDefaultCurrency (ctx) {
  return _.get(ctx.state, 'defaultCurrency', 'usd');
}

function getIdealCurrency (ctx) {
  return _.get(ctx.state, 'defaultCurrencyForRegion', getDefaultCurrency(ctx));
}

function * postProcess (html, ctx) {
  const $ = cheerio.load(html.toString());
  // run all PROCs in parallel.
  const hasModifications = !!(yield PROCS.map(proc => proc($, html, ctx))).filter(x => !!x).length;
  return hasModifications ? bufferFrom($.html()) : html;
}

module.exports = postProcess;
