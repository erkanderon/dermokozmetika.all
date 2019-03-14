define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-loading.min'
    'vendors/jquery-validate.min'
    'vendors/underscore.min'
  ]
  elements:
    $block: '#newsletter-cover-block'
    $close: '#newsletter-cover-block .close'
    $btn: '#newsletter-cover-block .btn'
    $form: '#newsletter-cover-block form'
  events:
    close: ->
      $$(blocks.covers.newsletter.elements.$block).hide()
      $$('html').removeClass('has-newsletter-cover-block')
      document.cookie = 'subscription=true'
      return
    form: (form) ->
      $.ajax _.extend(
        blocks.covers.newsletter.requests.subscribe
        beforeSend: -> $$(blocks.covers.newsletter.elements.$btn).loading()
        complete: -> $$(blocks.covers.newsletter.elements.$btn).loading 'hide'
        data: $$(form).serializeObject()
        success: (res)->
          if res.status == 1
            new Noty(
              layout: 'bottomCenter'
              text: 'E-posta adresiniz başarıyla kaydedildi.'
              theme: 'bootstrap-v4'
              type: 'success'
            ).show()
          else
            new Noty(
              layout: 'bottomCenter'
              text: 'E-posta adresiniz başarıyla kaydedilmedi.'
              theme: 'bootstrap-v4'
              type: 'error'
            ).show()
          $$(blocks.covers.newsletter.elements.$close).trigger('click')
      )
      return false
  getCookie: (cname) ->
    name = cname + '='
    decodedCookie = decodeURIComponent(document.cookie)
    ca = decodedCookie.split(';')
    i = 0
    while i < ca.length
      c = ca[i]
      while c.charAt(0) == ' '
        c = c.substring(1)
      if c.indexOf(name) == 0
        return c.substring(name.length, c.length)
      i++
    ''
  init: ->
    if @getCookie('subscription') == ''
      $$(@elements.$block).show()
      $$(@elements.$close).on('click', @events.close)
      $$(@elements.$form).validate submitHandler: blocks.covers.newsletter.events.form
    else
      $$('html').removeClass('has-newsletter-cover-block');
    return
  requests:
    subscribe:
      dataType: 'json'
      type: 'post'
      url: '/srv/service/guest/subscribeNewsletter'
)