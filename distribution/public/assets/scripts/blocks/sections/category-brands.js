var obj;

define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-swiper.min'], {
  data: {
    swiper: {
      autoplay: 2000,
      breakpoints: (
        obj = {},
        obj["" + config.vendors.bootstrap['grid-breakpoints'].lg] = {
          mousewheelControl: false,
          onlyExternal: false,
          slidesPerColumn: 1,
          slidesPerView: 4,
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].md
        },
        obj["" + config.vendors.bootstrap['grid-breakpoints'].md] = {
          mousewheelControl: false,
          onlyExternal: false,
          slidesPerColumn: 2,
          slidesPerView: 3,
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].sm
        },
        obj["" + config.vendors.bootstrap['grid-breakpoints'].sm] = {
          mousewheelControl: false,
          onlyExternal: false,
          slidesPerColumn: 3,
          slidesPerView: 2,
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].xs
        },
        obj["" + config.vendors.bootstrap['grid-breakpoints'].xl] = {
          mousewheelControl: true,
          onlyExternal: true,
          slidesPerColumn: 1,
          slidesPerView: 5,
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].lg
        },
        obj
      ),
      lazyLoading: true,
      mousewheelControl: true,
      mousewheelForceToAxis: true,
      onlyExternal: true,
      preloadImages: false,
      preventClicks: false,
      preventClicksPropagation: false,
      slidesPerColumn: 1,
      slidesPerView: 6,
      spaceBetween: config.vendors.bootstrap['grid-gutter-width-base'],
      watchSlidesVisibility: true
    }
  },
  init: function() {
    this.swiper = $$('#category-brands-section-block').find('.swiper-container').swiper(this.data.swiper);
    this.swiper.container.hover(this.swiper.stopAutoplay, this.swiper.startAutoplay);
  }
});
