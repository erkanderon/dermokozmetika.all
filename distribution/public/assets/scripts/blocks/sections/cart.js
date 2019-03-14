define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/jquery-validate.min', 'vendors/underscore.min'], {
  data: {
    validate: {
      submitHandler: function(form) {
        $.ajax(_.extend(blocks.sections.cart.requests.update_coupon_code, {
          data: $$(form).serializeArray(),
          success: function(data) {
            if (data.status) {
              return location.reload();
            }
          }
        }));
        return false;
      }
    }
  },
  elements: {
    $block: '#cart-section-block',
    $btn: '.cart-section-block-btn',
    $form: '#cart-section-block-form',
    $input: '.cart-section-block-input',
    $select: '.cart-section-block-select'
  },
  events: {
    btn: function() {
      return $.ajax(_.extend(blocks.sections.cart.requests.delete_product, {
        success: function(data) {
          if (data.status) {
            return location.reload();
          }
        },
        url: '/srv/service/cart/delete/' + $$(this).data('id')
      }));
    },
    input: function(event) {
      event.preventDefault();
      return $.ajax(_.extend(blocks.sections.cart.requests.update_campaign, {
        success: function(data) {
          if (data.status) {
            return location.reload();
          } else {
            return new Noty({
              layout: 'bottomCenter',
              text: data.statusText,
              theme: 'bootstrap-v4',
              type: 'error'
            }).show();
          }
        },
        url: '/srv/campaign-v2/campaign/select-campaign/' + $$fresh(this).data('group') + '/' + $$fresh(this).data('id')
      }));
    },
    select: function() {
      return $.ajax(_.extend(blocks.sections.cart.requests.update_quantity, {
        success: function(data) {
          if (data.status) {
            return location.reload();
          }
        },
        url: '/srv/service/cart/update-item/' + $$(this).data('id') + '/' + $$(this).val()
      }));
    }
  },
  hooks: {
    init: {
      before: function() {
        if (blocks.covers['page-title']) {
          blocks.covers['page-title'].data.title = blocks.sections.cart.data.title;
        }
        if (blocks.sections['page-title']) {
          blocks.sections['page-title'].data.title = blocks.sections.cart.data.title;
        }
        if (blocks.widgets['page-title']) {
          blocks.widgets['page-title'].data.title = blocks.sections.cart.data.title;
        }
      }
    }
  },
  init: function() {
    return $.ajax(_.extend(this.requests.get_cart, {
      success: function(data) {
        gtag('event', 'page_view', {
          ecomm_pagetype: 'cart',
          ecomm_prodid: $.map(data.PRODUCTS, function(item) {
            return item.PRODUCT_CODE;
          }),
          ecomm_totalvalue: data.PRICE_CART,
          isMember: MEMBER_INFO.ID !== 0,
          gender: MEMBER_INFO.GENDER
        });
        _.forEach(data.PRODUCTS, function(item, key) {
          var index, stock;
          stock = [];
          index = 1;
          if (item.STOCK > '10') {
            item.STOCK = '10';
          }
          while (index <= item.STOCK) {
            stock.push(index);
            index++;
          }
          return data.PRODUCTS[key].STOCK = stock;
        });
        data.campaigns = [];
        _.forEach(data.CAMPAIGN_LIST, function(item, key) {
          if (item.GROUP !== '50' && item.GROUP !== '150' && item.GROUP !== '200' && item.GROUP !== '250' && item.GROUP !== '400') {
            return data.campaigns.push(data.CAMPAIGN_LIST[key]);
          }
        });
        return blocks.sections.cart.renders.block(function(elements) {
          return $$(elements.$block).loading('hide');
        }, data, {
          $block: blocks.sections.cart.elements.$block,
          $btn: blocks.sections.cart.elements.$btn,
          $form: blocks.sections.cart.elements.$form,
          $input: blocks.sections.cart.elements.$input,
          $select: blocks.sections.cart.elements.$select
        }, {
          btn: blocks.sections.cart.events.btn,
          input: blocks.sections.cart.events.input,
          select: blocks.sections.cart.events.select
        }, blocks.sections.cart.templates.block, blocks.sections.cart.data.validate);
      }
    }));
  },
  renders: {
    block: function(after, data, elements, events, template, validate) {
      $$(elements.$block).html(soda(template, data));
      $(elements.$select).each(function() {
        console.log($(this).data('quantity'));
        return $(this).val($(this).data('quantity'));
      });
      $$(elements.$btn).on('click', events.btn);
      $$(elements.$select).on('change', events.select);
      $$(elements.$form).validate(validate);
      $$(elements.$input).on('click', events.input);
      after(elements);
    }
  },
  requests: {
    get_cart: {
      dataType: 'json',
      url: '/srv/service/cart/load'
    },
    delete_product: {
      dataType: 'json'
    },
    update_campaign: {
      dataType: 'json',
      type: 'get'
    },
    update_coupon_code: {
      dataType: 'json',
      type: 'post',
      url: '/srv/service/cart/set-campaign-code'
    },
    update_quantity: {
      dataType: 'json'
    }
  },
  templates: {
    block: $$('#cart-section-block').html()
  }
});
