define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-loading.min'
    'vendors/underscore.min'
  ]
  elements: $block: '#coupons-section-block'
  init: -> $.ajax _.extend(
    @requests.get
    success: (data) -> blocks.sections.coupons.renders.block(
      blocks.sections.coupons.elements.$block
      ($element) -> $$($element).loading 'hide'
      data
      blocks.sections.coupons.templates.block
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
      url: '/srv/service/profile/get-coupon-list'
  templates: block: $$('#coupons-section-block').html()
)