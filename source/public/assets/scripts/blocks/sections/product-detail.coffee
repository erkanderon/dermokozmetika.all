define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-loading.min'
    'vendors/jquery-swiper.min'
    'vendors/jquery-validate.min'
    'vendors/underscore.min'
  ]
  data:
    swiper:
      autoHeight: true
      lazyLoading: true
      onlyExternal: false
      observer: true
      observeParents: true
      preloadImages: false
  elements:
    $campaigns_area: '#product-detail-section-block-campaigns-area'
    $comments_area: '#product-detail-section-block-comments-area'
    $form: '#product-detail-section-block-form'
    $form2: '#product-detail-section-block-2-form'
    $gifts_swiper: '#product-detail-section-block-gifts-swiper'
    $offers_and_vouchers_swiper: '#product-detail-section-block-offers-and-vouchers-swiper'
  events:
    form: (event) ->
      event.preventDefault()

      $.ajax _.extend(
        blocks.sections['product-detail'].requests.add_to_cart
        data: $$(this).serializeArray()
        success: (data) ->
          if (data.status)
            fbq 'track', 'AddToCart',
              content_ids: [ data.addedProduct.id ]
              content_type: 'product'
              value: data.addedProduct.price
              currency: 'TRY'

            gtag 'event', 'add_to_cart',
              ecomm_pagetype: 'cart'
              ecomm_prodid: [ data.addedProduct.sku ]
              ecomm_totalvalue: data.addedProduct.price
              isMember: MEMBER_INFO.ID != 0
              gender: MEMBER_INFO.GENDER

            $$('#product-detail-section-block-add-to-cart-modal').modal()
            $$fresh('.modal-backdrop').detach().appendTo '.mm-page'
            $$('#main-header-cover-block-area').text data.totalQuantity
          else
            alert data.statusText.replace(/<(?:.|\n)*?>/gm, '')
      )
  init: ->
    $('.ribbon-clickable').on(
      'click'
      ->
        $('body, html').animate(
          'scrollTop': $('#product-detail-section-block-campaigns-area').offset().top - 64
          300
        )

        if $(this).hasClass('ribbon-outline-success')
          $('a[href="#product-detail-section-block-gifts-tab"]').trigger('click')
        else
          $('a[href="#product-detail-section-block-offers-and-vouchers-tab"]').trigger('click')
    )

    $.ajax _.extend(
      @requests.get_campaigns
      success: (data) -> blocks.sections['product-detail'].renders.campaigns_area(
        (elements) -> $$fresh(elements.$campaigns_area).loading 'hide'
        data
        $campaigns_area: blocks.sections['product-detail'].elements.$campaigns_area
        $gifts_swiper: blocks.sections['product-detail'].elements.$gifts_swiper
        $offers_and_vouchers_swiper: blocks.sections['product-detail'].elements.$offers_and_vouchers_swiper
        blocks.sections['product-detail'].data.swiper
        blocks.sections['product-detail'].templates.campaigns_area
      )
      url: '/srv/campaign-v2/campaign/get-list-by-type/product/' + blocks.sections['product-detail'].data.id
    )

    $$(@elements.$form).on(
      'submit'
      @events.form
    )

    $$(@elements.$form2).validate()

    $.ajax _.extend(
      @requests.get_comments
      success: (data) -> blocks.sections['product-detail'].renders.comments_area(
        blocks.sections['product-detail'].elements.$comments_area
        ($element) -> $$($element).loading 'hide'
        data
      )
      url: '/srv/service/product-detail/comments/' + blocks.sections['product-detail'].data.id
    )

    return
  renders:
    campaigns_area: (
      after
      data
      elements
      swiper
      template
    ) ->
      $$(elements.$campaigns_area).replaceWith soda(
        template
        data
      )

      if data.CAMPAIGN_LIST
        if data.CAMPAIGN_LIST.length > 1
          offers_and_vouchers_swiper = $$ elements.$offers_and_vouchers_swiper
            .find '.swiper-container'
            .swiper _.extend(
              swiper
              autoplay: 3000
              loop: true
              pagination: elements.$offers_and_vouchers_swiper + ' .swiper-pagination'
              paginationClickable: true
            )
        else
          offers_and_vouchers_swiper = $$ elements.$offers_and_vouchers_swiper
            .find '.swiper-container'
            .swiper swiper

        offers_and_vouchers_swiper.container.hover(
          offers_and_vouchers_swiper.stopAutoplay
          offers_and_vouchers_swiper.startAutoplay
        )

      gifts_swiper = $$ elements.$gifts_swiper
        .find '.swiper-container'
        .swiper _.extend(
          swiper
          autoplay: 3000
          loop: true
          pagination: elements.$gifts_swiper + ' .swiper-pagination'
          paginationClickable: true
        )

      gifts_swiper.container.hover(
        gifts_swiper.stopAutoplay
        gifts_swiper.startAutoplay
      )

      $$fresh(elements.$campaigns_area)
        .find('[data-toggle="popover"]')
        .popover trigger: 'hover'

      after elements

      return
    comments_area: (
      $element
      after
      data
      template
    ) ->
      if typeof template == 'undefined' then blocks.sections['product-detail'].templates.comments_area = template = $.ajax(blocks.sections['product-detail'].requests.get_template).responseText

      $$($element).html soda(
        template
        data
      )

      $$('#product-detail-section-block-3-form').validate submitHandler: (form) ->
        $.ajax(
          beforeSend: -> $$('#product-detail-section-block-3-form').find('.btn').loading()
          complete: -> $$('#product-detail-section-block-3-form').find('.btn').loading 'hide'
          data: $(form).serializeArray()
          dataType: 'json'
          url: '/srv/service/product-detail/comment/' + blocks.sections['product-detail'].data.id
          success: (response) ->
            if (response.status)
              new Noty(
                layout: 'bottomCenter'
                text: 'Yorumunuz başarıyla kaydedildi. Onaylandıktan sonra işleme alınacaktır.'
                theme: 'bootstrap-v4'
                type: 'success'
              ).show()

              $$('#product-detail-section-block-3-form').find('.btn').attr('disabled', true)
          type: 'post'
        )

        return

      after $element

      return
  requests:
    add_to_cart:
      dataType: 'json'
      type: 'POST'
      url: '/srv/service/cart/add-to-cart'
    get_campaigns: dataType: 'json'
    get_comments: dataType: 'json'
    get_template:
      async: false
      url: '/srv/service/content/get/1004/comment'
  templates: campaigns_area: $$('#product-detail-section-block-campaigns-area')[0].outerHTML
)