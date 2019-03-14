module
	.exports = function (grunt) {
        var _ = require('underscore');
        var path = require('path');
        var watch = Object.create(null);

		grunt
			.initConfig(
				{
                    cleanempty: { src: 'distribution/**/*' },
					coffee: {
                        default: {
                            cwd: 'source',
                            dest: 'distribution',
                            expand: true,
                            ext: '.js',
                            src: ['**/*.coffee', '!public/assets/vendors/**/*.coffee']
                        },
                        options: { bare: true }
					},
                    cssmin: {
                        main: {
                            cwd: 'distribution',
                            dest: 'distribution',
                            expand: true,
                            ext: '.min.css',
                            src: ['**/*.css', '!**/*.min.css', '!public/assets/vendors/**/*.css']
                        },
                        options: {
                            level: {
                                1: { specialComments: false }
                            }
                        }
                    },
                    htmlmin: {
                        default: {
                            cwd: 'distribution',
                            dest: 'distribution',
                            expand: true,
							ext: '.min.html',
                            src: ['**/*.html', '!**/*.min.html', '!public/assets/vendors/**/*.html']
                        },
                        options: {
                            collapseInlineTagWhitespace: true,
                            collapseWhitespace: true,
                            ignoreCustomFragments: [/{[\s\S]*?}/],
                            minifyCSS: true,
                            minifyJS: true,
                            processScripts: ['application/ld+json'],
                            removeComments: true,
                            sortAttributes: true,
                            sortClassName: true,
                            trimCustomFragments: true
                        }
                    },
                    imagemin: {
                        default: {
                            cwd: 'source',
                            dest: 'distribution',
                            expand: true,
                            src: ['**/*.{gif,jpeg,jpg,png,svg}', '!public/assets/vendors/**/*']
                        }
                    },
                    json_minification: {
                        default: {
                            cwd: 'distribution',
                            dest: 'distribution',
                            expand: true,
                            ext: '.min.json',
                            src: ['**/*.json', '!**/*.min.json', '!public/assets/vendors/**/*.json']
                        }
                    },
                    pug: {
                        default: {
                            cwd: 'source',
                            dest: 'distribution',
                            expand: true,
                            ext: '.html',
                            src: ['**/*.pug', '!public/assets/vendors/**/*.pug']
                        },
						options: { pretty: true }
                    },
                    sass: {
                        default: {
                            cwd: 'source',
                            dest: 'distribution',
                            expand: true,
                            ext: '.css',
                            src: ['**/*.scss', '!public/assets/vendors/**/*.scss']
                        },
                        options: {
                            sourcemap: 'none',
                            style: 'expanded'
                        }
                    },
					sync: {
						default: {
                            cwd: 'source',
                            dest: 'distribution',
                            expand: true,
                            src: ['**/.htaccess', '**/*', '!**/*.{coffee,gif,jpeg,jpg,png,pug,scss,svg,ttf,yml}'],
                            updateAndDelete: true
                        }
					},
                    ttf2woff: {
                        default: {
                            cwd: 'source',
                            dest: 'distribution',
                            expand: true,
                            rename: function (
                                dest,
                                src
                            ) { return dest + '/' + path.dirname(src); },
                            src: ['**/*.ttf', '!public/assets/vendors/**/*.ttf']
                        }
                    },
                    ttf2woff2: {
                        default: {
                            cwd: 'source',
                            dest: 'distribution',
                            expand: true,
                            rename: function (
                                dest,
                                src
                            ) { return dest + '/' + path.dirname(src); },
                            src: ['**/*.ttf', '!public/assets/vendors/**/*.ttf']
                        }
                    },
                    uglify: {
                        default: {
                            cwd: 'distribution',
                            dest: 'distribution',
                            expand: true,
							ext: '.min.js',
                            src: ['**/*.js', '!**/*.min.js', '!public/assets/vendors/**/*.js']
                        }
                    },
                    yaml: {
                        default: {
                            cwd: 'source',
                            dest: 'distribution',
                            expand: true,
                            ext: '.json',
                            src: ['**/*.yml', '!public/assets/vendors/**/*.yml']
                        }
                    },
                    watch: {
                        coffee: {
                            files: '**/*.coffee',
                            options: {
                                cwd: {
                                    event: 'source',
                                    files: 'source'
                                }
                            },
                            tasks: 'script:watch'
                        },
                        img: {
                            files: '**/*.{gif,jpeg,jpg,png,svg}',
                            options: {
                                cwd: {
                                    event: 'source',
                                    files: 'source'
                                }
                            },
                            tasks: 'image:watch'
                        },
                        yml: {
                            files: '**/*.yml',
                            options: {
                                cwd: {
                                    event: 'source',
                                    files: 'source'
                                }
                            },
                            tasks: 'json:watch'
                        },
                        pug: {
                            files: '**/*.pug',
                            options: {
                                cwd: {
                                    event: 'source',
                                    files: 'source'
                                }
                            },
                            tasks: 'html:watch'
                        },
                        scss: {
                            files: ['**/*.scss', '!vendors/**/*.scss'],
                            options: {
                                cwd: {
                                    event: 'source',
                                    files: 'source'
                                }
                            },
                            tasks: 'stylesheet'
                        },
                        ttf: {
                            files: '**/*.ttf',
                            options: {
                                cwd: {
                                    event: 'source',
                                    files: 'source'
                                }
                            },
                            tasks: 'font:watch'
                        },
                        options: { spawn: false }
                    }
				}
			);

        grunt.loadNpmTasks('grunt-cleanempty');
    	grunt.loadNpmTasks('grunt-contrib-clean');
		grunt.loadNpmTasks('grunt-contrib-coffee');
		grunt.loadNpmTasks('grunt-contrib-cssmin');
		grunt.loadNpmTasks('grunt-contrib-htmlmin');
		grunt.loadNpmTasks('grunt-contrib-imagemin');
		grunt.loadNpmTasks('grunt-contrib-pug');
		grunt.loadNpmTasks('grunt-contrib-sass');
		grunt.loadNpmTasks('grunt-contrib-uglify');
    	grunt.loadNpmTasks('grunt-contrib-watch');
    	grunt.loadNpmTasks('grunt-json-minification');
    	grunt.loadNpmTasks('grunt-sync');
		grunt.loadNpmTasks('grunt-ttf2woff');
		grunt.loadNpmTasks('grunt-ttf2woff2');
    	grunt.loadNpmTasks('grunt-yaml');

        grunt
            .registerTask(
                'default',
                ['sync', 'font', 'html', 'image', 'json', 'script', 'stylesheet', 'cleanempty']
            );

        grunt
            .registerTask(
                'font',
                ['ttf2woff', 'ttf2woff2']
            );

        grunt
            .registerTask(
                'font:watch',
                function () {
                    _
                        .each(
                            watch,
                            function (
                                item,
                                key
                            ) {
                                switch (key) {
                                    case 'deleted':
                                        grunt
                                            .config(
                                                'clean.src',
                                                [
                                                    grunt.config('ttf2woff.default.dest') + '/' + path.dirname(item) + '/' + path.basename(
                                                        item,
                                                        path.extname(item)
                                                    ) + grunt.config('ttf2woff.default.ext'),
                                                    grunt.config('ttf2woff2.default.dest') + '/' + path.dirname(item) + '/' + path.basename(
                                                        item,
                                                        path.extname(item)
                                                    ) + grunt.config('ttf2woff2.default.ext')
                                                ]
                                            );

                                        grunt
                                            .task
                                            .run('clean');

                                        return;
                                    default:
                                        grunt
                                            .config(
                                                'ttf2woff.default.src',
                                                item
                                            );

                                        grunt
                                            .config(
                                                'ttf2woff2default.src',
                                                item
                                            );

                                        grunt
                                            .task
                                            .run('font');

                                        return;
                                }
                            }
                        );

                    watch = Object.create(null);
                }
            );

		grunt
			.registerTask(
				'html',
				['pug', 'htmlmin']
			);

        grunt
            .registerTask(
                'html:watch',
                function () {
                    _
                        .each(
                            watch,
                            function (
                                item,
                                key
                            ) {
                                switch (key) {
                                    case 'deleted':
                                        grunt
                                            .config(
                                                'clean.src',
                                                [
                                                    grunt.config('pug.default.dest') + '/' + path.dirname(item) + '/' + path.basename(
                                                        item,
                                                        path.extname(item)
                                                    ) + grunt.config('pug.default.ext'),
                                                    grunt.config('htmlmin.default.dest') + '/' + path.dirname(item) + '/' + path.basename(
                                                        item,
                                                        path.extname(item)
                                                    ) + grunt.config('htmlmin.default.ext')
                                                ]
                                            );

                                        grunt
                                            .task
                                            .run('clean');

                                        return;
                                    default:
                                        grunt
                                            .config(
                                                'pug.default.src',
                                                item
                                            );

                                        grunt
                                            .config(
                                                'htmlmin.default.src',
                                                path.dirname(item) + '/' + path.basename(
                                                    item,
                                                    path.extname(item)
                                                ) + grunt.config('pug.default.ext')
                                            );

                                        grunt
                                            .task
                                            .run('html');

                                        return;
                                }
                            }
                        );
                }
            );

        grunt
            .registerTask(
                'image',
                ['imagemin']
            );

        grunt
            .registerTask(
                'image:watch',
                function () {
                    _
                        .each(
                            watch,
                            function (
                                item,
                                key
                            ) {
                                switch (key) {
                                    case 'deleted':
                                        grunt
                                            .config(
                                                'clean.src',
                                                grunt.config('imagemin.default.dest') + '/' + item
                                            );

                                        grunt
                                            .task
                                            .run('clean');

                                        return;
                                    default:
                                        grunt
                                            .config(
                                                'imagemin.default.src',
                                                item
                                            );

                                        grunt
                                            .task
                                            .run('image');

                                        return;
                                }
                            }
                        );
                }
            );

        grunt
            .registerTask(
                'json',
                ['yaml', 'json_minification']
            );

        grunt
            .registerTask(
                'json:watch',
                function () {
                    _
                        .each(
                            watch,
                            function (
                                item,
                                key
                            ) {
                                switch (key) {
                                    case 'deleted':
                                        grunt
                                            .config(
                                                'clean.src',
                                                [
                                                    grunt.config('yaml.default.dest') + '/' + path.dirname(item) + '/' + path.basename(
                                                        item,
                                                        path.extname(item)
                                                    ) + grunt.config('yaml.default.ext'),
                                                    grunt.config('json_minification.default.dest') + '/' + path.dirname(item) + '/' + path.basename(
                                                        item,
                                                        path.extname(item)
                                                    ) + grunt.config('json_minification.default.ext')
                                                ]
                                            );

                                        grunt
                                            .task
                                            .run('clean');

                                        return;
                                    default:
                                        grunt
                                            .config(
                                                'yaml.default.src',
                                                item
                                            );

                                        grunt
                                            .config(
                                                'json_minification.default.src',
                                                path.dirname(item) + '/' + path.basename(
                                                    item,
                                                    path.extname(item)
                                                ) + grunt.config('yaml.default.ext')
                                            );

                                        grunt
                                            .task
                                            .run('json');

                                        return;
                                }
                            }
                        );
                }
            );

		grunt
			.registerTask(
				'script',
				['coffee', 'uglify']
			);

        grunt
            .registerTask(
                'script:watch',
                function () {
                    _
                        .each(
                            watch,
                            function (
                                item,
                                key
                            ) {
                                switch (key) {
                                    case 'deleted':
                                        grunt
                                            .config(
                                                'clean.src',
                                                [
                                                    grunt.config('coffee.default.dest') + '/' + path.dirname(item) + '/' + path.basename(
                                                        item,
                                                        path.extname(item)
                                                    ) + grunt.config('coffee.default.ext'),
                                                    grunt.config('uglify.default.dest') + '/' + path.dirname(item) + '/' + path.basename(
                                                        item,
                                                        path.extname(item)
                                                    ) + grunt.config('uglify.default.ext')
                                                ]
                                            );

                                        grunt
                                            .task
                                            .run('clean');

                                        return;
                                    default:
                                        grunt
                                            .config(
                                                'coffee.default.src',
                                                item
                                            );

                                        grunt
                                            .config(
                                                'uglify.default.src',
                                                path.dirname(item) + '/' + path.basename(
                                                    item,
                                                    path.extname(item)
                                                ) + grunt.config('coffee.default.ext')
                                            );

                                        grunt
                                            .task
                                            .run('script');

                                        return;
                                }
                            }
                        );
                }
            );

        grunt
            .registerTask(
                'stylesheet',
                ['sass', 'cssmin']
            );

        grunt
            .event
            .on(
                'watch',
                function(
                    action,
                    filepath
                ) { watch[action] = filepath; }
            );
	};