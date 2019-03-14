define(['vendors/jquery.$$.min', 'vendors/jquery.min'], {
  elements: {
    $menu: '#category-menu-widget-block-menu'
  },
  init: function() {
    return $$(this.elements.$menu).find('.active').parents('.menu').show();
  }
});
