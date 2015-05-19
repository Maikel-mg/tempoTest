module.exports = function(grunt) {
    grunt.initConfig({
        concat : {
            vendor: {
                src: [
                        'js/libs/handlebars-v3.0.1.js',
                        'js/libs/jquery.min.js',
                        'js/libs/underscore-min.js',
                        'js/libs/backbone-min.js',
                        'js/bootstrap/bootstrap.js',
                        'js/libs/select2.full.min.js',
                        'js/libs/jquery.flot.js',
                        'js/libs/jquery.mockjax.js',
                        'js/libs/jquery.dataTables.min.js',
                        'js/libs/dataTables.bootstrap.js'
                     ],
                dest: 'dist/vendor.js'
            },
            model : {
                src : [
                    'js/ajaxMocks.js',
                    'js/fixtures.js',
                    'js/utils.js',
                    'js/templates.js',
                    'js/models/**.js',
                    'js/collections/**.js',
                    'js/views/itemView.js',
                    'js/views/*/**.js',
                    'js/views/**.js',
                    'js/routers/**.js'

                ],
                dest : 'dist/app.model.js'
            },
            css : {
                src : [
                    'css/dataTables.bootstrap.css',
                    'js/bootstrap/bootstrap.css',
                    'css/select2.min.css',
                    'css/todos.css'
                ],
                dest: 'dist/estilos.css'
            }
        },
        cssmin: {
            css: {
                src: 'dist/estilos.css',
                dest: 'dist/estilos.min.css'
            }
        },
        uglify: {
            dist: {
                files: {
                    'dist/vendor.min.js': ['<%= concat.vendor.dest %>'],
                    'dist/app.model.min.js': ['<%= concat.model.dest %>']
                }
            },
            dev : {
                files : {
                    'dist/app.model.min.js': ['<%= concat.model.dest %>']
                }
            }
        },
        browserify: {
            'js/vendor.js': ['/js/libs/*.js']
        },
        handlebars: {
            all: {
                files: {
                    "js/templates.js": ["templates/**/*.hbs"]
                }
            }
        },
        watch: {
            plantillas : {
                files: [ "templates/**/*.hbs"],
                tasks: [ 'handlebars' ]
            },
            codigo : {
                files: [ 'js/fixtures.js',
                         'js/utils.js',
                         'js/templates.js',
                         'js/models/**.js',
                         'js/collections/**.js',
                         'js/views/**.js',
                         'js/routers/**.js'],
                tasks: [ 'concat:model', 'uglify:dev' ],
                options: {
                    livereload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('default', ['handlebars', 'concat', 'cssmin', 'uglify:dist']);
    grunt.registerTask('dev', ['handlebars', 'concat:model', 'uglify:dev']);
    grunt.registerTask('w', 'watch');
};
