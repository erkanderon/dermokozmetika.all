define(
  [
    'vendors/jquery.$$.min'
    'vendors/jquery.min'
  ]
  elements: $menu: '#brand-categories-widget-block-menu'
  init: ->
    if URI().hasQuery 'category'
      $$ @elements.$menu
        .find '.menu-link'
        .each ->
          if (
            URI().query(true).category ==
                URI($$(@).attr 'href')
                  .query true
                  .category
          ) then $$(@).addClass 'active'
)