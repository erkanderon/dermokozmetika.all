define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-loading.min'
    'vendors/jquery-swiper.min'
    'vendors/underscore.min'
  ]
  data:
    swiper:
      autoHeight: true
      autoplay: 3000
      lazyLoading: true
      loop: true
      onlyExternal: false
      preloadImages: false
  elements: $swiper: ''
  init: -> $.ajax _.extend(
      @requests.get
      success: (data) -> blocks.sections['brand-campaigns'].renders.block(
        () -> $$('#brand-campaigns-section-block').loading 'hide'
        data
      )
      url: @requests.get.url + blocks.sections['brand-campaigns'].data.id
    )
  renders:
    block: (after, data) ->
      $$ '#brand-campaigns-section-block'
        .replaceWith soda(
          blocks.sections['brand-campaigns'].templates.block
          data
        )

      $$fresh '#brand-campaigns-section-block'
        .find '.swiper-container'
        .swiper blocks.sections['brand-campaigns'].data.swiper

      after()

      return
  requests:
    get:
      dataType: 'json'
      url: '/srv/campaign-v2/campaign/get-list-by-type/brand/'
  templates: block: $$('#brand-campaigns-section-block')[0].outerHTML
)