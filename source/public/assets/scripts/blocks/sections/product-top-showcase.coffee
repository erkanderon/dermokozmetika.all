define(
  [
    'vendors/jquery.$$.min'
    'vendors/readmore.min'
  ]
  init: -> $$('#product-top-showcase-section-block .block-body').readmore(
    moreLink: '<a href="#"><strong>Devamını göster <i class="fa fa-caret-down"></i></strong></a>'
    lessLink: '<a href="#"><strong>Devamını gizle <i class="fa fa-caret-up"></i></strong></a>'
  )
)