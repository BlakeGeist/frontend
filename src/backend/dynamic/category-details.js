'use strict';

const _ = require('lodash');
// const path = require('path');


function * categoryDetailsPage (next) {
  if (!this.state.pageData.category) {
    this.status = 404;
    return;
  }
  this.body = yield this.renderTemplate('dynamic:c');
  this.type = 'text/html';
}



const DEFAULT_PAGE_SIZE = 49;
const pageMatch = /c\/([^/]+)(\/(\d+))?/;

categoryDetailsPage.middleware = function * (next) {
  const path = _.get(this.state, 'page.path');
  if (!path || path.indexOf('c/') !== 0) return yield next;

  const matches = this.state.relativeUrl.match(pageMatch);
  if (!matches) return yield next;
  const variant = this.state.variant;
  if (this.cached(null, 60)) return;
  const slug = matches[1];
  let page = (matches && Number(matches[3])) || 1;
  const linkBase = [variant.region, variant.language, 'c', slug];
  const category = yield this.fetch('categoryBySlug', this.state.variant, slug);

  if (!category) {
    return yield next;
  }

  // var rank;
  //
  // var  LuxuryMerchants = (yield this.fetch('merchantsForCategory', this.state.variant, category.id, page)) || [];
  // for(var i=0; i<=LuxuryMerchants.lenght;i++){
  //   for(var j = 0; j<=LuxuryMerchants[i].categories.length ; j++){
  //         rank = LuxuryMerchants[i].categories[j].rank;
  //   }
  // }
  var merchnts2 = [];
  var  LuxuryMerchants = (yield this.fetch('merchantsForCategory', this.state.variant, category.id, page)) || [];
  for(var i=0; i<=11;i++){

      merchnts2[i] = LuxuryMerchants[i];

  }
  var merchnts3 = [];
  // var merchantlogo = [];
  // for(var i=0; i<=LuxuryMerchants.length; i++){
  //   for(var j=0; j<=LuxuryMerchants[i].assets.length; j++) {
  //     for(var k =0; k<=LuxuryMerchants[i].assets[j].logo.length; k++) {
  //
  //
  //       merchantlogo = LuxuryMerchants[i].assets[j].logo[k].small;
  //     }
  //
  //   }
  // }


  // for(var i=0; i<=LuxuryMerchants.length;i++){
  //
  //   merchnts3[i] = LuxuryMerchants[i].deals;
  //
  // }
  // console.log(LuxuryMerchants[0].deals);

  var url = this.state.url.pathname;
  var parts = url.split('/');

  if (parts.length >= 3) {
    var pageNumber = parseInt(parts[parts.length-2]);

    // For handling /c/:slug/:pageNo/page-context.js, because this can overwrite the pageNumber define above
    var pageNumber2 = parseInt(parts[parts.length-3])

    // Assign the current page in the URL
    page = Number.isNaN(pageNumber) ? (Number.isNaN(pageNumber2) ? 1 : pageNumber2) : pageNumber;
  }

  this.state.pageData.category = category;
  //this.state.pageData.merchantslogo = merchantlogo;
  this.state.pageData.merchantsluxury = merchnts2;
  this.state.pageData.merchants = (yield this.fetch('merchantsForCategory', this.state.variant, category.id, page)) || [];
  this.state.pageData.pageNumber = page;
  this.state.pageData.nextPage = this.state.pageData.merchants.length >= DEFAULT_PAGE_SIZE;
  this.state.pageData.prevPage = page !== 1;
  this.state.pageData.nextPageLink = linkBase.concat([page + 1]).join('/');
  this.state.pageData.prevPageLink = page <= 2 ? linkBase.join('/') : linkBase.concat([page - 1]).join('/');
  this.state.pageData.assetPathOverride = '/assets/js/system/category';
  yield next;
};

module.exports = categoryDetailsPage;
