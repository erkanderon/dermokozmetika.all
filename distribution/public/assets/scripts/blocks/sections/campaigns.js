define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min', 'vendors/underscore.min'], {
  elements: {
    $btn: '.campaigns-section-block-btn'
  },
  events: {
    btn: function() {
      var self;
      self = this;
      $.ajax(_.extend(blocks.sections.campaigns.requests.set_campaign, {
        beforeSend: function() {
          return $$(self).loading();
        },
        complete: function() {
          return $$(self).loading('hide');
        },
        success: function(data) {
          if (data.status) {
            return new Noty({
              layout: 'center',
              text: data.statusText,
              theme: 'bootstrap-v4',
              type: 'success'
            }).show();
          } else {
            return new Noty({
              layout: 'center',
              text: data.statusText,
              theme: 'bootstrap-v4',
              type: 'error'
            }).show();
          }
        },
        url: '/conn/CampaignV2/Campaign/selectCampaign/' + $$fresh(this).data('group') + '/' + $$(this).data('id')
      }));
    }
  },
  init: function() {
    return $$(this.elements.$btn).on('click', this.events.btn);
  },
  requests: {
    set_campaign: {
      dataType: 'json'
    }
  }
});
