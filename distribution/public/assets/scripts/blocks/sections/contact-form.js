define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/jquery-validate.min'], {
  elements: {
    $btn: '#contact-form-section-block-btn',
    $form: '#contact-form-section-block-form'
  },
  init: function() {
    return $$(this.elements.$form).validate({
      submitHandler: function(form) {
        $.ajax(_.extend(blocks.sections['contact-form'].requests.send, {
          complete: function() {
            return $$(blocks.sections['contact-form'].elements.$btn).loading('hide');
          },
          beforeSend: function() {
            return $$(blocks.sections['contact-form'].elements.$btn).loading();
          },
          data: $$(form).serializeArray(),
          success: function(data) {
            if (data.success) {
              new Noty({
                layout: 'bottomCenter',
                text: 'Teşekkürler. Mesajınız başarıyla gönderildi.',
                theme: 'bootstrap-v4',
                type: 'success'
              }).show();
              return $$(blocks.sections['contact-form'].elements.$btn).attr('disabled', true);
            }
          }
        }));
        return false;
      }
    });
  },
  requests: {
    send: {
      dataType: 'json',
      type: 'post',
      url: '/srv/service/guest/sendContactMessage'
    }
  }
});
