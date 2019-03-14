define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-loading.min'
    'vendors/jquery-validate.min'
  ]
  elements:
    $btn: '#remittance-form-section-block-btn'
    $form: '#remittance-form-section-block-form'
  events:
    form: (data) ->
      $.ajax $.extend(
        blocks.sections['remittance-form'].requests.send
        beforeSend: -> $$(blocks.sections['remittance-form'].elements.$btn).loading()
        complete: -> $$(blocks.sections['remittance-form'].elements.$btn).loading 'hide'
        data: $$(data).serializeArray()
        success: ->
          new Noty(
            callbacks: afterClose: -> location.reload()
            layout: 'bottomCenter'
            text: 'Havale bildiriminiz başarıyla kaydedildi.'
            theme: 'bootstrap-v4'
            type: 'success'
          ).show()

          $$(blocks.sections['remittance-form'].elements.$btn).attr(
            'disabled'
            true
          )
      )

      return false
  init: -> @validate = $$(@elements.$form).validate submitHandler: @events.form
  requests:
    send:
      dataType: 'json'
      type: 'post'
      url: '/conn/RemittanceForm/saveRemittanceForm'
)