define(['vendors/jquery.$$.min', 'vendors/jquery.min', 'vendors/jquery-loading.min'], {
  elements: {
    $area: '.brand-list-section-block-area',
    $link: '.brand-list-section-block-link',
    $row: '#brand-list-section-block-row'
  },
  init: function() {
    $$(this.elements.$area).each(function() {
      if ($$fresh(this).find(blocks.sections['brand-list'].elements.$link).length === 0) {
        return $$(this).remove();
      }
    });
    $$(this.elements.$row).loading('hide');
    if (URI().hasQuery('letter')) {
      $('body, html').animate({
        'scrollTop': $('#brand-list-section-block .block-content:nth-child(2)').offset().top
      }, 300);
    }
  }
});
