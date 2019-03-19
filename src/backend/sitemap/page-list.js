'use strict';

const SLUGS = {
  faqs: 'frequently-asked-questions',
  faq: 'frequently-asked-questions',
  merchants: 'merchants',
  merchant: 'm',
  categories: 'categories',
  category: 'c',
  events: 'events',
  event: 'e',
  pages: 'p',
  page: 'p'
};

const _flatten = (m, x) => [].concat(m, x);

function * getAllUrls () {
  const results = (yield [
    getPageUrls.call(this),
    getMerchantUrls.call(this),
    getCategoryUrls.call(this),
    getEventsUrls.call(this),
    getFaqsUrls.call(this),
    getStaticUrls.call(this)
  ]).reduce(_flatten).map(url => {
    if (!url.startsWith('/')) url = '/' + url;
    if (!url.endsWith('/') && !(url.indexOf('#') >= 0)) url = url + '/';
    return url;
  }).sort();
  return results;
}

function * get (api, basics, transform) {
  if (!basics) basics = [];
  if (typeof basics === 'string') basics = [basics];

  if (typeof transform === 'string') {
    const _slug = transform;
    transform = item => _slug + '/' + item.slug;
  }

  return basics.concat(
    (yield (typeof api === 'function') ? api.call(this) : this.fetch(api, this.state.variant))
      .map(transform)
  );
}

function * getPageUrls () {
  return yield get.call(this, 'pages', SLUGS.pages, SLUGS.page);
}

function * getMerchantUrls () {
  const fetcher = function * () {
    return (yield [
      // get 200 (arbitrary number) rather than the default 50
      // also keeps regular merchant list pages pre-warmed for the first 4 pages.
      this.fetch('merchants', this.state.variant, 1),
      this.fetch('merchants', this.state.variant, 2),
      this.fetch('merchants', this.state.variant, 3),
      this.fetch('merchants', this.state.variant, 4)
    ]).reduce(_flatten);
  };
  return yield get.call(this, fetcher, SLUGS.merchants, SLUGS.merchant);
}

function * getCategoryUrls () {
  return yield get.call(this, 'categories', SLUGS.categories, SLUGS.category);
}

function * getEventsUrls () {
  return yield get.call(this, 'events', SLUGS.events, SLUGS.event);
}

function * getFaqsUrls () {
  return yield get.call(this, 'faqs', SLUGS.faqs, f => {
    const slug = _slugify(f.name);
    return SLUGS.faq + '/#' + slug;     //  Added '#'
  });
}

function * getStaticUrls () {
  return [ '/', 'popular', 'search', 'me/vip' ];
}

function _slugify (text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/&/g, '-and-')         // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

module.exports = getAllUrls;
