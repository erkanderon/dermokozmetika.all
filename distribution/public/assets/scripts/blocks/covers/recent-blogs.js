var obj;

define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/jquery-swiper.min', 'vendors/underscore.min'], {
  data: {
    swiper: {
      autoHeight: true,
      breakpoints: (
        obj = {},
        obj["" + config.vendors.bootstrap['grid-breakpoints'].lg] = {
          mousewheelControl: false,
          onlyExternal: false,
          slidesPerView: 2,
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].md
        },
        obj["" + config.vendors.bootstrap['grid-breakpoints'].md] = {
          mousewheelControl: false,
          onlyExternal: false,
          slidesPerView: 1,
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].sm
        },
        obj["" + config.vendors.bootstrap['grid-breakpoints'].sm] = {
          mousewheelControl: false,
          onlyExternal: false,
          slidesPerView: 1,
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].xs
        },
        obj["" + config.vendors.bootstrap['grid-breakpoints'].xl] = {
          mousewheelControl: true,
          onlyExternal: true,
          slidesPerView: 3,
          spaceBetween: config.vendors.bootstrap['grid-gutter-widths'].lg
        },
        obj
      ),
      lazyLoading: true,
      mousewheelControl: true,
      mousewheelForceToAxis: true,
      nextButton: '#recent-blogs-cover-block .swiper-button-next',
      onlyExternal: true,
      pagination: '#recent-blogs-cover-block .swiper-pagination',
      paginationClickable: true,
      preloadImages: false,
      prevButton: '#recent-blogs-cover-block .swiper-button-prev',
      preventClicks: false,
      preventClicksPropagation: false,
      slidesPerView: 4,
      spaceBetween: config.vendors.bootstrap['grid-gutter-width-base']
    }
  },
  init: function() {
    return $.ajax(_.extend(this.requests.get_posts, {
      success: function(data) {
        return blocks.covers['recent-blogs'].renders.block(function() {
          return $$('#recent-blogs-cover-block').loading('hide');
        }, {
          data: _.each(data, function(item) {
            if (item.format === 'image' || item.format === 'standard') {
              return item.excerpt.rendered = $$(item.excerpt.rendered).text().substring(0, 100);
            }
          })
        });
      }
    }));
  },
  requests: {
    get_posts: {
      dataType: 'json',
      url: '//mag.dermokozmetika.com.tr/wp-json/wp/v2/posts?_embed'
    }
  },
  renders: {
    block: function(after, data) {
      console.log(data);
      $$('#recent-blogs-cover-block').html(soda($$('#recent-blogs-cover-block').html(), data)).find('.swiper-container').swiper(blocks.covers['recent-blogs'].data.swiper);
      after();
    }
  }
});
