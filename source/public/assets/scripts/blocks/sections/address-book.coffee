define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-loading.min'
    'vendors/jquery-validate.min'
    'vendors/underscore.min'
  ]
  data:
    validate:
      submitHandler: (form) ->
        blocks.sections['address-book'].events.form form

        return false
  elements:
    $address_type_select: '#create-update-address-modal-address-type-select'
    $area: '#create-update-address-modal-area'
    $block: '#address-book-section-block'
    $btn_delete: '.btn-delete'
    $btn_edit: '.btn-edit'
    $btn_new: '.btn-new'
    $form: '#create-update-address-form'
    $modal: '#create-update-address-modal'
    $city_select: '#create-update-address-modal-city-select'
    $town_select: '#create-update-address-modal-town-select'
  events:
    btn_edit: -> $.ajax _.extend(
      blocks.sections['address-book'].requests.get_address
      url: '/srv/service/address/get/' + $$fresh(@).data('id') + '/1'
      success: (data) -> blocks.sections['address-book'].renders.modal(
        blocks.sections['address-book'].elements
        _.extend(data, blocks.sections['address-book'].data)
        blocks.sections['address-book'].events
        blocks.sections['address-book'].requests.get_towns
        (
          modal: blocks.sections['address-book'].templates.modal
          town_select: blocks.sections['address-book'].templates.town_select
        )
      )
    )
    btn_delete: -> $.ajax _.extend(
      blocks.sections['address-book'].requests.delete
      url: '/srv/service/address/delete/' + $$fresh(@).data('id')
    )
    btn_new: -> $.ajax _.extend(
      blocks.sections['address-book'].requests.get_address
      url: '/srv/service/address/get/0/1'
      success: (data) -> blocks.sections['address-book'].renders.modal(
        blocks.sections['address-book'].elements
        _.extend(data, blocks.sections['address-book'].data)
        blocks.sections['address-book'].events
        blocks.sections['address-book'].requests.get_towns
        (
          modal: blocks.sections['address-book'].templates.modal
          town_select: blocks.sections['address-book'].templates.town_select
        )
      )
    )
    address_type_select: ->
      if $$fresh(@).val() == '1'
        $$fresh(blocks.sections['address-book'].elements.$area).show()
      else
        $$fresh(blocks.sections['address-book'].elements.$area).hide()
    city_select: -> $.ajax _.extend(
      blocks.sections['address-book'].requests.get_towns
      url: '/srv/service/region/get-towns/' + $$fresh(@).val()
      success: (data) -> blocks.sections['address-book'].renders.town_select(
        blocks.sections['address-book'].elements.$town_select
        ($element) -> $$($element).removeAttr 'disabled'
        data
        blocks.sections['address-book'].templates.town_select
      )
    )
    form: (form) -> $.ajax $.extend(
      blocks.sections['address-book'].requests.save
      data: $(form).serializeArray()
      url: '/srv/service/address/save/' + $(form).data('id')
    )
  init: ->
    $$(@elements.$modal).detach().appendTo('body')

    $.ajax _.extend(
      @requests.get_addresses
      success: (data) -> blocks.sections['address-book'].renders.block(
        (elements) -> $$(elements.$block).loading 'hide'
        blocks.sections['address-book'].elements
        data
        blocks.sections['address-book'].events
        blocks.sections['address-book'].templates.block
      )
    )

    return
  renders:
    block: (
      after
      elements
      data
      events
      template
    ) ->
      $$(elements.$block).html soda(
        template
        data
      )

      $$fresh(elements.$btn_edit).click events.btn_edit

      $$fresh(elements.$btn_delete).click events.btn_delete

      $$fresh(elements.$btn_new).click events.btn_new

      after elements

      return
    modal: (
      elements
      data
      events
      request
      templates
    ) ->
      $$(elements.$modal).html soda(
        templates.modal
        data
      )

      $$fresh(elements.$city_select).val data.CITY_CODE

      if data.IS_COMPANY_ACTIVE
        $$fresh(elements.$address_type_select).val data.IS_COMPANY_ACTIVE

      $.ajax _.extend(
        request
        url: '/srv/service/region/get-towns/' + data.CITY_CODE
        success: (town_data) -> blocks.sections['address-book'].renders.town_select(
          elements.$town_select
          ($element) -> $$($element).val(data.TOWN_CODE).removeAttr 'disabled'
          town_data
          templates.town_select
        )
      )

      $$fresh(elements.$form).validate(data.validate)

      $$(elements.$city_select).on('change', events.city_select)

      $$fresh(elements.$address_type_select).on('change', events.address_type_select)

      $$(elements.$modal).modal()

      return
    town_select: (
      $element
      after
      data
      template
    ) ->
      $$fresh($element).html soda(
        template
        data
      )

      after $element

      return
  requests:
    delete:
      dataType: 'json'
      success: (data) ->
        new Noty(
          layout: 'bottomCenter'
          text: 'Seçmiş olduğunuz adres başarıyla silindi'
          theme: 'bootstrap-v4'
          type: 'success'
        ).show()

        blocks.sections['address-book'].init()
    get_addresses:
      dataType: 'json'
      url: '/srv/service/address/get-list'
    get_address: dataType: 'json'
    get_towns: dataType: 'json'
    save:
      dataType: 'json'
      type: 'post'
      success: (data) ->
        if (data.status)
          new Noty(
            layout: 'bottomCenter'
            text: 'Düzenlemiş olduğunuz adres başarıyla kaydedildi'
            theme: 'bootstrap-v4'
            type: 'success'
          ).show()

          $$fresh(blocks.sections['address-book'].elements.$modal).modal('hide')

          blocks.sections['address-book'].init()
  templates:
    block: $$('#address-book-section-block').html()
    modal: $$('#create-update-address-modal').html()
    town_select: '<option disabled="" selected="">İlçe seçiniz</option><option html-repeat="item in towns" value="{{item.code}}">{{item.title}}</option>'
)