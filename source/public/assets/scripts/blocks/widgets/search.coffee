define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery-validate.min'
  ]
  elements: $form: '#search-widget-block-form'
  init: -> $$(@elements.$form).validate()
)