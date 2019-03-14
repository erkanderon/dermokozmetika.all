define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-swiper.min'
  ]
  data:
    swiper:
      autoHeight: true
      autoplay: 2000
      effect: 'fade'
  elements: $swiper: '#privileges-widget-block-swiper'
  init: ->
    $$ @elements.$swiper
      .find '.swiper-container'
      .swiper @data.swiper
)