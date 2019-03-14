define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-swiper.min'
  ]
  data:
    swiper:
      autoplay: 2000
      breakpoints:
        "#{config.vendors.bootstrap['grid-breakpoints'].lg}":
          mousewheelControl: false
          onlyExternal: false
          slidesPerColumn: 1
          slidesPerView: 4
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].md
        "#{config.vendors.bootstrap['grid-breakpoints'].md}":
          mousewheelControl: false
          onlyExternal: false
          slidesPerColumn: 2
          slidesPerView: 3
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].sm
        "#{config.vendors.bootstrap['grid-breakpoints'].sm}":
          mousewheelControl: false
          onlyExternal: false
          slidesPerColumn: 3
          slidesPerView: 2
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].xs
        "#{config.vendors.bootstrap['grid-breakpoints'].xl}":
          mousewheelControl: true
          onlyExternal: true
          slidesPerColumn: 1
          slidesPerView: 5
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].lg
      lazyLoading: true
      mousewheelControl: true
      mousewheelForceToAxis: true
      onlyExternal: true
      preloadImages: false
      preventClicks: false
      preventClicksPropagation: false
      slidesPerColumn: 1
      slidesPerView: 6
      spaceBetween: config.vendors.bootstrap['grid-gutter-width-base']
      watchSlidesVisibility: true
  elements: $swiper: '#brand-showcase-cover-block-swiper'
  init: ->
    @swiper = $$ @elements.$swiper
      .find '.swiper-container'
      .swiper @data.swiper

    @swiper.container.hover(
      @swiper.stopAutoplay
      @swiper.startAutoplay
    )

    return
)