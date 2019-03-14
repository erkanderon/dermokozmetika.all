define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-validate.min'
    'vendors/underscore.min'
  ]
  elements:
    $btn: '#login-without-membership-section-block-btn'
    $form: '#login-without-membership-section-block-form'
  init: ->
    @validate = $$(@elements.$form).validate submitHandler: (form) ->
      $.ajax _.extend(
        blocks.sections['login-without-membership'].requests.login
        beforeSend: -> $$(blocks.sections['login-without-membership'].elements.$btn).loading()
        complete: -> $$(blocks.sections['login-without-membership'].elements.$btn).loading 'hide'
        data: $$(form).serializeArray()
        success: (data) ->
          if data.status then location.href = data.url
          else blocks.sections['login-without-membership'].validate.showErrors "#{data.key}": data.statusText
      )

      return false
  requests:
    login:
      dataType: 'json'
      type: 'post'
      url: '/srv/service/customer/order-login'
)