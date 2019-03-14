define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/underscore.min'], {
  elements: {
    $block: '#coupons-section-block'
  },
  init: function() {
    return $.ajax(_.extend(this.requests.get, {
      success: function(data) {
        return blocks.sections.coupons.renders.block(blocks.sections.coupons.elements.$block, function($element) {
          return $$($element).loading('hide');
        }, data, blocks.sections.coupons.templates.block);
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
      url: '/srv/service/profile/get-coupon-list'
    }
  },
  templates: {
    block: $$('#coupons-section-block').html()
  }
});
