define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/jquery-validate.min', 'vendors/underscore.min'], {
  elements: {
    $btn: '#forgot-password-section-block-btn',
    $form: '#forgot-password-section-block-form'
  },
  init: function() {
    if ($$(this.elements.$form).length > 0) {
      return this.validate = $$(this.elements.$form).validate({
        submitHandler: function(form) {
          $.ajax(_.extend(blocks.sections['forgot-password'].requests.send, {
            complete: function() {
              return $$(blocks.sections['forgot-password'].elements.$btn).loading('hide');
            },
            beforeSend: function() {
              return $$(blocks.sections['forgot-password'].elements.$btn).loading();
            },
            success: function(data) {
              if (data.status) {
                new Noty({
                  layout: 'bottomCenter',
                  text: data.statusText,
                  theme: 'bootstrap-v4',
                  type: 'success'
                }).show();
                return $$(blocks.sections['forgot-password'].elements.$btn).attr('disabled', true);
              } else {
                return blocks.sections['forgot-password'].validate.showErrors({
                  email_address: data.statusText
                });
              }
            },
            url: '/srv/service/customer/forgot-password/' + $$(form).serializeObject()['forgot-email'] + '/' + $$(form).serializeObject().security_code
          }));
          return false;
        }
      });
    }
  },
  requests: {
    send: {
      dataType: 'json',
      type: 'post'
    }
  }
});
