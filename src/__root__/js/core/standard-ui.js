/* global _, $, site */
(function (window, document, site, handlebars) {
  'use strict';

  var _storage = site.storage;
  var _keys = site.keys;
  var POST_AUTH_REDIRECT = _keys.postAuthRedirect;
  var POST_AUTH_OVERRIDE = _keys.postAuthOverride;
  var H = site.helpers;
  var C = site.commands;
  var E = site.events;
  var USER;


  preDomReady();

  function preDomReady () {
    initUI();
    initCommands();
    initEvents();
  }

  function initUI () {
    if (site.isIframe) {
      //initIframe();
    } else {
      //initMain();
    }
  }

  function initCommands() {
  }

  function initEvents() {
    E.on('global:ready', ready);
    E.on('me:loggedIn', setUserData);
  }

  function setUserData(){
    var user = site.context.userData2;
    var template = H.renderPartial('account-info', user);
    $('[data-target="account-info"]').html(template);
    if(user){
      $('html').removeClass('logged-out');
      $('html').addClass('logged-in');
    }
  }

  function ready() {
    $(document).on('change', '[data-select-target="language"]', function(event){
      var targetLanguage = $(this).find(":selected").val();
      C.run('navigate:language', targetLanguage);
    });

    $(document).on('click', '[data-collection-delete-taraget]', function(event){
      H.stopEvents(event);
      var targetItem = $(this).data('collection-delete-taraget');
      C.run('data:delete:collection-item', targetItem);
    });

    $(document).on('submit', '[data-string]', function(e){
      H.stopEvents(e);
      var formData = H.getFormData(this);
      $.ajax({
        url: 'https://us-central1-web-proposals.cloudfunctions.net/createString',
        dataType: "json",
        type: 'GET',
        data: formData,
        success: function (data) {
            console.log("Got data", data);
        },
        error: function (xhr, status, error) {
            console.log('Error: ' + JSON.stringify(error));
            console.log('status: ' + status);
        },
      });
    });


  }

  function initUIForUser(user) {
  }

})(window, document, site, window.Handlebars);
