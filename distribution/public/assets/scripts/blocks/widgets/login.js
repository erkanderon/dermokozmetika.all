define(['vendors/bootstrap-show-password.min', 'vendors/i18next.min', 'vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/jquery-validate.min', 'vendors/underscore.min'], {
  data: {
    password: {
      eyeClass: 'fa',
      eyeCloseClass: 'fa-eye-slash',
      eyeOpenClass: 'fa-eye'
    }
  },
  elements: {
    $a: '#login-widget-block-a',
    $btn: '#login-widget-block-btn',
    $div: '#login-widget-block-div',
    $form: '#login-widget-block-form',
    $input: '#login-widget-block-password-input'
  },
  events: {
    a: function(event) {
      event.preventDefault();
      $.ajax(_.extend(blocks.widgets.login.requests.logout, {
        beforeSend: function() {
          return $$(blocks.widgets.login.elements.$a).loading();
        },
        success: function() {
          return location.reload();
        }
      }));
    }
  },
  init: function() {
    if ($$(this.elements.$div).length > 0) {
      this.renders.div(function(elements) {
        return $$(elements.$div).loading('hide');
      }, {
        firstname: MEMBER_INFO.FIRST_NAME,
        lastname: MEMBER_INFO.LAST_NAME,
        title: MEMBER_INFO.GENDER === 'E' && $.t('mr' || $.t('mrs'))
      }, {
        $a: this.elements.$a,
        $div: this.elements.$div
      }, this.events.a, this.templates.div);
    }
    if ($$(this.elements.$form).length > 0) {
      this.validate = $$(this.elements.$form).validate({
        submitHandler: function(form) {
          $.ajax(_.extend(blocks.widgets.login.requests.login, {
            beforeSend: function() {
              return $$(blocks.widgets.login.elements.$btn).loading();
            },
            data: $$(form).serializeArray(),
            success: function(data) {
              if (data.status) {
                fbq('trackCustom', 'UserData', {
                  customer_id: data.customer_id,
                  gender: ''
                });
                return location.href = data.url;
              } else {
                blocks.widgets.login.validate.showErrors({
                  email_address: data.statusText
                });
                return $$(blocks.widgets.login.elements.$btn).loading('hide');
              }
            },
            url: '/srv/service/customer/login/' + $$(form).serializeObject().email_address
          }));
        }
      });
      $$(this.elements.$input).password(this.data.password);
    }
  },
  renders: {
    div: function(after, data, elements, event, template) {
      $$(elements.$div).html(soda(template, data)).find(elements.$a).on('click', event);
      after(elements);
    }
  },
  requests: {
    login: {
      dataType: 'json',
      type: 'post'
    },
    logout: {
      url: '/srv/service/customer/logout'
    }
  },
  templates: {
    div: $$('#login-widget-block-div').html()
  }
});
