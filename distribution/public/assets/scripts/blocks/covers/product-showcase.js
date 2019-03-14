var obj;

define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-swiper.min', 'vendors/underscore.min'], {
  data: {
    swiper: {
      autoHeight: true,
      breakpoints: (
        obj = {},
        obj["" + config.vendors.bootstrap['grid-breakpoints'].lg] = {
          autoHeight: true,
          onlyExternal: false,
          slidesPerColumn: 1,
          slidesPerView: 3,
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].md
        },
        obj["" + config.vendors.bootstrap['grid-breakpoints'].md] = {
          autoHeight: false,
          onlyExternal: false,
          slidesPerColumn: 2,
          slidesPerView: 2,
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].sm
        },
        obj["" + config.vendors.bootstrap['grid-breakpoints'].sm] = {
          autoHeight: false,
          onlyExternal: false,
          slidesPerColumn: 2,
          slidesPerView: 2,
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].xs
        },
        obj["" + config.vendors.bootstrap['grid-breakpoints'].xl] = {
          autoHeight: true,
          onlyExternal: true,
          slidesPerColumn: 1,
          slidesPerView: 4,
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].lg
        },
        obj
      ),
      lazyLoading: true,
      onInit: function(event) {
        return blocks.covers['product-showcase'].events.swiper(event);
      },
      onlyExternal: true,
      paginationClickable: true,
      preloadImages: false,
      preventClicks: false,
      preventClicksPropagation: false,
      slidesPerColumn: 1,
      slidesPerView: 4,
      spaceBetween: config.vendors.bootstrap['grid-gutter-width-base'],
      watchSlidesVisibility: true
    }
  },
  elements: {
    $swiper: '.product-showcase-cover-block-swiper'
  },
  events: {
    swiper: function(event) {
      if (event.isBeginning && event.isEnd) {
        return $$([event.nextButton[0], event.paginationContainer[0], event.prevButton[0]]).hide();
      }
    }
  },
  init: function() {
    return $$(this.elements.$swiper).each(function() {
      return $$fresh(this).find('.swiper-container').swiper(_.extend(blocks.covers['product-showcase'].data.swiper, {
        nextButton: '#' + $$(this).attr('id') + ' .swiper-button-next',
        pagination: '#' + $$(this).attr('id') + ' .swiper-pagination',
        prevButton: '#' + $$(this).attr('id') + ' .swiper-button-prev'
      }));
    });
  }
});
