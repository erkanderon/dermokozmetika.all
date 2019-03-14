define({
  events: function() {
    location.href = URI().setQuery('sort', $(this).val()).readable();
  },
  hooks: {
    init: {
      before: function() {
        if (blocks.covers['page-title']) {
          blocks.covers['page-title'].data.title = blocks.sections['catalog'].data.title;
        }
        if (blocks.sections['page-title']) {
          blocks.sections['page-title'].data.title = blocks.sections['catalog'].data.title;
        }
        if (blocks.widgets['page-title']) {
          blocks.widgets['page-title'].data.title = blocks.sections['catalog'].data.title;
        }
      }
    }
  },
  init: function() {
    $('#catalog-section-block-select').on('change', this.events);
    $('#catalog-section-block-pagination').find('.first, .last').remove();
    $('#catalog-section-block-pagination').find('a, span').addClass('page-link').wrap('<li class="page-item"></li>');
    $('#catalog-section-block-pagination').find('.next').html('<span class="fa fa-caret-right"></span>');
    $('#catalog-section-block-pagination').find('a.passive, span.passive').parent('.page-item').addClass('disabled');
    $('#catalog-section-block-pagination').find('.prev').html('<span class="fa fa-caret-left"></span>');
    $('#catalog-section-block-pagination').find('span.page-link').parent('.page-item').addClass('active');
    $('#catalog-section-block-button').on('click', function() {
      return $('html, body').animate({
        scrollTop: 0
      }, 300);
    });
  }
});
