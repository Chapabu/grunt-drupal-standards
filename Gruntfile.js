'use strict';

module.exports = function (grunt) {
    require('time-grunt')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        themepath: 'themes/THEMEPATH',

        phplintextensions: '*.{module,php,inc}',

        phpcsextensions: 'module,php,inc,info',

        customcode: {
            theme: '<%= themepath %>/{,**/}',
            modules: 'modules/custom/{,**/}',
            features: 'modules/features/{,**/}'
        },

        caspertestdir: 'tests/casperjs',

        phpcsignore: [
            'modules/features/*/*.inc',
            '**/views/*.inc',
        ],

        // Watch for changes and trigger compass, jshint, uglify and livereload
        watch: {
            options: {
                spawn: false
            },
            compass: {
                files: ['<%= themepath %>/sass/{,**/}*.scss'],
                tasks: [
                    'compass:dev',
                    'csslint'
                ],
                options: {
                    livereload: true
                }
            },
            js: {
                files: ['<%= themepath %>/js/{,**/}*.js'],
                tasks: [
                    'jshint:drupal'
                ],
                options: {
                    livereload: true
                }
            },
            drupaltheme: {
                files: [
                    '<%= themepath %>/template.php',
                    '<%= themepath %>/templates/{,**/}*.php',
                    '<%= themepath %>/*.info',
                ],
                tasks: [
                    'shell:clearthemeregistry',
                    'phplint:theme',
                    'phpcs'
                ]
            },
            drupalmodules: {
                files: [
                    '<%= customcode.modules %><%= phplintextensions %>',
                    '<%= customcode.modules %>/*.info',
                    '<%= customcode.features %>*.module'
                ],
                tasks: [
                    'phplint:modules',
                    'phplint:features',
                    'phpcs'
                ]
            },
            casper: {
                files: [
                    '<%= caspertestdir %>/{,*/}*.js'
                ],
                tasks: [
                    'jshint:casper'
                ]
            }
        },

        // Compass and scss
        compass: {
            options: {
                cssDir: '<%= themepath %>/css',
                sassDir: '<%= themepath %>/sass',
                imagesDir: '<%= themepath %>/images',
                assetCacheBuster: 'none',
                require: [
                    'susy',
                    'breakpoint'
                ]
            },
            dev: {
                options: {
                    environment: 'development',
                    outputStyle: 'expanded',
                    relativeAssets: true,
                    raw: 'line_numbers = :true\n'
                }
            },
            dist: {
                options: {
                    environment: 'production',
                    outputStyle: 'compact',
                    force: true
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '<%= themepath %>/.jshintrc',
                reporter: require('jshint-stylish')
            },
            drupal: [
                '<%= themepath %>/js/{,*/}*.js'
            ],
            casper: [
                '<%= caspertestdir %>{,*/}*.js'
            ]
        },

        csslint: {
            options: {
                csslintrc: '<%= themepath %>/.csslintrc'
            },
            src: '<%= themepath %>/css/{,*/}*.css'
        },

        clean: {
            css: ['<%= themepath %>/css/{,*/}*.css']
        },

        shell: {
            clearthemeregistry: {
                command: 'drush cc theme-registry'
            },
            clearcssjs: {
                command: 'drush cc css-js'
            },
            clearallcaches: {
                command: 'drush cc all'
            }
        },

        phplint: {
            theme: '<%= customcode.theme %><%= phplintextensions %>',
            modules: '<%= customcode.modules %><%= phplintextensions %>',
            features: '<%= customcode.features %><%= phplintextensions %>',
            options: {
                swapPath: '/tmp'
            }
        },

        phpcs: {
            application: {
                dir: [
                    '<%= customcode.theme %>',
                    '<%= customcode.modules %>',
                    '<%= customcode.features %>'
                ]
            },
            options: {
                bin: 'vendor/bin/phpcs',
                standard: 'vendor/drupal/coder/coder_sniffer/Drupal',
                extensions: '<%= phpcsextensions %>',
                ignore: '<%= phpcsignore %>',
                report: 'summary'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-phplint');
    grunt.loadNpmTasks('grunt-phpcs');
    grunt.loadNpmTasks('grunt-casper');


    grunt.event.on('watch', function(action, filepath) {
        // We want to run PHP CodeSniffer in a watch task, but we don't want to
        // run it against everything as that'll take forever. This will allow
        // us to sniff only changed files.
        var themeFile = grunt.file.isMatch(grunt.config('watch.drupaltheme.files'), filepath),
            moduleFile = grunt.file.isMatch(grunt.config('watch.drupalmodules.files'), filepath);

        // If the changed file matches the glob specified in out "drupaltheme"
        // or "drupalmodules" watch tasks, then change the PHP CodeSniffer
        // settings to only scan the changed file.
        if (themeFile || moduleFile) {
            grunt.config('phpcs.application.dir', [filepath]);
            grunt.config('phpcs.options.report', 'full');
        }
    });

    grunt.registerTask('build', [
        'shell:clearallcaches',
        'jshint',
        'clean:css',
        'compass:dist',
        'csslint',
        'phplint',
        'phpcs'
    ]);

    grunt.registerTask('default', [
        'shell:clearallcaches',
        'clean:css',
        'compass:dev',
        'watch'
    ]);

};