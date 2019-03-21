/* global $ */
'use strict';

(function (window, site) {

  var H = site.helpers;
  var C = site.commands;
  var E = site.events;
  var CONTEXT = site.context;
  var USER;

  preDomReady();

  function preDomReady(){
    initEvents();
  }

  function initEvents(){
    E.on('global:ready', ready);
    E.on('me:loggedIn', userCheck)
  }

  function userCheck() {
    USER = site.context.userData2;
    if(USER){
      C.run('navigate:home');
    }
  }

  function ready(){

  }

})(window, window.site, window.jQuery);
