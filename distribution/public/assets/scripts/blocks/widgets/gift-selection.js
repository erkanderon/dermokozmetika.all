define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/underscore.min'], {
  elements: {
    $block: '#gift-selection-widget-block',
    $add_btn: '.gift-selection-widget-block-add-btn',
    $remove_btn: '.gift-selection-widget-block-remove-btn'
  },
  events: {
    add_btn: function() {
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
    remove_btn: function() {
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
        url: '/srv/campaign-v2/campaign/deselect-campaign/' + $$fresh(this).data('id')
      }));
    }
  },
  init: function() {
    $.ajax(_.extend(this.requests.get_cart, {
      success: function(data) {
        return blocks.widgets['gift-selection'].renders.block(function(elements) {
          return $$fresh(elements.$block).loading('hide');
        }, data, blocks.widgets['gift-selection'].elements, blocks.widgets['gift-selection'].events, blocks.widgets['gift-selection'].templates.block);
      }
    }));
  },
  renders: {
    block: function(after, data, elements, events, template) {
      $$(elements.$block).replaceWith(soda(template, data));
      $$fresh(elements.$block).find('[data-toggle="popover"]').popover({
        trigger: 'hover'
      });
      $$(elements.$add_btn).on('click', events.add_btn);
      $$(elements.$remove_btn).on('click', events.remove_btn);
      after(elements);
    }
  },
  requests: {
    get_cart: {
      dataType: 'json',
      url: '/srv/service/cart/load'
    }
  },
  templates: {
    block: $$('#gift-selection-widget-block').prop('outerHTML')
  }
});
