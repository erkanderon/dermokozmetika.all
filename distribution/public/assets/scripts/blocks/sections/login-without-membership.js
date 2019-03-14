define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-validate.min', 'vendors/underscore.min'], {
  elements: {
    $btn: '#login-without-membership-section-block-btn',
    $form: '#login-without-membership-section-block-form'
  },
  init: function() {
    return this.validate = $$(this.elements.$form).validate({
      submitHandler: function(form) {
        $.ajax(_.extend(blocks.sections['login-without-membership'].requests.login, {
          beforeSend: function() {
            return $$(blocks.sections['login-without-membership'].elements.$btn).loading();
          },
          complete: function() {
            return $$(blocks.sections['login-without-membership'].elements.$btn).loading('hide');
          },
          data: $$(form).serializeArray(),
          success: function(data) {
            var obj;
            if (data.status) {
              return location.href = data.url;
            } else {
              return blocks.sections['login-without-membership'].validate.showErrors((
                obj = {},
                obj["" + data.key] = data.statusText,
                obj
              ));
            }
          }
        }));
        return false;
      }
    });
  },
  requests: {
    login: {
      dataType: 'json',
      type: 'post',
      url: '/srv/service/customer/order-login'
    }
  }
});
