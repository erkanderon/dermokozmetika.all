if (location.href.search('/order/') == -1) {
	var blocks = {
		covers: {},
		sections: {},
		widgets: {}
	},
	config = {
		currencies: {
			USD: {
				name: 'United States Dollar',
				position: 'left',
				symbol: '$'
			}
		},
		currency: 'USD'
	};

	var modals = [];

requirejs.config({
	baseUrl: '//assets.dermokozmetika.com.tr/scripts',
	paths: {
		json: 'vendors/require-json.min',
		text: 'vendors/require-text.min',
	},
	waitSeconds: 0,
	shim: {
		'vendors/bootstrap.min': {
			deps: ['vendors/jquery.min']
		},
		'vendors/bootstrap-show-password.min': {
			deps: ['vendors/bootstrap.min']
		},
		'vendors/bootstrap-slider.min': {
			deps: ['vendors/bootstrap.min']
		},
		'vendors/clipboard.min': {
			deps: ['vendors/jquery.min']
		},
		'vendors/jquery-elevatezoom.min': {
			deps: ['vendors/jquery.min']
		},
		'vendors/jquery-gmap3.min': {
			deps: ['//maps.google.com/maps/api/js?key=AIzaSyB2lS5UqaeNacZh9JcXzj8FVoXl59Eeh4M', 'vendors/jquery.min']
		},
		'vendors/jquery-hideseek.min': {
			deps: ['vendors/jquery.min']
		},
		'vendors/jquery-lazyload.min': {
			deps: ['vendors/jquery.min']
		},
		'vendors/jquery-mmenu-all.min': {
			deps: ['vendors/jquery.min']
		},
		'vendors/jquery-perfect_scrollbar.min': {
			deps: ['vendors/jquery.min']
		},
		'vendors/jquery-swiper.min': {
			deps: ['vendors/jquery.min']
		},
		'vendors/jquery-validate.min': {
			deps: ['vendors/jquery.min']
		},
		'vendors/i18next.min': {
			deps: ['vendors/jquery.min']
		},
		'vendors/jquery-loading.min': {
			deps: ['vendors/jquery.min']
		},
		'vendors/jquery.$$.min': {
			deps: ['vendors/jquery.min']
		},
        'vendors/readmore.min': {
            deps: ['vendors/jquery.min']
        }
	}
});

soda.filter('toLowerCase', function(input) {
	return input.toLowerCase();
});

soda.filter('toFixed', function(input, digits) {
	return parseFloat(input).toFixed(digits);
});

require(['json!config.min.json', 'vendors/jquery.$$.min', 'vendors/bootstrap.min', 'vendors/jquery-loading.min','vendors/i18next.min', 'vendors/jquery-validate.min'], function(data) {
	$.fn.serializeObject = function() {
		"use strict";
		var a = {},
			b = function(b, c) {
				var d = a[c.name];
				"undefined" != typeof d && d !== null ? $.isArray(d) ? d.push(c.value) : a[c.name] = [d, c.value] : a[c.name] = c.value ;
			};

		return $.each(this.serializeArray(), b), a;
	};

	$.fn.loading.defaults.text = null;

	$('html').addClass('page-' + LANGUAGE);

	$('.load')
		.loading()
		.removeClass('load');



	$(document).on('click', '[data-toggle="modal"]', function (event) {
		$('.modal-backdrop').detach().appendTo('.mm-page');

		if (href = $(this).attr('href')) {
			if ($('.modal[data-href="' + href + '"]').length == 0)
				require(['text!' + $(this).attr('href')], function (dom) {
					$dom = $(dom);
					
					$dom.find('.tsoftTemplate').remove();
					
					$dom = $($dom).i18n();

					if ($dom.attr('id'))
						require(['//assets.dermokozmetika.com.tr/scripts/modals/' + $dom.attr('id').replace(new RegExp('-modal$'), '') + '.js'], function (modal) {
							modals[$dom.attr('id').replace(new RegExp('-modal$'), '')] = modal;

							if (typeof modal.init == 'function')
								modal.init();
						});

					$dom.attr('data-href', href).modal();
				});
			else {
				$('.modal[data-href="' + href + '"]').modal('show');
			}
		}
	});

	$('.block').each(
		function () {
			$.each(
				(element = this).classList,
				function (
					key,
					item
				) {
					if (
						item != 'block' &&
						item != 'block-cover' &&
						item != 'block-section' &&
						item != 'block-widget' &&
						item.match(/block-/)
					) {
						$('html')
							.addClass(
								'has-' + item.replace(/block-/, '') + ($.inArray('block-cover', element.classList) > -1 ? '-cover': '') + ($.inArray('block-section', element.classList) > -1 ? '-section': '') + ($.inArray('block-widget', element.classList) > -1 ? '-widget': '') + '-block'
							);
					}
				}
			);
		}
	);

	$('[id$="-block"]').each(
		function () {
			var type = $(this)
					.attr('id')
					.replace(
						/-block$/,
						''
					)
					.split('-')
					.pop(),
				name = $(this)
					.attr('id')
					.replace(
						new RegExp('-' + type + '-block$'),
						''
					);

			blocks[type + 's'][name] = null;
		}
	);

	$.i18n.init({
		lng: LANGUAGE,
		resGetPath: '//assets.dermokozmetika.com.tr/languages/{{lng}}/{{ns}}.min.010.json',
		ns: {
			namespaces: ['custom', 'main'],
			defaultNs: 'custom'
		},
		fallbackNS: 'main',
		fallbackLng: 'en',
		interpolationSuffix: '}}',
		interpolationPrefix: '{{',
		useDataAttrOptions: true
	}).done(function () {
		$("html").i18n();

		$.each(blocks.covers, function (key, item) {

			require(
				['//assets.dermokozmetika.com.tr/scripts/blocks/covers/' + key + '.min.010.js'],
				function (block) {
					blocks.covers[key] = $.extend(
						{
							data: {},
							elements: {},
							events: {},
							hooks: {},
							renders: {},
							requests: {},
							templates: {}
						},
						block
					);


					run_module();
				}
			);
		});

		$.each(blocks.sections, function (key, item) {
			require(
				['//assets.dermokozmetika.com.tr/scripts/blocks/sections/' + key + '.min.012.js'],
				function (block) {
					blocks.sections[key] = $.extend(
						{
							data: {},
							elements: {},
							events: {},
							hooks: {},
							renders: {},
							requests: {},
							templates: {}
						},
						block
					);

					run_module();
				}
			);
		});

		$.each(blocks.widgets, function (key, item) {
			require(
				['//assets.dermokozmetika.com.tr/scripts/blocks/widgets/' + key + '.min.010.js'],
				function (block) {
					blocks.widgets[key] = $.extend(
						{
							data: {},
							elements: {},
							events: {},
							hooks: {},
							renders: {},
							requests: {},
							templates: {}
						},
						block
					);

					run_module();
				}
			);
		});
	});

	config = $.extend(
		config,
		data
	);

	var run_module = function() {
		var result = true;

		$.each(blocks.covers, function(key, item) {
			if (!item)
				result = false;
		});

		$.each(blocks.sections, function(key, item) {
			if (!item)
				result = false;
		});

		$.each(blocks.widgets, function(key, item) {
			if (!item)
				result = false;
		});

		if (result) {
			$.each(blocks.covers, function (key, item) {
				if ($('#' + key + '-cover-block-data').length > 0) {
					if (blocks.covers[key].data)
						blocks.covers[key].data = $.extend(
							true,
							{},
							blocks.covers[key].data,
							$.parseJSON(
								$('#' + key + '-cover-block-data').html()
							)
						);
					else
						blocks.covers[key].data = $.parseJSON(
							$('#' + key + '-cover-block-data').html()
						);
				}
			});

			$.each(blocks.sections, function (key, item) {
				if ($('#' + key + '-section-block-data').length > 0) {
					if (blocks.sections[key].data)
						blocks.sections[key].data = $.extend(
							true,
							{},
							blocks.sections[key].data,
							$.parseJSON(
								$('#' + key + '-section-block-data').html()
							)
						);
					else
						blocks.sections[key].data = $.parseJSON(
							$('#' + key + '-section-block-data').html()
						);
				}
			});

			$.each(blocks.widgets, function (key, item) {
				if ($('#' + key + '-widget-block-data').length > 0) {
					if (blocks.widgets[key].data)
						blocks.widgets[key].data = $.extend(
							true,
							{},
							blocks.widgets[key].data,
							$.parseJSON(
								$('#' + key + '-widget-block-data').html()
							)
						);
					else
						blocks.widgets[key].data = $.parseJSON(
							$('#' + key + '-widget-block-data').html()
						);
				}
			});

			$.each(blocks.covers, function (key, item) {
				if (typeof item.hooks == 'object') {
					if (typeof item.hooks.init == 'object') {
						if (typeof item.hooks.init.before == 'function') {
							item.hooks.init.before();
						}
					}
				}
			});

			$.each(blocks.sections, function (key, item) {
				if (typeof item.hooks == 'object') {
					if (typeof item.hooks.init == 'object') {
						if (typeof item.hooks.init.before == 'function') {
							item.hooks.init.before();
						}
					}
				}
			});

			$.each(blocks.widgets, function (key, item) {
				if (typeof item.hooks == 'object') {
					if (typeof item.hooks.init == 'object') {
						if (typeof item.hooks.init.before == 'function') {
							item.hooks.init.before();
						}
					}
				}
			});

			$.each(blocks.covers, function (key, item) {
				if (item.init)
					item.init();
			});

			$.each(blocks.sections, function (key, item) {
				if (item.init)
					item.init();
			});

			$.each(blocks.widgets, function (key, item) {
				if (item.init)
					item.init();
			});


			$.each(blocks.covers, function (key, item) {
				if (typeof item.hooks == 'object') {
					if (typeof item.hooks.init == 'object') {
						if (typeof item.hooks.init.after == 'function') {
							item.hooks.init.after();
						}
					}
				}
			});

			$.each(blocks.sections, function (key, item) {
				if (typeof item.hooks == 'object') {
					if (typeof item.hooks.init == 'object') {
						if (typeof item.hooks.init.after == 'function') {
							item.hooks.init.after();
						}
					}
				}
			});

			$.each(blocks.widgets, function (key, item) {
				if (typeof item.hooks == 'object') {
					if (typeof item.hooks.init == 'object') {
						if (typeof item.hooks.init.after == 'function') {
							item.hooks.init.after();
						}
					}
				}
			});
			$('[data-toggle="tooltip"]').tooltip();

			$('[data-toggle="popover"]').popover();
		}
	};

	require(['vendors/jquery-lazyload.min'], function () {

		$('.img-lazy').lazyload({
			data_attribute: 'src',
			effect: 'fadeIn'
		});
		
		$('.bg-lazy').lazyload({
			data_attribute: 'background',
			effect: 'fadeIn'
		});

		if ($(window).width() <= config.vendors.bootstrap['grid-breakpoints'].sm)
			$('.img-lazy-xs').lazyload({
				data_attribute: 'src',
				effect: 'fadeIn'
			});

		if ($(window).width() > config.vendors.bootstrap['grid-breakpoints'].sm && $(window).width() <= config.vendors.bootstrap['grid-breakpoints'].md)
			$('.img-lazy-sm').lazyload({
				data_attribute: 'src',
				effect: 'fadeIn'
			});

		if ($(window).width() > config.vendors.bootstrap['grid-breakpoints'].md && $(window).width() <= config.vendors.bootstrap['grid-breakpoints'].lg)
			$('.img-lazy-md').lazyload({
				data_attribute: 'src',
				effect: 'fadeIn'
			});

		if ($(window).width() > config.vendors.bootstrap['grid-breakpoints'].lg && $(window).width() <= config.vendors.bootstrap['grid-breakpoints'].xl)
			$('.img-lazy-lg').lazyload({
				data_attribute: 'src',
				effect: 'fadeIn'
			});

		if ($(window).width() > config.vendors.bootstrap['grid-breakpoints'].xl)
			$('.img-lazy-xl').lazyload({
				data_attribute: 'src',
				effect: 'fadeIn'
			});
	});
	
	$.validator.setDefaults({
    highlight: function(element) {
        $(element).closest('.form-group').addClass('has-danger');
			
			$(element).addClass('form-control-danger');
    },
    unhighlight: function(element) {
        $(element).closest('.form-group').removeClass('has-danger');
			
			$(element).removeClass('form-control-danger');
    },
    errorElement: 'label',
    errorClass: 'form-control-feedback',
    errorPlacement: function(error, element) {
        if(element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        } else {
            error.insertAfter(element);
        }
    }
});
});

require(['vendors/bootstrap.min']);



Noty.overrideDefaults({
	closeWith: ['click', 'button'],
	theme: 'default',
	timeout: 3000,
});

soda.prefix('html-')
}