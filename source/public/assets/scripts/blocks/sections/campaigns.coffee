define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-loading.min'
    'vendors/underscore.min'
  ]
  (
    elements: $btn: '.campaigns-section-block-btn'
    events:
      btn: ->
        self = this;

        $.ajax _.extend(
          blocks.sections.campaigns.requests.set_campaign
          beforeSend: -> $$(self).loading()
          complete: -> $$(self).loading 'hide'
          success: (data) ->
            if data.status then new Noty(
              layout: 'center'
              text: data.statusText
              theme: 'bootstrap-v4'
              type: 'success'
            ).show()
            else new Noty(
              layout: 'center'
              text: data.statusText
              theme: 'bootstrap-v4'
              type: 'error'
            ).show()
          url: '/conn/CampaignV2/Campaign/selectCampaign/' + $$fresh(this).data('group') + '/' + $$(this).data('id')
        )

        return
    init: -> $$(@elements.$btn).on(
      'click'
      @events.btn
    )
    requests:
      set_campaign: dataType: 'json'
  )
)