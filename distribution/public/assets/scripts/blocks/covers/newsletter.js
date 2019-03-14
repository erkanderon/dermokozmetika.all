define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/jquery-validate.min', 'vendors/underscore.min'], {
  elements: {
    $block: '#newsletter-cover-block',
    $close: '#newsletter-cover-block .close',
    $btn: '#newsletter-cover-block .btn',
    $form: '#newsletter-cover-block form'
  },
  events: {
    close: function() {
      $$(blocks.covers.newsletter.elements.$block).hide();
      $$('html').removeClass('has-newsletter-cover-block');
      document.cookie = 'subscription=true';
    },
    form: function(form) {
      $.ajax(_.extend(blocks.covers.newsletter.requests.subscribe, {
        beforeSend: function() {
          return $$(blocks.covers.newsletter.elements.$btn).loading();
        },
        complete: function() {
          return $$(blocks.covers.newsletter.elements.$btn).loading('hide');
        },
        data: $$(form).serializeObject(),
        success: function() {
          new Noty({
            layout: 'bottomCenter',
            text: 'E-posta adresiniz başarıyla kaydedildi.',
            theme: 'bootstrap-v4',
            type: 'success'
          }).show();
          return $$(blocks.covers.newsletter.elements.$close).trigger('click');
        }
      }));
      return false;
    }
  },
  getCookie: function(cname) {
    var c, ca, decodedCookie, i, name;
    name = cname + '=';
    decodedCookie = decodeURIComponent(document.cookie);
    ca = decodedCookie.split(';');
    i = 0;
    while (i < ca.length) {
      c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
      i++;
    }
    return '';
  },
  init: function() {
    if (this.getCookie('subscription') === '') {
      $$(this.elements.$block).show();
      $$(this.elements.$close).on('click', this.events.close);
      $$(this.elements.$form).validate({
        submitHandler: blocks.covers.newsletter.events.form
      });
    } else {
      $$('html').removeClass('has-newsletter-cover-block');
    }
  },
  requests: {
    subscribe: {
      dataType: 'json',
      type: 'post',
      url: '/srv/service/guest/subscribeNewsletter'
    }
  }
});
