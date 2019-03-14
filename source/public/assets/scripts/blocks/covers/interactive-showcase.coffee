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
          effect: 'slide'
          lazyLoadingClass: 'swiper-lazy-md'
          loop: false
          onlyExternal: false
        "#{config.vendors.bootstrap['grid-breakpoints'].md}":
          effect: 'slide'
          lazyLoadingClass: 'swiper-lazy-sm'
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
      keyboardControl: true
      lazyLoading: true
      lazyLoadingClass: 'swiper-lazy-xl'
      loop: true
      onlyExternal: true
      paginationClickable: true
      preloadImages: false
      preventClicks: false
      preventClicksPropagation: false
  elements: $swiper: '#interactive-showcase-cover-block-swiper'
  init: ->
    @swiper = $$ @elements.$swiper
      .find '.swiper-container'
      .swiper _.extend(
        @data.swiper
        nextButton: @elements.$swiper + ' .swiper-button-next'
        pagination: @elements.$swiper + ' .swiper-pagination'
        prevButton: @elements.$swiper + ' .swiper-button-prev'
      )

    if @swiper.params.autoplay
      @swiper.container.hover(
        @swiper.stopAutoplay
        @swiper.startAutoplay
      )

    return
)