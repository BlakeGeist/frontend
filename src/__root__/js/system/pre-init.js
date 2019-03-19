/* global site */
(function (html, window, search, hash, get, high, low, auth, token, htoken) {
  'use strict';

  var mod = function (action, arg) { html.className = html.className.split(' ')[action](arg).join(' '); };
  var add = function (cl) { mod('concat', [cl]); };
  var remove = function (cl) { mod('filter', function (x) { return x !== cl; }); };
  var toggle = function (cond, cl) { (cond ? add : remove)(cl); };

  try {
    window.site = {};
    var isIframe = site.isIframe = (window !== window.parent) || (hash.indexOf('#i=1') === 0 || search.split('&').indexOf('i=1') > -1);
    var highToken = get(auth + high + token);
    var lowToken = get(auth + low + token);
    var historicToken = get(htoken);
    var hasHigh = !!(highToken && highToken !== 'null');
    var hasLow = !!(lowToken && lowToken !== 'null');
    var hasHistoric = !!(historicToken && historicToken !== 'null');
    var hasTokens = !!(hasHigh || hasLow);

    var authState = 'authstate-' + (
      /* eslint-disable */
      hasHigh       ? high :
      hasLow        ? low  :
      hasHistoric   ? 'historic' :
      'anonymous'
      /* eslint-enable */
    );

    add(authState);
    toggle(hasTokens, 'logged-in');
    toggle(!hasTokens, 'logged-out');
    toggle(isIframe, 'is-iframe');
    toggle(hasHistoric, 'token-historic');
    toggle(hasHigh, 'token-high');
    toggle(hasLow, 'token-low');

  } catch (e) {
    return false;
  }
})(document.documentElement, window, window.location.search, window.location.hash, window.localStorage && window.localStorage.getItem.bind(window.localStorage), 'high', 'low', 'Ominto.X-Auth-', 'Token', 'Ominto.historic-user');
