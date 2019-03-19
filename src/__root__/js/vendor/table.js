'use strict';

/* global jQuery, Handlebars*/

(function ($) {

  function _render (partial, state) {
    if(Handlebars) {
      $(this).empty();
      $(this).append(Handlebars.compile(partial)(state).string);
    }
  }

  function _focusSearch (data) {
    var searchField = $(this).find('[data-search-field]');
    var searchFieldVal = searchField.val();

    if (data.focusSearchField) {
      searchField.focus();
      searchField.val('').val(searchFieldVal);
    }
  }

  function _openFilter (data) {
    var filter = $(this).find('.data-filter');
  }

  function _connect (handler) {
    $(this).find('[data-nav-prev]').on('click', function (en) {
      en.stopPropagation();
      en.preventDefault();

      if (handler) {
        handler('click', en, $(this).attr('id'));
      }
    });

    $(this).find('[data-nav-next]').on('click', function (en) {
      en.stopPropagation();
      en.preventDefault();

      if (handler) {
        handler('click', en, $(this).attr('id'));
      }
    });

    $(this).find('[data-nav]').on('click', function (en) {
      en.stopPropagation();
      en.preventDefault();

      if (handler) {
        en.pageNo = $(this).attr('data-nav');
        handler('click', en, $(this).attr('id'));
      }
    });

    $(this).find('[data-search-field]').on('keyup', function (en) {
      en.stopPropagation();
      en.preventDefault();

      if (en.which !== 0 && handler) {
        en.searchValue = $(this)[0].value;
        handler('keyup', en, $(this).attr('id'));
      }
    });

    $(this).find('[data-maximize]').on('click', function (en) {
      en.stopPropagation();
      en.preventDefault();

      if (handler) {
        en.maximize = $(this).attr('data-maximize');
        handler(en.type, en, $(this).attr('id'));
      }
    });

    $(this).find('[data-filter]').parent('li').on('click', function (en) {
      en.stopPropagation();
      en.preventDefault();

      var filter = $(this).find('[data-filter]');

      if (handler) {
        filter.toggleClass('active');
        // test if all filters are inactive
        if ($(this).parent().find('li .active').length === 0) {
          //$(this).closest('.table-filter').find('[data-filter]').removeClass('active');
          handler(en.type, en, $(this).parent().find('[data-filter="clearall"]').attr('id'));
        } else {
          en.filter = { id: filter.attr('data-filter'), active: filter.hasClass('active') };
          handler(en.type, en, $(this).closest('.table-filter').attr('id'));
        }
      }

    });

    $(this).find('[data-filter="open"]').on('click', function (en) {
      en.stopPropagation();
      en.preventDefault();

      $(this).next('.table-filter').toggle();

      if (handler) {
        handler(en.type, en, $(this).closest('.table-filter').attr('id'));
      }
    });

    $(this).find('[data-filter="close"]').on('click', function (en) {
      en.stopPropagation();
      en.preventDefault();

      $(this).closest('.table-filter').hide();

      if (handler) {

      }
    });

    $(this).find('[data-filter="clearall"]').on('click', function (en) {
      en.stopPropagation();
      en.preventDefault();

      $(this).closest('.table-filter').find('[data-filter]').removeClass('active');

      if (handler) {
        handler(en.type, en, $(this).attr('id'));
      }
    });

    $(this).find('[data-sort]').on('click', function (en) {
      en.stopPropagation();
      en.preventDefault();

      var ref = $(this).closest('[data-sort-ref]').attr('data-sort-ref');
      var sort = $(this).attr('data-sort');

      if (handler) {
        en.sort = sort === 'desc' ? 'asc' : 'desc';
        en.sortRef = ref;
        en.sortContext = $(this).closest('table').attr('id');
        handler(en.type, en, $(this).attr('id'));
      }
    });

    //is there a need for this?
    $(document).on('click', function (en) {
      if ($(en.currentTarget).closest('.table-filter').length === 0) {
        $('.table-filter:visible').hide();

        if (handler) {
          en.filterClose = true;
          //handler(en.type, en);
        }
      }
    })

  }

  var methods = {
    init : function(options) {
      var defaults = { state: { withHeading: true } };
      var _self = this;
      options = $.extend({}, defaults, options);
      return _self.each(function() {
        _render.call(_self, options.partial, options.state);
        _connect.call(_self, options.handler);
        //_focusSearch.call(_self, options.state);
      });
    },

    render: function(options) {
      _render.call(this, options.partial, options.state);
      _connect.call(this, options.handler);
      _focusSearch.call(this, options.data);
      _openFilter.call(this, options);
    }
  };

  $.fn.table = function(methodOrOptions) {
    if ( methods[methodOrOptions] ) {
      return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
      // Default to "init"
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.tabs' );
    }
  };

}(jQuery));
