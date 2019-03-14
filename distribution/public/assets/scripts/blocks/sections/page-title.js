define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min'], {
  elements: {
    $block: '#page-title-section-block'
  },
  init: function() {
    return this.renders.block(this.elements.$block, function($element) {
      return $$fresh($element).loading('hide');
    }, this.data, this.templates.block);
  },
  renders: {
    block: function($element, after, data, template) {
      $$($element).replaceWith(soda(template, data));
      after($element);
    }
  },
  templates: {
    block: $$('#page-title-section-block').prop('outerHTML')
  }
});
