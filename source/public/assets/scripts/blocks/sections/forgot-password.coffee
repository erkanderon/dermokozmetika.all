define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-loading.min'
    'vendors/jquery-validate.min'
    'vendors/underscore.min'
  ]
  elements:
    $btn: '#forgot-password-section-block-btn'
    $form: '#forgot-password-section-block-form'
  init: ->
    if $$(@elements.$form).length > 0
      @validate = $$(@elements.$form).validate submitHandler: (form) ->
        $.ajax _.extend(
          blocks.sections['forgot-password'].requests.send
          complete: -> $$(blocks.sections['forgot-password'].elements.$btn).loading 'hide'
          beforeSend: -> $$(blocks.sections['forgot-password'].elements.$btn).loading()
          success: (data) ->
            if data.status
              new Noty(
                layout: 'bottomCenter'
                text: data.statusText
                theme: 'bootstrap-v4'
                type: 'success'
              ).show()

              $$(blocks.sections['forgot-password'].elements.$btn).attr(
                'disabled'
                true
              )
            else
              blocks.sections['forgot-password'].validate.showErrors email_address: data.statusText
          url: '/srv/service/customer/forgot-password/' + $$(form).serializeObject()['forgot-email'] + '/' + $$(form).serializeObject().security_code
        )

        return false
  requests:
    send:
      dataType: 'json'
      type: 'post'
)