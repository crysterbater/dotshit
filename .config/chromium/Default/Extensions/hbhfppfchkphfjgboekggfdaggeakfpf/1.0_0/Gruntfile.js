module.exports = function (grunt) {
    grunt.initConfig({
        watch: {
            server: {
                files: [
                    'js/**/*.js',
                    'css/**/*.css',
                    'templates/**/*.html'
                ],
                tasks: ['build']
            }
        },
        preload_assets: {
            images: {
                files: {
                    'build/preload.js': ['images/*.svg', 'images/*.png']
                },
                options: {
                    template: 'js/preload.js.tpl',
                    detectMD5: true
                }
            }
        },
        sass: {
            css: {
                files: [{
                    expand: true,
                    cwd: 'css',
                    src: '*.scss',
                    dest: 'build',
                    ext: '.css'
                }]
            }
        },
        requirejs: {
            build: {
                options: {
                    almond: true,
                    baseUrl: "js",
                    mainConfigFile: "js/main.js",
                    name: "main",
                    optimize: "none",
                    out: "build/main.js"
                }
            }
        },
        concat: {
            build_js: {
                options: { separator: ';\n' },
                src: ['node_modules/almond/almond.js','build/main.js','build/preload.js'],
                dest: 'build/build.js'
            },
            build_css: {
                options: { separator: '\n' },
                src: [
                    'bower_components/slick-carousel/slick/slick.css',
                    'bower_components/select2/dist/css/select2.min.css',
                    'bower_components/flickity/dist/flickity.min.css',
                    'build/base.css'
                ],
                dest: 'build/build.css'
            }
        },
        uglify: {
            build: {
                files: [{
                    src: ['build/build.js'],
                    dest: 'build/build.min.js'
                }]
            }
        },
        cssmin: {
            target: {
                files: {
                    'build/build.min.css': ['build/build.css']
                }
            }
        },
        sprite:{
            all: {
                src: 'images/sprite/*.png',
                retinaSrcFilter: 'images/sprite/*@2x.png',
                dest: 'images/sprite/build/spritesheet.png',
                retinaDest: 'images/sprite/build/spritesheet@2x.png',
                destCss: 'css/_sprites.scss'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-preload-assets');

    grunt.registerTask('default', ['build']);
    grunt.registerTask(
        'build',
        [
            'sass:css',
            'requirejs:build',
            //'preload_assets',
            'concat:build_js',
            'concat:build_css',
            'uglify:build',
            'cssmin'
        ]
    );
};
