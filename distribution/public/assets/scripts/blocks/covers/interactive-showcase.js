var obj;

define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-swiper.min', 'vendors/underscore.min'], {
  data: {
    swiper: {
      breakpoints: (
        obj = {},
        obj["" + config.vendors.bootstrap['grid-breakpoints'].lg] = {
          effect: 'slide',
          lazyLoadingClass: 'swiper-lazy-md',
          loop: false,
          onlyExternal: false
        },
        obj["" + config.vendors.bootstrap['grid-breakpoints'].md] = {
          effect: 'slide',
          lazyLoadingClass: 'swiper-lazy-sm',
          loop: false,
          onlyExternal: false
        },
        obj["" + config.vendors.bootstrap['grid-breakpoints'].sm] = {
          effect: 'slide',
          lazyLoadingClass: 'swiper-lazy-xs',
          loop: false,
          onlyExternal: false
        },
        obj["" + config.vendors.bootstrap['grid-breakpoints'].xl] = {
          effect: 'fade',
          lazyLoadingClass: 'swiper-lazy-lg',
          loop: true,
          onlyExternal: true
        },
        obj
      ),
      effect: 'fade',
      keyboardControl: true,
      lazyLoading: true,
      lazyLoadingClass: 'swiper-lazy-xl',
      loop: true,
      onlyExternal: true,
      paginationClickable: true,
      preloadImages: false,
      preventClicks: false,
      preventClicksPropagation: false
    }
  },
  elements: {
    $swiper: '#interactive-showcase-cover-block-swiper'
  },
  init: function() {
    this.swiper = $$(this.elements.$swiper).find('.swiper-container').swiper(_.extend(this.data.swiper, {
      nextButton: this.elements.$swiper + ' .swiper-button-next',
      pagination: this.elements.$swiper + ' .swiper-pagination',
      prevButton: this.elements.$swiper + ' .swiper-button-prev'
    }));
    if (this.swiper.params.autoplay) {
      this.swiper.container.hover(this.swiper.stopAutoplay, this.swiper.startAutoplay);
    }
  }
});
