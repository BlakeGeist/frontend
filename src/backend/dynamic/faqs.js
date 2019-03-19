'use strict';

const _ = require('lodash');
const customHBS = require('../lib/custom-handlebars');

function * faqSectionPage (next) {
  if (this.state.pageData.faq) {
    this.body = yield this.renderTemplate('dynamic:faq');
    this.type = 'text/html';
    return;
  }
  yield next;
}

faqSectionPage.middleware = function * (next) {
  const path = _.get(this.state, 'page.path');
  if (!path || path.indexOf('frequently-asked-questions/') !== 0) return yield next;
  if (this.cached(null, 180)) return;
  let faqList = yield this.fetch('faqs', this.state.variant);

  customHBS.replaceFaqsBadLinks(faqList, this.state.variant, this.state.whitelabelInfo);

  this.state.pageData.faqs = faqList;
  yield next;
};

module.exports = faqSectionPage;
