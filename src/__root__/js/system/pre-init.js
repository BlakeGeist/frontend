/* global site */
(function (html, window, search, hash, get, high, low, auth, token, htoken) {
  'use strict';

  var mod = function (action, arg) { html.className = html.className.split(' ')[action](arg).join(' '); };
  var add = function (cl) { mod('concat', [cl]); };
  var remove = function (cl) { mod('filter', function (x) { return x !== cl; }); };
  var toggle = function (cond, cl) { (cond ? add : remove)(cl); };

  var config = {
    apiKey: "AIzaSyDriZIhBxf7qF73SUOR-wDBHMceP5w7Rss",
    authDomain: "web-proposals.firebaseapp.com",
    databaseURL: "https://web-proposals.firebaseio.com",
    projectId: "web-proposals",
    storageBucket: "web-proposals.appspot.com",
    messagingSenderId: "907512529926"
  };
  firebase.initializeApp(config);
  
  try {
    window.site = {};

  } catch (e) {
    return false;
  }
})(document.documentElement, window, window.location.search, window.location.hash, window.localStorage && window.localStorage.getItem.bind(window.localStorage), 'high', 'low', 'Site.X-Auth-', 'Token', 'Site.historic-user');
