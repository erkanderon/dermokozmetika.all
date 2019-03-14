define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-loading.min'
    'vendors/underscore.min'
  ]
  elements: $block: '#orders-section-block'
  init: -> $.ajax _.extend(
    @requests.get
    success: (data) -> blocks.sections.orders.renders.block(
      blocks.sections.orders.elements.$block
      ($element) -> $$($element).loading 'hide'
      data
      blocks.sections.orders.templates.block
    )
  )
  renders:
    block: (
      $element
      after
      data
      template
    ) ->
      $$($element).html soda(
        template
        data
      )

      after $element

      return
  requests:
    get:
      dataType: 'json'
      url: '/srv/service/order-v4/get-list'
  templates: block: $$('#orders-section-block').html()
)