define(['vendors/bootstrap-show-password.min', 'vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/jquery-validate.min'], {
  data: {
    password: {
      eyeClass: 'fa',
      eyeCloseClass: 'fa-eye-slash',
      eyeOpenClass: 'fa-eye'
    }
  },
  elements: {
    $btn: '#change-password-section-block-btn',
    $current_password_input: '#change-password-section-block-current-password-input',
    $form: '#change-password-section-block-form',
    $new_password_input: '#change-password-section-block-new-password-input',
    $repeat_new_password_input: '#change-password-section-block-repeat-new-password-input'
  },
  events: {
    form: function(data) {
      $.ajax($.extend(blocks.sections['change-password'].requests.update_password, {
        beforeSend: function() {
          return $$(blocks.sections['change-password'].elements.$btn).loading();
        },
        complete: function() {
          return $$(blocks.sections['change-password'].elements.$btn).loading('hide');
        },
        data: $$(data).serializeArray(),
        success: function(data) {
          if (data.status) {
            new Noty({
              layout: 'bottomCenter',
              text: data.statusText,
              theme: 'bootstrap-v4',
              type: 'success'
            }).show();
            return $$(blocks.sections['change-password'].elements.$btn).attr('disabled', true);
          } else {
            return blocks.sections['change-password'].validate.showErrors({
              password_old: data.statusText
            });
          }
        }
      }));
      return false;
    }
  },
  init: function() {
    this.validate = $$(this.elements.$form).validate({
      rules: {
        password_new_again: {
          equalTo: $$(this.elements.$new_password_input)
        }
      },
      submitHandler: this.events.form
    });
    $$([this.elements.$current_password_input, this.elements.$new_password_input, this.elements.$repeat_new_password_input]).password(this.data.password);
  },
  requests: {
    update_password: {
      dataType: 'json',
      type: 'post',
      url: '/srv/service/customer/change-password'
    }
  }
});
