define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/underscore.min'], {
  elements: {
    $block: '#orders-section-block'
  },
  init: function() {
    return $.ajax(_.extend(this.requests.get, {
      success: function(data) {
        return blocks.sections.orders.renders.block(blocks.sections.orders.elements.$block, function($element) {
          return $$($element).loading('hide');
        }, data, blocks.sections.orders.templates.block);
      }
    }));
  },
  renders: {
    block: function($element, after, data, template) {
      $$($element).html(soda(template, data));
      after($element);
    }
  },
  requests: {
    get: {
      dataType: 'json',
      url: '/srv/service/order-v4/get-list'
    }
  },
  templates: {
    block: $$('#orders-section-block').html()
  }
});
