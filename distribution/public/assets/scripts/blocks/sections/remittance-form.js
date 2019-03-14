define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/jquery-validate.min'], {
  elements: {
    $btn: '#remittance-form-section-block-btn',
    $form: '#remittance-form-section-block-form'
  },
  events: {
    form: function(data) {
      $.ajax($.extend(blocks.sections['remittance-form'].requests.send, {
        beforeSend: function() {
          return $$(blocks.sections['remittance-form'].elements.$btn).loading();
        },
        complete: function() {
          return $$(blocks.sections['remittance-form'].elements.$btn).loading('hide');
        },
        data: $$(data).serializeArray(),
        success: function() {
          new Noty({
            callbacks: {
              afterClose: function() {
                return location.reload();
              }
            },
            layout: 'bottomCenter',
            text: 'Havale bildiriminiz başarıyla kaydedildi.',
            theme: 'bootstrap-v4',
            type: 'success'
          }).show();
          return $$(blocks.sections['remittance-form'].elements.$btn).attr('disabled', true);
        }
      }));
      return false;
    }
  },
  init: function() {
    return this.validate = $$(this.elements.$form).validate({
      submitHandler: this.events.form
    });
  },
  requests: {
    send: {
      dataType: 'json',
      type: 'post',
      url: '/conn/RemittanceForm/saveRemittanceForm'
    }
  }
});
