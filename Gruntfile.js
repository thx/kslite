/**
 * 注意文件编码一定要统一为GBK
 * vim下使用euc-cn就行了
 */
module.exports = function(grunt) {
    var notProxy = function(filepath) {
        return filepath.indexOf('proxy.js') == -1;
    };

    var fs = require('fs');

    //文件编码
    grunt.file.defaultEncoding = 'gbk';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        local: grunt.file.readJSON('local.json'),

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
                    return content.replace(/{timestamp}/g, grunt.template.today("yyyymmdd")).replace(/{acookie\.js}/g, grunt.file.read('src/acookie/acookie.js'));
                }
            },
            files: {
                expand: true, //为了让复制前不出现src
                cwd: 'src',
                src: ['**/*.js', '**/*.html'],
                filter: notProxy,
                dest: '<%= local.svndir %>'
            }
        },

        watch: {
            files: ['<%= jshint.all.src %>', '**/*.html'],
            tasks: ['jshint', 'copy']
        },

        git2svn: {
            files: {
                src: ['.'],
                dest: '<%= local.svndir %>'
            }
        }
    });

    grunt.registerMultiTask('git2svn', 'Get latest git log and publish the svn', function() {
        var done = this.async();

        var files = this.filesSrc;
        var dest = this.data.dest;

        var exec = require('child_process').exec;

        var gitlogCMD = 'git log -n1 --pretty=format:\'%ai %an: %s\'';
        var svncommitCMD = 'svn up; svn commit -m "{MESSAGE}";';

        exec(gitlogCMD, {
            cwd: files
        }, function(err, stdout, stderr) {
            if (err) {
                done(false);
                return false;
            }

            grunt.log.ok('Git最后提交纪录: ' + stdout);
            svncommitCMD = svncommitCMD.replace(/{MESSAGE}/, stdout);

            exec(svncommitCMD, {
                cwd: dest
            }, function(er, stdo, stde) {
                if (er || stde) {
                    grunt.log.error(stdo);
                    done(false);
                    return false;
                }

                grunt.log.ok(stdo);

                done(true);
            });
        });
    });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('publish', ['jshint', 'copy', 'git2svn']);
    grunt.registerTask('default', ['watch']);
};
