define [
  'vendors/jquery.$$.min'
  'vendors/jquery.min'
  'vendors/jquery-loading.min'
  'vendors/underscore.min'
],
  elements:
    $block: '#gift-selection-widget-block'
    $add_btn: '.gift-selection-widget-block-add-btn'
    $remove_btn: '.gift-selection-widget-block-remove-btn'
  events:
    add_btn: ->
      $.ajax _.extend(
        blocks.sections.cart.requests.update_campaign
        success: (data) ->
          if data.status
            location.reload()
          else
            new Noty(
              layout: 'bottomCenter'
              text: data.statusText
              theme: 'bootstrap-v4'
              type: 'error'
            ).show()
        url: '/srv/campaign-v2/campaign/select-campaign/' + $$fresh(this).data('group') + '/' + $$fresh(this).data 'id'
      )
    remove_btn: ->
      $.ajax _.extend(
        blocks.sections.cart.requests.update_campaign
        success: (data) ->
          if data.status
            location.reload()
          else
            new Noty(
              layout: 'bottomCenter'
              text: data.statusText
              theme: 'bootstrap-v4'
              type: 'error'
            ).show()
        url: '/srv/campaign-v2/campaign/deselect-campaign/' + $$fresh(this).data 'id'
      )
  init: ->
    $.ajax _.extend(
      @requests.get_cart,
      success: (data) -> blocks.widgets['gift-selection'].renders.block(
        (elements) -> $$fresh(elements.$block).loading 'hide'
        data
        blocks.widgets['gift-selection'].elements
        blocks.widgets['gift-selection'].events
        blocks.widgets['gift-selection'].templates.block
      )
    )
    return
  renders: block: (after, data, elements, events, template) ->
    $$(elements.$block).replaceWith soda(template, data)

    $$fresh(elements.$block).find('[data-toggle="popover"]')
      .popover trigger: 'hover'

    $$(elements.$add_btn).on(
      'click'
      events.add_btn
    )

    $$(elements.$remove_btn).on(
      'click'
      events.remove_btn
    )

    after elements
    return
  requests: get_cart:
    dataType: 'json'
    url: '/srv/service/cart/load'
  templates: block: $$('#gift-selection-widget-block').prop('outerHTML')
