'use strict';

const _ = require('lodash');
// const configs = require('../../../configs.json');
const fs = require('fs-promise');
const logAndDefault = (desc, def, ctx) => error => { return def; };

const firebase = require('firebase');
const admin = require('firebase-admin');

function * getPageData () {
  const pageData = {};

  const configFile = _.get(this.state, 'page.assets.config[0].fullPath');

  const config = configFile ? JSON.parse(yield fs.readFile(configFile, 'utf8')) : {};

  const promises = {};
  for (let k in config) {
    if (config[k].remote) {
      promises[k] = this.fetch(k, this.state.variant);
    } else {
      promises[k] = Promise.resolve(config[k]);
    }
  }

  try {
    _.extend(pageData, yield promises);
  } catch (e) {}
  _.extend(pageData, this.state.pageData);

  return pageData;
}


function * getAsyncMeta () {
  const asyncMeta = yield {
    pageData: getPageData.call(this)
  };
  return asyncMeta;
}

function * getAsyncFireMeta () {
  const asyncMeta = yield {
    fireData: this.fetch('proposals').catch(logAndDefault('proposals', [], this)),
    fireStrings: this.fetch('strings').catch(logAndDefault('strings', [], this))
  };
  return asyncMeta;
}
 var languages = {
  // TODO: Do these need to be translated? Moved to template?
  'da': 'Dansk',
  'de': 'Deutsch',
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'it': 'Italiano',
  'jp': '日本語',
  'kr': '한국어',
  'pt': 'Português',
  'ru': 'Русский',
  'ar': 'العربية'
};

function * getMeta () {
  const aMeta = yield getAsyncMeta.call(this);
  const _st = this.state;
  const _wl = _st.whitelabelInfo;
  const meta = _.extend(
    {},
    aMeta,
    {
      api: _st.apiBaseUrl,
      lang: _st.translations,
      appIds: {
        facebook: _.get(_wl, 'oauth.facebook.clientID'),
        twitter: _.get(_wl, 'oauth.twitter.clientID'),
        google: _.get(_wl, 'oauth.google.clientID')
      },
      contactsAppIds: {
      },
      vipPrices: {
        usd: _.get(_st, 'configs.purchaseItems.vip.usd'),
        aud: _.get(_st, 'configs.purchaseItems.vip.aud'),
        eur: _.get(_st, 'configs.purchaseItems.vip.eur'),
        inr: _.get(_st, 'configs.purchaseItems.vip.inr'),
        gbp: _.get(_st, 'configs.purchaseItems.vip.gbp')
      },
      language: _st.language,
      region: _st.region,
      languages: _wl.settings.languages,
      currenciesEnabled: _wl.settings.currencies,
      defaultRegion: _wl.settings.defaultRegion,
      defaultLanguage: _wl.settings.defaultLanguage,
      defaultCurrency: _wl.settings.defaultCurrency,
      defaultCurrencyForRegion: _.get(_st, 'configs.whitelabel.defaults.settings.region[' + _st.region + '].currency', 'usd'),
      gvscLink: _.get(_st, 'configs.urls.gvscLink'),
      bspSavemateLink: _.get(_st, 'configs.urls.bspSavemateLink'),
      variant: _st.variant,
      whitelabel: _wl.slug,
      whitelabelRewards: _wl.settings.rewards,
      whitelabelText: _wl.name,
      whitelabelDomain: _wl.domain,
      whitelabelDomainFancy: _wl['domain-fancy'],
      whitelabelUrl: 'https://' + _wl.domain,
      whitelabelOrg: _wl.org,
      investorRelations: _wl.investorRelations,
      whitelabelDomainOrg: _wl['domain-org'],
      whitelabelSocial: _wl.social,
      hasCustomFooter: _wl.hasCustomFooter,
      whitelabelSupport: _wl.support,
      whitelabelTrackingId: _wl.google.trackingId,
      whitelabelTrackingGoogleVerificationId: _wl.google.verificationId,
      whitelabelAddress: _wl.address,
      whitelabelBlogLink: _wl.blogLink,
      currentPageUrl: _.get(_st, 'page.url'),
      currentPageCss: _.get(_st, 'page.hasCustomCss') || false,
      currentPageRelativeUrl: _.get(_st, 'relativeUrl'),
      currentPageCanonicalUrl: _.get(_st, 'canonicalUrl'),
      env: _st.env,
      dev: _st.env === 'dev',
      stripeKey: _.get(_st, 'configs.paymentGateways.stripe.api_key'),
      scriptTags: _.get(_st, 'SCRIPTS'),
      defaultMerchantID: _.get(_st, 'configs.vipLounge.defaultMerchantID'),
      key: _.get(_st, 'configs.jwt.key'),
      hostname: _st.hostname
    }
  );

  return meta;
}

