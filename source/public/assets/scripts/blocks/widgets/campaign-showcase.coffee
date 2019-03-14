define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-swiper.min'
    'vendors/underscore.min'
  ]
  data:
    swiper:
      autoplay: 3000
      breakpoints:
        "#{config.vendors.bootstrap['grid-breakpoints'].md}":
          effect: 'slide'
          lazyLoadingClass: 'swiper-lazy-sm'
          loop: false
          onlyExternal: false
        "#{config.vendors.bootstrap['grid-breakpoints'].lg}":
          effect: 'slide'
          lazyLoadingClass: 'swiper-lazy-md'
          loop: false
          onlyExternal: false
        "#{config.vendors.bootstrap['grid-breakpoints'].sm}":
          effect: 'slide'
          lazyLoadingClass: 'swiper-lazy-xs'
          loop: false
          onlyExternal: false
        "#{config.vendors.bootstrap['grid-breakpoints'].xl}":
          effect: 'fade'
          lazyLoadingClass: 'swiper-lazy-lg'
          loop: true
          onlyExternal: true
      effect: 'fade'
      lazyLoading: true
      lazyLoadingClass: 'swiper-lazy-xl'
      loop: true
      onlyExternal: true
      paginationClickable: true
      preloadImages: false
  elements: $swiper: '#campaign-showcase-widget-block-swiper'
  init: ->
    @swiper = $$ @elements.$swiper
      .find '.swiper-container'
      .swiper _.extend(
        @data.swiper
        pagination: @elements.$swiper + ' .swiper-pagination'
      )

    @swiper.container.hover(
      @swiper.stopAutoplay
      @swiper.startAutoplay
    )

    return
)