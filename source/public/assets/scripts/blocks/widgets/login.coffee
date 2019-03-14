define(
  [
    'vendors/bootstrap-show-password.min'
    'vendors/i18next.min'
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-loading.min'
    'vendors/jquery-validate.min'
    'vendors/underscore.min'
  ]
  data:
    password:
      eyeClass: 'fa'
      eyeCloseClass: 'fa-eye-slash'
      eyeOpenClass: 'fa-eye'
  elements:
    $a: '#login-widget-block-a'
    $btn: '#login-widget-block-btn'
    $div: '#login-widget-block-div'
    $form: '#login-widget-block-form'
    $input: '#login-widget-block-password-input'
  events:
    a: (event) ->
      event.preventDefault();

      $.ajax _.extend(
        blocks.widgets.login.requests.logout
        beforeSend: -> $$(blocks.widgets.login.elements.$a).loading()
        success: -> location.reload()
      )

      return
  init: ->
    if $$(@elements.$div).length > 0
      @renders.div(
        (elements) -> $$(elements.$div).loading 'hide'
        (
          firstname: MEMBER_INFO.FIRST_NAME
          lastname: MEMBER_INFO.LAST_NAME
          title: MEMBER_INFO.GENDER == 'E' && $.t 'mr' || $.t 'mrs'
        )
        (
          $a: @elements.$a
          $div: @elements.$div
        )
        @events.a
        @templates.div
      )

    if $$(@elements.$form).length > 0
      @validate = $$(@elements.$form).validate submitHandler: (form) ->
        $.ajax _.extend(
          blocks.widgets.login.requests.login
          beforeSend: -> $$(blocks.widgets.login.elements.$btn).loading()
          data: $$(form).serializeArray()
          success: (data) ->
            if data.status
              fbq('trackCustom', 'UserData',
                customer_id: data.customer_id
                gender: ''
              )

              location.href = data.url
            else
              blocks.widgets.login.validate.showErrors email_address: data.statusText
              $$(blocks.widgets.login.elements.$btn).loading 'hide'
          url: '/srv/service/customer/login/' + $$(form).serializeObject().email_address
        )

        return

      $$(@elements.$input).password @data.password

    return
  renders:
    div: (
      after
      data
      elements
      event
      template
    ) ->
      $$(elements.$div)
        .html soda(
          template
          data
        )
        .find(elements.$a)
        .on(
          'click'
          event
        )

      after elements

      return
  requests:
    login:
      dataType: 'json'
      type: 'post'
    logout: url: '/srv/service/customer/logout'
  templates: div: $$('#login-widget-block-div').html()
)