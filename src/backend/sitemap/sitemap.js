'use strict';
const http = require('https');
const _ = require('lodash');
const denodeify = require('denodeify');
const zlib = require('zlib');
const getPageList = require('./page-list');
const templates = require('./tpl');
// const path = require('path');
//var request = require('co-request');

const gzip = denodeify(zlib.gzip);
const removeLinks =[
];   // Links to be removed from all the sitemaps

function * sitemap () {
  if (disabled.call(this)) return;
  const info = this.state.whitelabelInfo;
  let pageList = yield getPageList.call(this);  // will store all the urls
  const urlBase = 'https://' + this.state.whitelabelInfo.domain;
  const v = this.state.variant;
  const prefix = urlBase + '/' + v.region + '/' + v.language;
  /*  SD-8  Variables changeFreq , updateDate , linkPriority reflects updations in the xml file
   */
  const languages = info.settings.languages;
  const regions = info.settings.region;
  const region = v.region;
  const language = v.language;
  const changeFreq = 'always';
  const updateDate = new Date().toISOString().substring(0,10);
  const linkPriority = '0.8';
  pageList = pageList.filter(item => removeLinks.indexOf(item) ===-1);    // Filters the links which are need to be removed from all the sitemaps
  // Check if the index is available and replace
  if(pageList.indexOf("/p/about/dubli/") !=-1)
    pageList[pageList.indexOf("/p/about/dubli/")] = "/p/about/";  // Replaces the links
  if(pageList.indexOf("/p/referral/") !=-1)
    pageList[pageList.indexOf("/p/referral/")] = "/p/refer-a-friend/";  //  Replaces the links
  this.body = templates.urlset({
    urls: pageList.map(p => templates.url(
      {'url': prefix + p, 'changeFreq': changeFreq, 'updateDate': updateDate, 'linkPriority': linkPriority, 'regions': regions, 'languages': languages, 'urlBase': urlBase, 'page': p, 'region': region, 'language': language})
    )
  });
  this.type = 'text/xml';
}

function * sitemapIndex () {
  if (disabled.call(this)) return;
  const info = this.state.whitelabelInfo;
  const regions = (yield this.fetch('regions')).map(f => f.isocode);
  const languages = info.settings.languages;
  const smap = 'sitemap.xml.gz';
  const base = 'https://' + this.state.whitelabelInfo.domain;
  const changeFreq = 'always';
  const updateDate = new Date().toISOString().substring(0,10);
  const linkPriority = '0.8';
  const list = _.flatten(regions.map(r => languages.map(l => [base, r, l, smap].join('/'))))
    .map(x => ({url: x, 'changeFreq': changeFreq, 'updateDate': updateDate, 'linkPriority': linkPriority}));

  this.body = templates.sitemapindex({sitemaps: list});
  this.type = 'text/xml';
}

function * sitemapGzipped () {
  if (disabled.call(this)) return;
  if (this.cached()) return;
  yield sitemap.call(this);
  const gzipped = yield gzip(this.body);
  this.type = 'application/x-gzip';
  this.body = gzipped;
}

function * sitemapIndexGzipped () {
  if (disabled.call(this)) return;
  if (this.cached()) return;
  yield sitemapIndex.call(this);
  const gzipped = yield gzip(this.body);
  this.type = 'application/x-gzip';
  this.body = gzipped;
}

function disabled () {
  const settings = _.get(this, 'state.whitelabelInfo.settings');
  if (!settings.useSitemap) {
    this.status = 404;
    return true;
  }
}

function * robots () {
  const settings = _.get(this, 'state.whitelabelInfo.settings');

  this.body = [
    'User-Agent: *',
    // SD-8  this sets the routing links which are not required to be exposed to the bots to disallow
    settings.allowCrawling ? 'Allow: /' : 'Disallow: /',
    settings.useSitemap ?  'Sitemap: https://' + this.state.whitelabelInfo.domain + '/sitemap.xml.gz' : ''
  ].join('\n');

  this.type = 'text/plain';
}
// SD-8 this helps in routing the sitemap.xml and sitemap.xml.gz and sitemapIndex
function setup (app, router) {
  router.get('/:R/:L/sitemap.xml', sitemap);
  router.get('/:R/:L/sitemap.xml.gz', sitemapGzipped);
  router.get('/sitemap.xml', sitemapIndex);
  router.get('/sitemap.xml.gz', sitemapIndexGzipped);
  router.get('/robots.txt', robots);
}

module.exports = setup;
