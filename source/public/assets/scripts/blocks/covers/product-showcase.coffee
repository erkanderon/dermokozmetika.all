define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-swiper.min'
    'vendors/underscore.min'
  ]
  (
    data:
      swiper:
        autoHeight: true
        breakpoints:
          "#{config.vendors.bootstrap['grid-breakpoints'].lg}":
            autoHeight: true
            onlyExternal: false
            slidesPerColumn: 1
            slidesPerView: 3
            spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].md
          "#{config.vendors.bootstrap['grid-breakpoints'].md}":
            autoHeight: false
            onlyExternal: false
            slidesPerColumn: 2
            slidesPerView: 2
            spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].sm
          "#{config.vendors.bootstrap['grid-breakpoints'].sm}":
            autoHeight: false
            onlyExternal: false
            slidesPerColumn: 2
            slidesPerView: 2
            spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].xs
          "#{config.vendors.bootstrap['grid-breakpoints'].xl}":
            autoHeight: true
            onlyExternal: true
            slidesPerColumn: 1
            slidesPerView: 4
            spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].lg
        lazyLoading: true
        onInit: (event) -> blocks.covers['product-showcase'].events.swiper event
        onlyExternal: true
        paginationClickable: true
        preloadImages: false
        preventClicks: false
        preventClicksPropagation: false
        slidesPerColumn: 1
        slidesPerView: 4
        spaceBetween: config.vendors.bootstrap['grid-gutter-width-base']
        watchSlidesVisibility: true
    elements: $swiper: '.product-showcase-cover-block-swiper'
    events:
      swiper: (event) ->
        if (
          event.isBeginning and
          event.isEnd
        )
          $$(
            [
              event.nextButton[0]
              event.paginationContainer[0]
              event.prevButton[0]
            ]
          ).hide()
    init: -> $$(@elements.$swiper).each ->
      $$fresh @
        .find '.swiper-container'
        .swiper  _.extend(
          blocks.covers['product-showcase'].data.swiper
          nextButton: '#' + $$(@).attr('id') + ' .swiper-button-next'
          pagination: '#' + $$(@).attr('id') + ' .swiper-pagination'
          prevButton: '#' + $$(@).attr('id') + ' .swiper-button-prev'
        )
  )
)