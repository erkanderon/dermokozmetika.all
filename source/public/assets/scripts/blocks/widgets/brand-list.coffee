define(
  [
    'vendors/i18next.min'
    'vendors/jquery.$$.min'
    'vendors/jquery-hideseek.min'
    'vendors/jquery-perfect_scrollbar.min'
    'vendors/jquery-validate.min'
  ]
  data:
    hideseek:
      highlight: true
      nodata: $.t 'brand-not-found'
    perfect_scrollbar: suppressScrollX: true
    validate:
      messages: q: null
  elements:
    $form: '#brand-list-widget-block-form'
    $input: '#brand-list-widget-block-input'
    $menu: '#brand-list-widget-block-menu'
  init: ->
    $$(@elements.$form).validate @data.validate
    $$(@elements.$input).hideseek @data.hideseek
    $$(@elements.$menu).perfectScrollbar @data.perfect_scrollbar

    return
)