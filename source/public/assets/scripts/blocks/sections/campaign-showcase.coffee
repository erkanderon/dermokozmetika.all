define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-swiper.min'
    'vendors/underscore.min'
  ]
  data:
    swiper:
      breakpoints:
        "#{config.vendors.bootstrap['grid-breakpoints'].lg}":
          lazyLoadingClass: 'swiper-lazy-md'
          mousewheelControl: false
          onlyExternal: false
          slidesPerView: 2
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].md
        "#{config.vendors.bootstrap['grid-breakpoints'].md}":
          lazyLoadingClass: 'swiper-lazy-sm'
          mousewheelControl: false
          onlyExternal: false
          slidesPerView: 1
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].sm
        "#{config.vendors.bootstrap['grid-breakpoints'].sm}":
          lazyLoadingClass: 'swiper-lazy-xs'
          mousewheelControl: false
          onlyExternal: false
          slidesPerView: 1
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].xs
        "#{config.vendors.bootstrap['grid-breakpoints'].xl}":
          lazyLoadingClass: 'swiper-lazy-lg'
          mousewheelControl: true
          onlyExternal: true
          slidesPerView: 3
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].lg
      lazyLoading: true
      lazyLoadingClass: 'swiper-lazy-xl'
      mousewheelControl: true
      mousewheelForceToAxis: true
      onlyExternal: true
      paginationClickable: true
      preloadImages: false
      slidesPerView: 4
      spaceBetween: config.vendors.bootstrap['grid-gutter-width-base']
  elements: $swiper: '#campaign-showcase-section-block-swiper'
  init: ->
    $$ @elements.$swiper
      .find '.swiper-container'
      .swiper _.extend(
        @data.swiper
        pagination: @elements.$swiper + ' .swiper-pagination'
      )
)