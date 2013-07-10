/**
 * 注意文件编码一定要统一为GBK
 * vim下使用euc-cn就行了
 */
module.exports = function(grunt) {
    var fs = require('fs');

    //文件编码
    grunt.file.defaultEncoding = 'utf-8';

    grunt.initConfig({
        jshint: {
            all: {
                src: ['src/**/*.js']
            },
            options: grunt.file.readJSON('.jshintrc')
        },

        copy: {
            options: {
                processContent: function(content, srcPath) {
                    //替换时间戳
                    //替换acookie.js
                    return content.replace(/{timestamp}/g, grunt.template.today("yyyymmddhhMMss")).replace(/{version}/, grunt.file.readJSON('package.json').version);
                }
            },
            files: {
                expand: true, //为了让复制前不出现src
                cwd: 'src',
                src: ['**/*.js'],
                dest: 'dist'
            }
        },

        uglify: {
            kslite: {
                files: {
                    'dist/kslite-min.js': ['dist/kslite.js']
                }
            }
        },

        watch: {
            files: ['<%= jshint.all.src %>'],
            tasks: ['jshint', 'copy', 'uglify']
        }

    });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['watch']);
};
