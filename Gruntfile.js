module.exports = function (grunt) {

    grunt.initConfig({

        pkg  : grunt.file.readJSON('package.json'),

        concat: {
            options: {
                separator: ';'
            },

            build: {
                src: ['src/straps.js', 'src/modules/*.js'],
                dest: 'build/<%= pkg.name %>.js'
            }
        },
        
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            build: {
                files: {
                    'build/<%= pkg.name %>.min.js': ['<%= concat.build.dest %>']
                }
            }
        },

        cssmin: {   
            dist: {
                options: {
                    banner: '/* Straps Reset Stylesheet <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */'
                },
                files: {
                    'build/<%= pkg.name %>.css': ['src/css/*.css']
                }
            }
        },


        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                  console: true,
                  module: true,
                  document: true
                }
             }
        },

        copy: {

        },
    
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'qunit']
         }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');


    /** (tasks) */
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'cssmin']);

};