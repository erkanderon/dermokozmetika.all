define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/underscore.min'], {
  elements: {
    $block: '#cart-campaigns-middle-block'
  },
  init: function() {
    $.ajax(_.extend(this.requests.get_cart, {
      success: function(data) {
        blocks.middles['cart-campaigns'].renders.block(blocks.middles['cart-campaigns'].elements.$block, (function($element) {
          $$fresh($element).loading('hide');
        }), data, blocks.middles['cart-campaigns'].templates.block);
      }
    }));
  },
  renders: {
    block: function($element, after, data, template) {
      $$($element).replaceWith(soda(template, data));
      after($element);
    }
  },
  requests: {
    get_cart: {
      dataType: 'json',
      url: '/srv/service/cart/load'
    }
  },
  templates: {
    block: $$('#cart-campaigns-middle-block').prop('outerHTML')
  }
});
