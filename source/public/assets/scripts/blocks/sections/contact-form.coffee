define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-loading.min'
    'vendors/jquery-validate.min'
  ]
  elements:
    $btn: '#contact-form-section-block-btn'
    $form: '#contact-form-section-block-form'
  init: ->
    $$(@elements.$form).validate submitHandler: (form) ->
      $.ajax _.extend(
        blocks.sections['contact-form'].requests.send
        complete: -> $$(blocks.sections['contact-form'].elements.$btn).loading 'hide'
        beforeSend: -> $$(blocks.sections['contact-form'].elements.$btn).loading()
        data: $$(form).serializeArray()
        success: (data) ->
          if data.success
            new Noty(
              layout: 'bottomCenter'
              text: 'Teşekkürler. Mesajınız başarıyla gönderildi.'
              theme: 'bootstrap-v4'
              type: 'success'
            ).show()

            $$(blocks.sections['contact-form'].elements.$btn).attr(
              'disabled'
              true
            )
      )

      return false
  requests:
    send:
      dataType: 'json'
      type: 'post'
      url: '/srv/service/guest/sendContactMessage'
)