function * getTemplateArguments (extend) {
  const fireMeta = yield getAsyncFireMeta.call(this);
  const data = yield {
    pageData: this.getPageData(this),
    meta: this.getMeta(this),
    fireBaseData: fireMeta.fireData,
  };

  //override current date to test carousel in advance
  if(this.query && this.query.carouselDate)
    data.pageData.carouselDate = this.query.carouselDate;

  if(this.query && this.query.landingPageView)
    this.query.landingPageView = this.query.landingPageView.replace('.', '-');
    data.pageData.isLp = this.query.landingPageView;

  _.extend(data.pageData, extend || {});

  const tplArgs = {
    proposals: data.meta.proposals,
    data: data.pageData,
    whitelabel: {
      name: data.meta.whitelabelText // had to add this now that whitelabel.name is happening via reprocess
    },
    fireBaseData: fireMeta.fireData,
    strings: fireMeta.fireStrings,
    settings: {
      region: data.meta.region,
      language: data.meta.language,
      defaultRegion: data.meta.defaultRegion,
      defaultLanguage: data.meta.defaultLanguage,
      defaultCurrency: data.meta.defaultCurrency,
      defaultCurrencyForRegion: data.meta.defaultCurrencyForRegion,
      languages: languages, // this is only a list of language codes. real language data is in lang.languages
      variant: data.meta.variant,
      vipPrices: data.meta.vipPrices,
      wl: data.meta.whitelabel,
      wlText:data.meta.whitelabelText,
      rewards:data.meta.whitelabelRewards,
      partnerLogo: data.meta.whitelabel,
      wlDomain: data.meta.whitelabelDomain,
      wlDomainFancy: data.meta.whitelabelDomainFancy,
      wlUrl: data.meta.whitelabelUrl,
      wlOrg: data.meta.whitelabelOrg,
      wlDomainOrg: data.meta.whitelabelDomainOrg,
      wlInvestorRelations: data.meta.investorRelations,
      wlSocial: data.meta.whitelabelSocial,
      hasCustomFooter: data.meta.hasCustomFooter,
      wlSupport: data.meta.whitelabelSupport,
      stripeKey: data.meta.stripeKey,
      wlTrackingId: data.meta.whitelabelTrackingId,
      wlTrackingGoogleVerificationId: data.meta.whitelabelTrackingGoogleVerificationId,
      wlAddress: data.meta.whitelabelAddress,
      wlBlogLink: data.meta.whitelabelBlogLink,
      api: data.meta.api,
      appIds: data.meta.appIds,
      contactsAppIds: data.meta.contactsAppIds,
      env: data.meta.env,
      dev: data.meta.dev,
      currencies: data.meta.currencies,
      currenciesEnabled: data.meta.currenciesEnabled, // this is only a list of currencies codes. real currencies data is in lang.languages
      defaultMerchantID: data.meta.defaultMerchantID,
      key: data.meta.key, //key to decrypt emails
      hostname: data.meta.hostname
    },
    pageSettings: {
      url: data.meta.currentPageUrl,
      css: data.meta.currentPageCss,
      relativeUrl: data.meta.currentPageRelativeUrl,
      canonicalUrl: data.meta.currentPageCanonicalUrl
    },
    globals: {
      regions: data.meta.regions,
      currencies: data.meta.currencies,
      contextTime: getContextTime((this.state.env === 'dev' ? 3 : 30) * 60 * 1000), // context is "fresh" for 30 mins on prod and 3 mins on dev
      buildTime: this.state.buildSettings.buildTime,
      buildId: this.state.buildSettings.buildId,
      variant: this.state.variant ? this.state.variant.desc : this.state.whitelabel + '/global',
      htmlElementClass: this.query.i ? 'is-iframe' : null,
      scriptTags: data.meta.scriptTags,
      regions: data.meta.regions,
      languages: languages
    }
  };

  return tplArgs;
}

function getContextTime (interval) {
  return Math.floor(Date.now() / interval) * interval;
}

function setup (app) {
  app.use(function * (next) {
    this.getMeta = getMeta;
    this.getAsyncMeta = getAsyncMeta;
    this.getPageData = getPageData;
    this.getTemplateArguments = getTemplateArguments;
    yield next;
  });
}

module.exports = setup;
