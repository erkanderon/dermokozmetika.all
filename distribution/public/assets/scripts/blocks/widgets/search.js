define(['vendors/jquery.$$.min', 'vendors/jquery-validate.min'], {
  elements: {
    $form: '#search-widget-block-form'
  },
  init: function() {
    return $$(this.elements.$form).validate();
  }
});
