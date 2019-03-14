define(['vendors/jquery.$$.min', 'vendors/jquery.min'], {
  elements: {
    $menu: '#brand-categories-widget-block-menu'
  },
  init: function() {
    if (URI().hasQuery('category')) {
      return $$(this.elements.$menu).find('.menu-link').each(function() {
        if (URI().query(true).category === URI($$(this).attr('href')).query(true).category) {
          return $$(this).addClass('active');
        }
      });
    }
  }
});
