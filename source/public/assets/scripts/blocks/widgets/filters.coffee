define(
  [
    'vendors/bootstrap-slider.min'
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-loading.min'
    'vendors/jquery-mmenu-all.min'
    'vendors/jquery-perfect_scrollbar.min'
    'vendors/underscore.min'
  ]
  (
    data:
      mmenu:
        dividers:
          add: true
          addTo: '#filters-widget-block-brands-mm-listview, #filters-widget-block-colors-mm-listview'
        extensions: [
          'fx-menu-slide'
          'fx-panels-slide-100'
          'pagedim-black'
          'shadow-panels'
          'theme-white'
        ]
        navbars: [ (
            'content': '<button class="btn btn-block btn-primary" data-i18n="[title]apply;apply" id="filters-widget-block-btn" title="Uygula" type="button">Uygula</button>'
            'position': 'bottom'
        ) ]
        offCanvas:
          position: 'right'
          zposition: 'front'
        onClick: setSelected: false
        searchfield:
          add: true
          addTo: '#filters-widget-block-brands-mm-listview, #filters-widget-block-colors-mm-listview'
          clear: true
        sectionIndexer:
          add: true
          addTo: '#filters-widget-block-brands-mm-listview, #filters-widget-block-colors-mm-listview'
      perfect_scrollbar: suppressScrollX: true
      url: URI()
    elements:
      $block: '#filters-widget-block'
      $btn: '#filters-widget-block-btn'
      $custom_control: '.filters-widget-block-custom-control'
      $dt: '#filters-widget-block-dt'
      $list_unstyled: '.filters-widget-block-list-unstyled'
      $mm_menu: '#filters-widget-block-mm-menu'
      $price_range_input: '#filters-widget-block-price-range-input'
    events:
      btn: -> location.href = blocks.widgets.filters.data.url.readable()
      custom_control:
        custom_control_input: -> location.href = blocks.widgets.filters.functions.build_url(
          !$$fresh(@).is ':checked'
          key = $$ @
            .closest blocks.widgets.filters.elements.$list_unstyled
            .data 'key'
          (
            key == 'multi' ||
            key == 'single'
          ) && ' ' || '-'
          URI()
          $$(@).val()
        )
      mmenu:
        toggle: -> blocks.widgets.filters.data.url = blocks.widgets.filters.functions.build_url(
          !$$fresh(@).is ':checked'
          key = $$ @
            .closest '.mm-listview'
            .data 'key'
          (
            key == 'multi' ||
              key == 'single'
          ) && ' ' || '-'
          blocks.widgets.filters.data.url
          $$(@).val()
        )
      price_range_input:
        slide: (event) -> blocks.widgets.filters.renders.dt(
          blocks.widgets.filters.elements.$dt
          (
            PRICE:
              MAX_SELECTED: event.value[1]
              MIN_SELECTED: event.value[0]
          )
          blocks.widgets.filters.templates.dt
        )
        slide_stop: (event) ->
          location.href = if (
            event.value[0] != $$(@).data('slider-min') or
            event.value[1] != $$(@).data('slider-max')
          )
            URI()
              .setQuery(
                'price'
                event.value[0] + '-' + event.value[1]
              )
              .readable()
          else if URI().hasQuery 'price'
            URI()
              .removeQuery 'price'
              .readable()
    functions:
      build_url: (
        is_selected
        key
        seperator
        url
        value
      ) ->
        return if (
          URI(url).hasQuery(
            key
            true
          )
        )
          if is_selected
            URI(url).removeQuery('pg').setQuery(
              key
              _
                .without(
                  URI(url)
                    .query(true)[key]
                    .split seperator
                  value
                )
                .join seperator
            )
          else
            URI(url).removeQuery('pg').setQuery(
              key
              _
                .union(
                  URI(url)
                    .query(true)[key]
                    .split seperator
                  [value]
                )
                .join seperator
            )
        else
          URI(url).removeQuery('pg').setQuery(
            key
            value
          )
    init: -> $.ajax(
      _.extend(
        @requests.get_filters
        (
          url: (
            URI '/srv/service/filter/get/filters-variants-brands-categories-price'
              .search(URI().search())
              .addQuery(
                'link'
                URI().filename()
              )
              .readable()
          )
          success: (data) ->
            _.each(data.CATEGORIES, (item) -> if item.ID == '450' then data.CATEGORIES = _.without(data.CATEGORIES, item))
            blocks.widgets.filters.renders.block(
              (elements) -> $$(elements.$block).loading 'hide'
              data
              blocks.widgets.filters.elements
              blocks.widgets.filters.events
              blocks.widgets.filters.data.mmenu
              blocks.widgets.filters.data.perfect_scrollbar
              blocks.widgets.filters.templates.block
            )
        )
      )
    )
    renders:
      block: (
        after
        data
        elements
        events
        mmenu
        perfect_scrollbar
        template
      ) ->
        $$ elements.$block
          .html soda(
            template
            data
          )
          .find '.list-unstyled'
          .perfectScrollbar perfect_scrollbar

        $$fresh elements.$custom_control
          .find '.custom-control-input'
          .on(
            'change'
            events.custom_control.custom_control_input
          )

        $$ elements.$price_range_input
          .slider()
          .on(
            'slide'
            events
              .price_range_input
              .slide
          )
          .on(
            'slideStop'
            events
              .price_range_input
              .slide_stop
          )

        $$ elements.$mm_menu
          .mmenu mmenu
          .find '.mm-toggle'
          .on(
            'change'
            events.mmenu.toggle
          )

        $$(elements.$btn).on(
          'click'
          events.btn
        )

        after elements

        return;
      dt: (
        $element
        data
        template
      ) ->
        $$fresh($element).html soda(
          template
          data
        )
    requests:
      get_filters: dataType: 'json'
    templates:
      block: $$('#filters-widget-block').html()
      dt: $$('#filters-widget-block-dt').html()
  )
)