define(['vendors/bootstrap-select.min', 'vendors/jquery-validate.min', 'vendors/underscore.min'], {
  data: {
    validate: {
      submitHandler: function(form) {
        blocks.sections.register.events.form(form);
        return false;
      }
    }
  },
  events: {
    form: function(form) {
      return $.ajax($.extend(blocks.sections.register.requests.save, {
        data: $(form).serializeArray()
      }));
    }
  },
  init: function() {
    if (this.data.is_logged) {
      $.ajax($.extend(blocks.sections.register.requests.get, {
        success: function(response) {
          return _.each(response, function(item, key) {
            return $('#register-section-block-form').find('[name="' + key + '"]').val(item);
          });
        }
      }, $('#register-section-block-form').on('change', function() {
        return $('#register-section-block-btn').removeAttr('disabled');
      })));
    }
    $('#register-section-block-form').find('select[multiple]').selectpicker({
      noneSelectedText: 'Seçiniz',
      iconBase: 'fa',
      showTick: true,
      tickIcon: 'fa-check'
    });
    return this.validate = $('#register-section-block-form').validate(this.data.validate);
  },
  requests: {
    get: {
      dataType: 'json',
      url: '/srv/service/customer/get-detail'
    },
    save: {
      beforeSend: function() {
        return $('#register-section-block-btn').loading();
      },
      complete: function() {
        return $('#register-section-block-btn').loading('hide');
      },
      dataType: 'json',
      success: function(data) {
        var obj;
        if (blocks.sections.register.data.is_logged) {
          new Noty({
            layout: 'bottomCenter',
            text: 'Üyelik bilgileriniz başarıyla güncellendi.',
            theme: 'bootstrap-v4',
            type: 'success'
          }).show();
          return $('#register-section-block-btn').attr('disabled', true);
        } else {
          if (data.status) {
            fbq('track', 'CompleteRegistration');
            new Noty({
              callbacks: {
                afterClose: function() {
                  return location.href = '/';
                }
              },
              layout: 'bottomCenter',
              text: data.statusText,
              theme: 'bootstrap-v4',
              type: 'success'
            }).show();
            return $('#register-section-block-btn').attr('disabled', true);
          } else {
            return blocks.sections.register.validate.showErrors((
              obj = {},
              obj["" + data.key] = data.statusText,
              obj
            ));
          }
        }
      },
      type: 'post',
      url: '/srv/service/customer/save'
    }
  }
});
