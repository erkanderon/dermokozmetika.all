define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-loading.min'
  ]
  elements: $block: '#page-title-section-block'
  init: -> @renders.block(
    @elements.$block
    ($element) -> $$fresh($element).loading 'hide'
    @data
    @templates.block
  )
  renders:
    block: (
      $element
      after
      data
      template
    ) ->
      $$($element).replaceWith soda(
        template
        data
      )

      after $element

      return
  templates: block: $$('#page-title-section-block').prop 'outerHTML'
)