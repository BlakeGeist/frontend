'use strict';

const _ = require('lodash');
// const configs = require('../../../configs.json');
const fs = require('fs-promise');
const logAndDefault = (desc, def, ctx) => error => { return def; };

const firebase = require('firebase');
const admin = require('firebase-admin');
const db = admin.app().firestore();

var config = {
  apiKey: "AIzaSyDriZIhBxf7qF73SUOR-wDBHMceP5w7Rss",
  authDomain: "web-proposals.firebaseapp.com",
  databaseURL: "https://web-proposals.firebaseio.com",
  projectId: "web-proposals",
  storageBucket: "web-proposals.appspot.com",
  messagingSenderId: "907512529926"
};

if(!firebase.apps.lenth){
  firebase.initializeApp(config);
}


async function getFireDataItem(callTarget){
  const fireData = {};
  await db.collection(callTarget)
    .get()
    .then(query=>{
        let data = query.docs.map(doc=>{
            let x = doc.data()
                x['_id']=doc.id;
                return x;
        })
        _.extend(fireData, data);
    })
    var formatted = _.indexBy(fireData, '_id');
  return formatted;
}

var fireSettings = async function getSiteSettings (varients, slug) {
  const fireData = {};
  await db.collection('sites').doc('localhost')
    .get()
    .then(doc=>{
      let data = doc.data();
      _.extend(fireData, data);
    })
  return fireData;
}




async function getUser (varients, slug) {

  var uid = this.cookies.get('uid');

  var user = {};

  if(uid) {
    await admin.auth().getUser(uid)
      .then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        //console.log('Successfully fetched user data:', userRecord.toJSON());
        _.extend(user, userRecord.toJSON());
        console.log(user)
      })
      .catch(function(error) {
        console.log('Error fetching user data:', error);
      });
  }

  return user;

}

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
    fireData: yield getFireDataItem('proposals'),
    fireGlobalSettings: yield getFireDataItem('globalSiteSettings'),
    fireStrings: yield getFireDataItem('strings'),
    fireProducts: yield getFireDataItem('products'),
    firePosts: yield getFireDataItem('posts'),
    fireSiteSettings: yield fireSettings()
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
      lang: _st.translations,
      appIds: {
        facebook: _.get(_wl, 'oauth.facebook.clientID'),
        twitter: _.get(_wl, 'oauth.twitter.clientID'),
        google: _.get(_wl, 'oauth.google.clientID')
      },
      language: _st.language,
      region: _st.region,
      languages: _wl.settings.languages,
      currenciesEnabled: _wl.settings.currencies,
      defaultRegion: _wl.settings.defaultRegion,
      defaultLanguage: _wl.settings.defaultLanguage,
      defaultCurrency: _wl.settings.defaultCurrency,
      gvscLink: _.get(_st, 'configs.urls.gvscLink'),
      bspSavemateLink: _.get(_st, 'configs.urls.bspSavemateLink'),
      variant: _st.variant,
      whitelabel: _wl.slug,
      whitelabelRewards: _wl.settings.rewards,
      whitelabelText: _wl.name,
      whitelabelDomain: _wl.domain,
      whitelabelDomainFancy: _wl['domain-fancy'],
      whitelabelUrl: 'https://' + _wl.domain,
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
      key: _.get(_st, 'configs.jwt'),
      hostname: _st.hostname
    }
  );

  return meta;
}

function * getTemplateArguments (extend) {
  const _st = this.state;
  const fireMeta = yield getAsyncFireMeta.call(this);
  const fireUser = yield getUser.call(this);
  const data = yield {
    pageData: this.getPageData(this),
    meta: this.getMeta(this),
    fireBaseData: fireMeta.fireData,
    siteSettings: fireMeta.fireSiteSettings
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
    products: fireMeta.fireProducts,
    posts: fireMeta.firePosts,
    globalSiteSettings: fireMeta.fireGlobalSettings,
    siteSettings: fireMeta.fireSiteSettings,
    fireUser: fireUser,
    settings: {
      region: data.meta.region,
      language: data.meta.language,
      defaultRegion: data.meta.defaultRegion,
      defaultLanguage: data.meta.defaultLanguage,
      defaultCurrency: data.meta.defaultCurrency,
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


    //this.state.globalSiteSettings = yield getFireDataItem('globalSiteSettings'),
    //this.state.siteSettings = yield getSiteSettings();
    this.getMeta = getMeta;
    this.getAsyncMeta = getAsyncMeta;
    this.getPageData = getPageData;
    this.getTemplateArguments = getTemplateArguments;
    yield next;
  });
}

module.exports = setup;
