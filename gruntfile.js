// 实现这个项目的构建任务

const loadGruntTasks = require('load-grunt-tasks')

const sass = require('node-sass')

const path = require('path')

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

    const cwd = process.cwd()

    grunt.initConfig({
        clean: [path.join(cwd, 'dist'), path.join(cwd, 'temp'), path.join(cwd, '.tmp')],
        sass: {
            options: {
                implementation: sass,
                outputStyle: 'expanded',
                sourceMap: true
            },
            main: {
                files: {
                    'temp/assets/styles/main.css': 'src/assets/styles/main.scss'
                }
            }
        },
        babel: {
            options: {
                presets: ['@babel/preset-env'],
                sourceMap: true
            },
            main: {
                files: {
                    'temp/assets/scripts/main.js': 'src/assets/scripts/main.js'
                }
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
                files: {
                    'dist/index.html': 'temp/index.html',
                    'dist/about.html': 'temp/about.html'
                }
            }
        }
    })

    loadGruntTasks(grunt)

    grunt.registerTask('compile', ['sass', 'babel', 'swigtemplates'])

    grunt.registerTask('serve', ['compile', 'browserSync:devServer', 'watch'])

    grunt.registerTask('build', ['clean', 'compile',  'useminPrepare', 'concat:generated', 'cssmin:generated', 'uglify:generated', 'usemin', 'htmlmin', 'copy'])

    grunt.registerTask('start', ['build', 'browserSync:distServer'])
}