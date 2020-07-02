// 实现这个项目的构建任务

const loadGruntTasks = require('load-grunt-tasks')

const sass = require('node-sass')

const data = {
    menus: [
        {
            name: 'Home',
            icon: 'aperture',
            link: 'index.html'
        },
        {
            name: 'About',
            link: 'about.html'
        },
        {
            name: 'Contact',
            link: '#',
            children: [
                {
                    name: 'Twitter',
                    link: 'https://twitter.com/w_zce'
                },
                {
                    name: 'About',
                    link: 'https://weibo.com/zceme'
                },
                {
                    name: 'divider'
                },
                {
                    name: 'About',
                    link: 'https://github.com/zce'
                }
            ]
        }
    ],
    pkg: require('./package.json'),
    date: new Date()
}

module.exports = grunt => {

    grunt.initConfig({
        clean: ['dist', 'temp', '.tmp'], // 清理临时文件
        sass: {
            options: {
                implementation: sass,
                outputStyle: 'expanded',
                sourceMap: true
            },
            main: {
                files: [{
                    expand: true,
                    cwd: 'src/assets/styles',
                    src: ['*.scss'],
                    dest: 'temp/assets/styles',
                    ext: '.css'
                }]
            }
        },
        babel: {
            options: {
                presets: ['@babel/preset-env'],
                sourceMap: true
            },
            main: {
                files: [{
                    expand: true,
                    cwd: 'src/assets/scripts',
                    src: ['*.js'],
                    dest: 'temp/assets/scripts'
                }]
            }
        },
        swigtemplates: {
            options: {
                templatesDir: 'src'
            },
            main: {
                context: data,
                dest: 'temp',
                src: ['src/*.html']
            }
        },
        watch: {
            styles: {
                files: ['src/assets/styles/*.scss'],
                tasks: ['sass']
            },
            scripts: {
                files: ['src/assets/scripts/*.js'],
                tasks: ['babel']
            },
            pages: {
                files: ['src/**/*.html'],
                tasks: ['swigtemplates']
            }
        },
        browserSync: {
            devServer: {
                bsFiles: {
                    src: ['temp']
                },
                options: {
                    notify: false,
                    open: true,
                    port: 3002,
                    watchTask: true,
                    server: {
                        baseDir: ['temp', 'src', 'public'],
                        routes: {
                            '/node_modules': 'node_modules'
                        }
                    }
                }
            },
            distServer: {
                bsFiles: {
                    src: ['dist']
                },
                options: {
                    notify: false,
                    open: true,
                    port:3003,
                    server: {
                        baseDir: ['dist']
                    }
                }
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'public',
                        src: '**',
                        dest: 'dist'
                    },
                    {
                        expand: true,
                        cwd: 'src',
                        src: ['assets/fonts/**', 'assets/images/**'],
                        dest: 'dist'
                    }
                ]
            }
        },
        useminPrepare: {
            html: 'temp/*.html',
            options: {
                dest: 'dist',
                root: ['temp', '.']
            }
        },
        usemin: {
            html : 'temp/*.html',
            options: {
                assetsDirs: ['temp']
            }
        },
        htmlmin: {
            main: {
                options: {
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true
                },
                files: [{
                    expand: true,
                    cwd: 'temp',
                    src: ['*.html'],
                    dest: 'dist'
                }]
            }
        }
    })

    loadGruntTasks(grunt)

    // 编译 sass, es6+, swig模板文件
    grunt.registerTask('compile', ['sass', 'babel', 'swigtemplates'])

    // 开启开发服务器并监听文件变化
    grunt.registerTask('serve', ['compile', 'browserSync:devServer', 'watch'])

    // 将开发文件编译，压缩，打包生成生产目录
    grunt.registerTask('build', ['clean', 'compile',  'useminPrepare', 'concat:generated', 'cssmin:generated', 'uglify:generated', 'usemin', 'htmlmin', 'copy'])

    // 开启生产服务器，检查生成的文件
    grunt.registerTask('start', ['build', 'browserSync:distServer'])

}