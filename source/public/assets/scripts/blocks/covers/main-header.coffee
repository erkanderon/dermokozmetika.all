define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
    'vendors/jquery-mmenu-all.min'
    'vendors/jquery-swiper.min'
    'vendors/jquery-validate.min'
    'vendors/underscore.min'
  ]
  data:
    account_mmenu:
      autoHeight: true
      dropdown: true
      extensions: [
        'pagedim-black'
      ]
    menu_mmenu:
      dividers:
        add: true
        addTo: '#main-header-cover-block-mm-listview'
        fixed: true
      keyboardNavigation:
        enable: true
        enhance: true
      searchfield:
        add: true
        addTo: '#main-header-cover-block-mm-listview'
        noResults: 'Herhangi bir marka bulunamadı.'
        placeholder: $.t 'search-a-brand'
      setSelected:
        hover: true
        parent: true
    search_mmenu:
      autoHeight: true
      extensions: [
        'pagedim-black'
        'theme-dark'
      ]
      navbar: add: false
      offCanvas:
        position: 'top'
        zposition: 'top'
    swiper:
      autoplay: 2500
      effect: 'fade'
      loop: true
      onlyExternal: true
    validate:
      messages: q: null
  elements:
    $account_mm_menu: '#main-header-cover-block-account-mm-menu'
    $area: '#main-header-cover-block-area'
    $form: '.main-header-cover-block-form'
    $menu_mm_menu: '#main-header-cover-block-menu-mm-menu'
    $search_mm_menu: '#main-header-cover-block-search-mm-menu'
    $swiper: '#main-header-cover-block-swiper'
  init: ->
    $$ @elements.$swiper
      .find '.swiper-container'
      .swiper @data.swiper

    $$(@elements.$form).validate @data.validate
    $$(@elements.$area).text SEPET_MIKTAR

    $$(@elements.$menu_mm_menu).mmenu _.extend(
      @data.menu_mmenu
      if $$(window).width() >= config.vendors.bootstrap['grid-breakpoints'].lg then (
        columns:
          add: true
          visible: max: 2
        extensions: [
          'border-none'
          'shadow-page'
          'shadow-panels'
          'theme-white'
        ]
        navbars: [
          content: ['prev', 'breadcrumbs']
          position: 'top'
        ]
        offCanvas: zposition: 'front'
      ) else (
        iconPanels: true
        extensions: [
          'pagedim-black'
          'theme-white'
        ]
      )
    )

    $$(@elements.$account_mm_menu).mmenu @data.account_mmenu
    $$(@elements.$search_mm_menu).mmenu @data.search_mmenu

    return
)