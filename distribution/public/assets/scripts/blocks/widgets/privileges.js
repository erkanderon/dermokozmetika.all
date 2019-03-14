define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-swiper.min'], {
  data: {
    swiper: {
      autoHeight: true,
      autoplay: 2000,
      effect: 'fade'
    }
  },
  elements: {
    $swiper: '#privileges-widget-block-swiper'
  },
  init: function() {
    return $$(this.elements.$swiper).find('.swiper-container').swiper(this.data.swiper);
  }
});
