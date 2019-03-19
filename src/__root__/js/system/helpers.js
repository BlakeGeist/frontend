/* global _, $, Handlebars, Swag */
/*
 * For super simple helper functions that don't need/deserve a whole extra vendor lib
 */

(function (window, site, handlebars) {
  'use strict';

  var C = site.commands;
  var H = site.helpers;
  var REGIONS = site.context.regions;
  var REGION = site.context.settings.region;

  var helpers = site.helpers = {};
  Swag.registerHelpers(Handlebars);

  //this function will prevent the default and propagation actions
  helpers.stopEvents = function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  //function
  helpers.getFormData = function(form){
    var params = $(form).serializeArray();
    var thisObj = _.reduce(params , function(obj,param) {
     obj[param.name] = param.value
     return obj;
    }, {});
    return thisObj;
  }


  //this function will close an open modal
  helpers.closeModal = function() {
    C.run('modal:close');
  }

  helpers.params = function () {
    return window.location.search
      .replace(/^\?/, '')
      .split('&')
      .reduce(function (m, x) {
        var parts = x.split('=', 2);
        var name = parts[0];
        var value = decodeURIComponent(parts[1]);
        m[name] = value;
        return m;
      }, {});
  };

  helpers.slugify = function(data){
    return data
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
  }

  helpers.param = function (name) {
    return helpers.params()[name];
  };

  helpers.renderPartial = function (name, args) {
    try {
      var key = 'partials/' + name;
      if (!site.partials[key]) throw new Error('Can’t find partial named ' + name);
      args = _.extend({}, args, _.omit(site.context, 'data'));
      return site.partials[key](args);
    } catch (e) {
      // Handlebars throws exceptions... what a jerk.
      console.log('renderPartial encountered an exception', e, name, args);
    }
  };

  var _states = 'loading loading-more ready error initial'
    .split(' ').reduce(function (m, x) {
      m[x] = true;
      return m;
    }, {});

  site.pageState = 'initial';

  helpers.setPageState = function (stateName) {
    if (stateName === 'initial') throw new Error("It is illegal to set Page State to 'initial' manually");
    if (!(stateName in _states)) throw new Error('Unknown PageState: ' + stateName + ', available: ' + Object.keys(_states).join(','));
    site.pageState = stateName;
    var add = 'page-state-' + stateName;
    var remove = Object.keys(_states).filter(function (x) {
      return x !== stateName;
    }).map(function (x) {
      return 'page-state-' + x;
    }).join(' ');

    $('html, main').addClass(add).removeClass(remove);
  };

  helpers.emailLink = function emailLink (params) {
    params = _.clone(params);
    var email = params.to || '';

    return 'mailto:' + email + '?' + Object.keys(params).reduce(function (memo, key) {
      return (key === 'to') ? memo : memo.concat([key + '=' + encodeURIComponent(params[key])]);
    }, []).join('&');
  };
  //check if a string is base64
  helpers.isBase64 = function(str) {
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
        }
    }
  helpers.translate = function (string) {
    var translation = site.context.lang[string];
    if (translation) {
      return translation;
    }
    return string + ' UNDEFINED: No String Found';
  }

  /*
    return dateDiff in days, weeks and year
  */
  helpers.dateDiff = {

    inDays: function(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();

        return parseInt((t2-t1)/(24*3600*1000));
    },

    inWeeks: function(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();

        return parseInt((t2-t1)/(24*3600*1000*7));
    },

    inMonths: function(d1, d2) {
        var d1Y = d1.getFullYear();
        var d2Y = d2.getFullYear();
        var d1M = d1.getMonth();
        var d2M = d2.getMonth();

        return (d2M+12*d2Y)-(d1M+12*d1Y);
    },

    inYears: function(d1, d2) {
        return d2.getFullYear()-d1.getFullYear();
    }
  }

  /*
  * @function determineCurrency
  *
  * Determines the appropriate currency in the preferred order of checking:
  * user currency > region default > whitelabel default > fallback to usd
  *
  */
  helpers.determineCurrency = function() {
    return _.get(site.me.getDetails(), 'currency') || site.context.settings.defaultCurrencyForRegion || site.context.settings.defaultCurrency || 'usd';
  };

  /*
   * @function timeOutModal
   * Closes any modal after a given amount of time
   * expecting time in mil seconds > 5 sec default
  */
  helpers.timeOutModal = function(time) {
    var time_input = time || 5000
    setTimeout(function() {
      C.run('modal:close');
    }, time_input);
  };

  /*
   * @function determineRegion
   *
   * Determines the appropriate currency in the preferred order of checking:
   * user currency > region default > whitelabel default > fallback to usd
   *
   */
  helpers.determineRegion = function() {
    return _.get(site.me.getDetails(), 'region') || site.context.settings.defaultRegion  || 'us';
  };

  /*
  * @function isInEu
  *
  * Determine if the current region is in the european union.
  *
   */
  helpers.isInEu = function() {
    var region = site.context.settings.region;
    return _.includes(EU_REGIONS, region.toUpperCase());
  };

  /*
  * @function determineLanguage
  *
  * Determines the appropriate language in the preferred order of checking:
  * settings language > user language > whitelabel default > fallback to en
  *
  */
  helpers.determineLanguage = function() {
    return site.context.settings.language || _.get(site.me.getDetails(), 'language') || site.context.settings.defaultLanguage || 'en';
  };

  /*
  * @function determineRegionDefaultLannguage
  *
  * Determines the the defualt language of a region
  * requires isocode //http://www.nationsonline.org/oneworld/country_code_list.htm > fallback to en
  *
  */

  helpers.determineRegionDefaultLannguage = function(isocode) {
    return _.find(site.context.regions, {isocode: isocode}).lang || 'en';
  };

  /*
  * @function determineMinimumWithdrawalAmountToUse
  *
  * Determines the appropriate minimum balance amount
  * the user must have to withdrawal money
  *
  */

  /*
  * @function determineIccBank
  *
  * Determines the appropriate ICC Bank
  * associated with BSP Rewards partner
  *
  */

  helpers.findOne = function (haystack, arr) {
      return arr.some(function (v) {
          return haystack.indexOf(v) >= 0;
      });
  };
  /*
   *  amount (number) must be in usd ONLY and in dollars, not cents
   *
   *  requirements have now changed -- we should not actually display converted amounts but instead use some fixed amounts in aud/eur/inr
   *  eur will be the same as usd at least (5 usd = 5 eur)
   */
  helpers.convertCurrencyStringFromUSD = function (dollars) {
    var currency = _.get(site.me.getDetails(), 'currency') || site.context.settings.defaultCurrencyForRegion || site.context.settings.defaultCurrency || 'usd';
    var lang = site.context.settings.language || _.get(site.me.getDetails(), 'language') || site.context.settings.defaultLanguage || 'en';

    //instead of checking every possible string check if the value if dividable and apply multiplier
    var parsedValue = parseInt(dollars);
    var usdBaseValue = 5;
    var audMultiplier = 6;
    var inrMultiplier = 335;
    var eurMultiplier = 5;
    var gbpMultiplier = 4;
    var isDividable = parsedValue % usdBaseValue === 0;

    // hard-coded values...
    if (currency === 'aud') {
      if (isDividable) {
        dollars = parsedValue / usdBaseValue * audMultiplier;
      }
      if (dollars === '99') dollars = 137;
    } else if (currency === 'inr') {
      if (isDividable) {
        dollars = parsedValue / usdBaseValue * inrMultiplier;
      }
      if (dollars === '99') dollars = 6534;
    } else if (currency === 'eur') {
      // the other euro values are same as dollar (e.g. 5 is 5)
      if (isDividable) {
        dollars = parsedValue / usdBaseValue * eurMultiplier;
      }
      if (dollars === '99') dollars = 91;
    } else if (currency === 'gbp') {
      if (isDividable) {
        dollars = parsedValue / usdBaseValue * gbpMultiplier;
      }
    } else if (currency !== 'usd' && currency !== 'eur') {
      dollars = helpers.convertCurrency(parseInt(parseFloat(dollars) * 100, 10), 'usd', currency, lang);
    }

    // round the decimals off of our 4 hard-coded currencies
    var amount;
    if (currency === 'aud' || currency === 'usd' || currency === 'eur' || currency === 'inr') {
      amount = site.helpers.localizeCurrency(dollars, currency, lang, 0);
    } else {
      amount = site.helpers.localizeCurrency(dollars, currency, lang);
    }

    return {
      amount: amount,
      currency: currency
    };
  };

  // amountInMinor should be an integer, not a float. returns values in major currency of toCode
  helpers.convertCurrency = function (amountInMinor, fromCode, toCode) {
    if (!_.isFinite(amountInMinor) || !_.isString(fromCode) || fromCode.length !== 3 || !_.isString(toCode) || toCode.length !== 3) {
      console.log('Invalid parameters passed to convert currency'); // TODO: handle error?
      return amountInMinor;
    }

    var toCurrency = site.context.settings.currencies[toCode];
    var fromCurrency = site.context.settings.currencies[fromCode];
    if (!toCurrency || !_.isPlainObject(toCurrency) || !fromCurrency || !_.isPlainObject(fromCurrency)) {
      console.log('Currency code not found'); // TODO: handle error?
      return amountInMinor;
    }

    // this was originally coded
    // var toExponent = _.isFinite(toCurrency.exponent) ? toCurrency.exponent : 2;
    // var fromExponent = _.isFinite(fromCurrency.exponent) ? toCurrency.exponent : 2;

    // Fixing currency conversion issue
    var toExponent = 0;
    if(_.isFinite(Number(toCurrency.exponent)))
      toExponent = Number(toCurrency.exponent);
    else
      toExponent = 2;

    var fromExponent = 0;
    if(_.isFinite(Number(fromCurrency.exponent)))
      fromExponent = Number(fromCurrency.exponent);
    else
      fromExponent = 2;

    var rate = parseFloat((toCurrency.rate / fromCurrency.rate).toFixed(6));
    var fromInMajor = parseFloat((amountInMinor / (Math.pow(10, fromExponent))).toFixed(fromExponent));
    return parseFloat((fromInMajor * rate).toFixed(toExponent));
  };

  /*
  -- check to see if there is a historic token
  */
  helpers.historicTokenCheck = function() {
    //get the historic token as a var
    var historicToken = site.me._historicToken;
    //if there is a historic user token return true
    if (historicToken) {
      return true;
    } else {
      return false;
    }
  }

  /*
    --check to see if an xhr status is successful
    --EXAMPLE CALL if
    if (site.helpers.is2XX(data)) {
      if code
    }
    else {
      else code
    }
  }
  */
  helpers.is2XX = function(xhr) {
    if (xhr.status >= 200 && xhr.status < 300) return true;
    return false;
  }

  /*
  -- check to see if a user is logged in
  */
  helpers.userCheck = function() {
    //get the user as a var
    var user = site.me.getDetails();
    //if there is a user return true else false
    if (user) {
      return true;
    } else {
      return false;
    }
  }

  /*
  -- check to see if a user is logged in and also VIP
  */
  helpers.vipUserCheck = function() {
    //get the user as a var
    var user = site.me.getDetails();
    //if there is a use and the user is vip return true else false
    if (user && user.hasPlusSixGlobal == true) {
      return true;
    } else {
      return false;
    }
  }

  //this function will take the name of a cookie and return its value
  helpers.readCookie = function(name) {
    //set up the sytax of the cookie's name
    var nameEQ = name + "=";
    //chunck the cookie into sections
    var ca = document.cookie.split(';');
    //loop over each section and see if its the cookie I am looking for
    for (var i = 0; i < ca.length; i++) {
      //get the index of the chunked items
      var c = ca[i];
      //loop the chunks
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      //loop the chars
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  //this function will add the loading class to a submit button or take it off
  //example call site.helpers.spinSubmitInput('on')
  helpers.spinSubmitInput = function(status) {
    var submitWrapper = $('.button-wrapper').last();
    var submitButton = submitWrapper.children('[type="submit"]');
    if (status === 'on') {
      submitWrapper.addClass('loading');
      submitButton.attr('disabled', true);
    } else {
      submitWrapper.removeClass('loading');
      submitButton.removeAttr('disabled');
    }
  }

  helpers.scrollToTop = function(){
    var body = $("html, body");
    body.stop().animate({scrollTop:0}, 500, 'swing');
  }

  //add or remove a class to html level
  //example call site.helpers.addRemoveClassFromHTMLLevel('add', 'is-processing')
  helpers.addRemoveClassFromHTMLLevel = function(action, state) {
    if (action === 'add') {
      $('html').addClass(state);
    } else {
      $('html').removeClass(state);
    }
  }

  helpers.toggleHTMLClass = function(className) {
    $('html').toggleClass(className);
  }

  /*
  -- This is how form validation works --
  - run sanitize on the form or parent of form elements
  - optional - add .reason message **AFTER** input to show a reason for the error
  */
  helpers.sanitize = function ($scope) {
    $.each($scope.find('input'), function () {
      var $this = $(this);
      $this.removeClass('dirty');
      $this.on('change keypress keyup keydown', function () {
        $this.addClass('dirty');
      });
    });
  };

  helpers.requireAuth = function requireAuth (level, reason, callback) {
    if (!level) level = 'low';
    if (site.me.has(level)) return;

    site.storage.set(site.keys.postAuthOverride, window.location.toString());
    C.run('navigate:page', '/u/verify');
  };

  site.helpers.url = function buildUrl (relativePath, params) {
    var cur = window.location.pathname;
    var rest = relativePath.replace(/^\//, '').replace(/\/$/, '');
    var url = cur.split('/').slice(0, 3).join('/') +
      '/' + (rest.length ? rest + '/' : '');
    if (params) {
      url += '?' + (typeof params === 'string' ? params : $.param(params));
    }
    return url;
  };

  /*
  -- This takes a target element and string, it will wrap the string in message class and prepend it into the element
  */

  helpers.sendErrorMessage = function (target, message) {
    //the setTimeout allows the ui to be able to flicker after re submision
    setTimeout(function () {
      var text = site.context.lang[message];
      var compiledMessage = compileString(text);
      $(target).prepend('<div class="message message-error">' + compiledMessage + '</div>');
    }, 500);
  }

  function compileString(toBeCompiled) {
    var subTemplate = Handlebars.compile(toBeCompiled);
    var rendered = subTemplate(site.context.data.root);
    var safeRenderd = new Handlebars.SafeString(rendered);
    return safeRenderd;
  }

  helpers.compileString = function(toBeCompiled) {
    var subTemplate = Handlebars.compile(toBeCompiled);
    var rendered = subTemplate(site.context.data.root);
    var safeRenderd = new Handlebars.SafeString(rendered);
    return safeRenderd;
  }

  //this function will open the sign in or sign up flows if there is no user, if there is a user it returns true.
  helpers.requireLogin = function() {
    var user = site.me.getDetails();
    if (!user) {
      C.run('modal:close');
      if (site.helpers.historicTokenCheck()) {
        C.run('modal:open', 'auth-sign-in-modal');
      } else {
        C.run('auth:init:full-page:create-account');
      }
      return false;
    } else {
      return true;
    }
  }

  helpers.isHomePage = function(){
    return site.context.pageSettings.relativeUrl.length == 0;
  }

})(window, window.site, window.Handlebars);
