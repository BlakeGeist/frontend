'use strict';

const _ = require('lodash');
// const path = require('path');

function * eventDetailsPage (next) {
  if (!this.state.pageData.event) {
    this.status = 404;
    return;
  }
  this.body = yield this.renderTemplate('dynamic:e');
  this.type = 'text/html';
}

const pageMatch = /e\/([^/]+)(\/(\d+))?/;
eventDetailsPage.middleware = function * (next) {
  const path = _.get(this.state, 'page.path');
  if (!path || path.indexOf('e/') !== 0) return yield next;

  const matches = this.state.relativeUrl.match(pageMatch);
  if (!matches) return yield next;
  // const variant = this.state.variant;
  const slug = matches[1];
  // const page = (matches && Number(matches[3])) || 1;
  if (this.cached(null, 60)) return;
  const event = yield this.fetch('eventBySlug', this.state.variant, slug);
  if (!event) {
    return yield next;
  }

  this.state.pageData.event = event;
  var eventContent = yield this.fetch('featuredEventContent', this.state.variant, slug);

  this.state.pageData.eventMerchants = eventContent.merchants;
  this.state.pageData.eventCategories = eventContent.categories;

  this.state.pageData.assetPathOverride = '/assets/js/system/event';

  yield next;
};

module.exports = eventDetailsPage;
