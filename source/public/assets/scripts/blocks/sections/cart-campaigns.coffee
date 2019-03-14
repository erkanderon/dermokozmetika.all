define [
  'vendors/jquery.$$.min'
  'vendors/jquery.min'
  'vendors/jquery-loading.min'
  'vendors/underscore.min'
],
  elements: $block: '#cart-campaigns-middle-block'
  init: ->
    $.ajax _.extend(@requests.get_cart, success: (data) ->
      blocks.middles['cart-campaigns'].renders.block blocks.middles['cart-campaigns'].elements.$block, (($element) ->
        $$fresh($element).loading 'hide'
        return
      ), data, blocks.middles['cart-campaigns'].templates.block
      return
    )
    return
  renders: block: ($element, after, data, template) ->
    $$($element).replaceWith soda(template, data)

    after $element
    return
  requests: get_cart:
    dataType: 'json'
    url: '/srv/service/cart/load'
  templates: block: $$('#cart-campaigns-middle-block').prop('outerHTML')
