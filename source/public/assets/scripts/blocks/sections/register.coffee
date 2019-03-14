define(
  [
    'vendors/bootstrap-select.min'
    'vendors/jquery-validate.min'
    'vendors/underscore.min'
  ]
  data:
    validate:
      submitHandler: (form) ->
        blocks.sections.register.events.form form

        return false
  events:
    form: (form) -> $.ajax $.extend(
      blocks.sections.register.requests.save
      data: $(form).serializeArray()
    )
  init: ->
    if @data.is_logged
      $.ajax $.extend(
        blocks.sections.register.requests.get
        success: (response) ->
          _.each(
            response
            (
              item
              key
            ) ->
              $('#register-section-block-form')
                .find('[name="' + key + '"]')
                .val item;
          )

        $('#register-section-block-form').on(
          'change'
          -> $('#register-section-block-btn').removeAttr('disabled')
        )
      )

    $('#register-section-block-form').find('select[multiple]').selectpicker(
      noneSelectedText: 'Seçiniz'
      iconBase: 'fa'
      showTick: true
      tickIcon: 'fa-check'
    );


    @validate = $('#register-section-block-form').validate(@data.validate)
  requests:
    get:
      dataType: 'json'
      url: '/srv/service/customer/get-detail'
    save:
      beforeSend: -> $('#register-section-block-btn').loading()
      complete: -> $('#register-section-block-btn').loading 'hide'
      dataType: 'json'
      success: (data) ->
        if blocks.sections.register.data.is_logged
          new Noty(
            layout: 'bottomCenter'
            text: 'Üyelik bilgileriniz başarıyla güncellendi.'
            theme: 'bootstrap-v4'
            type: 'success'
          ).show()

          $('#register-section-block-btn').attr 'disabled', true
        else
          if data.status
            fbq('track', 'CompleteRegistration')

            new Noty(
              callbacks: afterClose: ->
                location.href = '/'
              layout: 'bottomCenter'
              text: data.statusText
              theme: 'bootstrap-v4'
              type: 'success'
            ).show()

            $('#register-section-block-btn').attr 'disabled', true
          else
            blocks.sections.register.validate.showErrors "#{data.key}": data.statusText
      type: 'post'
      url: '/srv/service/customer/save'
)