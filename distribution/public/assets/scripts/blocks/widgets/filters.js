define(['vendors/bootstrap-slider.min', 'vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/jquery-mmenu-all.min', 'vendors/jquery-perfect_scrollbar.min', 'vendors/underscore.min'], {
  data: {
    mmenu: {
      dividers: {
        add: true,
        addTo: '#filters-widget-block-brands-mm-listview, #filters-widget-block-colors-mm-listview'
      },
      extensions: ['fx-menu-slide', 'fx-panels-slide-100', 'pagedim-black', 'shadow-panels', 'theme-white'],
      navbars: [
        {
          'content': '<button class="btn btn-block btn-primary" data-i18n="[title]apply;apply" id="filters-widget-block-btn" title="Uygula" type="button">Uygula</button>',
          'position': 'bottom'
        }
      ],
      offCanvas: {
        position: 'right',
        zposition: 'front'
      },
      onClick: {
        setSelected: false
      },
      searchfield: {
        add: true,
        addTo: '#filters-widget-block-brands-mm-listview, #filters-widget-block-colors-mm-listview',
        clear: true
      },
      sectionIndexer: {
        add: true,
        addTo: '#filters-widget-block-brands-mm-listview, #filters-widget-block-colors-mm-listview'
      }
    },
    perfect_scrollbar: {
      suppressScrollX: true
    },
    url: URI()
  },
  elements: {
    $block: '#filters-widget-block',
    $btn: '#filters-widget-block-btn',
    $custom_control: '.filters-widget-block-custom-control',
    $dt: '#filters-widget-block-dt',
    $list_unstyled: '.filters-widget-block-list-unstyled',
    $mm_menu: '#filters-widget-block-mm-menu',
    $price_range_input: '#filters-widget-block-price-range-input'
  },
  events: {
    btn: function() {
      return location.href = blocks.widgets.filters.data.url.readable();
    },
    custom_control: {
      custom_control_input: function() {
        var key;
        return location.href = blocks.widgets.filters.functions.build_url(!$$fresh(this).is(':checked'), key = $$(this).closest(blocks.widgets.filters.elements.$list_unstyled).data('key'), (key === 'multi' || key === 'single') && ' ' || '-', URI(), $$(this).val());
      }
    },
    mmenu: {
      toggle: function() {
        var key;
        return blocks.widgets.filters.data.url = blocks.widgets.filters.functions.build_url(!$$fresh(this).is(':checked'), key = $$(this).closest('.mm-listview').data('key'), (key === 'multi' || key === 'single') && ' ' || '-', blocks.widgets.filters.data.url, $$(this).val());
      }
    },
    price_range_input: {
      slide: function(event) {
        return blocks.widgets.filters.renders.dt(blocks.widgets.filters.elements.$dt, {
          PRICE: {
            MAX_SELECTED: event.value[1],
            MIN_SELECTED: event.value[0]
          }
        }, blocks.widgets.filters.templates.dt);
      },
      slide_stop: function(event) {
        return location.href = event.value[0] !== $$(this).data('slider-min') || event.value[1] !== $$(this).data('slider-max') ? URI().setQuery('price', event.value[0] + '-' + event.value[1]).readable() : URI().hasQuery('price') ? URI().removeQuery('price').readable() : void 0;
      }
    }
  },
  functions: {
    build_url: function(is_selected, key, seperator, url, value) {
      if (URI(url).hasQuery(key, true)) {
        if (is_selected) {
          return URI(url).removeQuery('pg').setQuery(key, _.without(URI(url).query(true)[key].split(seperator), value).join(seperator));
        } else {
          return URI(url).removeQuery('pg').setQuery(key, _.union(URI(url).query(true)[key].split(seperator), [value]).join(seperator));
        }
      } else {
        return URI(url).removeQuery('pg').setQuery(key, value);
      }
    }
  },
  init: function() {
    return $.ajax(_.extend(this.requests.get_filters, {
      url: URI('/srv/service/filter/get/filters-variants-brands-categories-price').search(URI().search()).addQuery('link', URI().filename()).readable(),
      success: function(data) {
        _.each(data.CATEGORIES, function(item) {
          if (item.ID === '450') {
            return data.CATEGORIES = _.without(data.CATEGORIES, item);
          }
        });
        return blocks.widgets.filters.renders.block(function(elements) {
          return $$(elements.$block).loading('hide');
        }, data, blocks.widgets.filters.elements, blocks.widgets.filters.events, blocks.widgets.filters.data.mmenu, blocks.widgets.filters.data.perfect_scrollbar, blocks.widgets.filters.templates.block);
      }
    }));
  },
  renders: {
    block: function(after, data, elements, events, mmenu, perfect_scrollbar, template) {
      $$(elements.$block).html(soda(template, data)).find('.list-unstyled').perfectScrollbar(perfect_scrollbar);
      $$fresh(elements.$custom_control).find('.custom-control-input').on('change', events.custom_control.custom_control_input);
      $$(elements.$price_range_input).slider().on('slide', events.price_range_input.slide).on('slideStop', events.price_range_input.slide_stop);
      $$(elements.$mm_menu).mmenu(mmenu).find('.mm-toggle').on('change', events.mmenu.toggle);
      $$(elements.$btn).on('click', events.btn);
      after(elements);
    },
    dt: function($element, data, template) {
      return $$fresh($element).html(soda(template, data));
    }
  },
  requests: {
    get_filters: {
      dataType: 'json'
    }
  },
  templates: {
    block: $$('#filters-widget-block').html(),
    dt: $$('#filters-widget-block-dt').html()
  }
});
