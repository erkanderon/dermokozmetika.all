define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/jquery-validate.min', 'vendors/underscore.min'], {
  elements: {
    $block: '#main-footer-cover-block',
    $btn: '#main-footer-cover-block-btn',
    $form: '#main-footer-cover-block-form'
  },
  events: {
    window: function() {
      if ($$('body').height() < $$('html').height()) {
        return $$(blocks.covers['main-footer'].elements.$block).addClass('fixed-block');
      } else {
        return $$(blocks.covers['main-footer'].elements.$block).removeClass('fixed-block');
      }
    },
    form: function(form) {
      $.ajax(_.extend(blocks.covers['main-footer'].requests.subscribe, {
        beforeSend: function() {
          return $$(blocks.covers['main-footer'].elements.$btn).loading();
        },
        complete: function() {
          return $$(blocks.covers['main-footer'].elements.$btn).loading('hide');
        },
        data: $$(form).serializeObject(),
        success: function(res) {
          fbq('track', 'Lead');
          if (res.status === 1) {
            $$(blocks.covers['main-footer'].elements.$btn).attr('disabled', true);
            return new Noty({
              layout: 'bottomCenter',
              text: 'E-posta adresiniz başarıyla kaydedildi.',
              theme: 'bootstrap-v4',
              type: 'success'
            }).show();
          } else {
            return new Noty({
              layout: 'bottomCenter',
              text: 'Bu e-posta adresi kullanılamaz. Lütfen başka bir e-posta adresi deneyiniz.',
              theme: 'bootstrap-v4',
              type: 'error'
            }).show();
          }
        }
      }));
      return false;
    }
  },
  init: function() {
    $$(window).on('resize', this.events.window).trigger('resize');
    $$(this.elements.$form).validate({
      submitHandler: blocks.covers['main-footer'].events.form
    });
  },
  requests: {
    subscribe: {
      dataType: 'json',
      type: 'post',
      url: '/srv/service/guest/subscribeNewsletter'
    }
  }
});
