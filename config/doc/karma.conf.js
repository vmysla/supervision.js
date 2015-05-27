var istanbul = require('browserify-istanbul');

module.exports = function(config) {
    
    config.set({

        basePath: './../../lib/eam',

        exclude: [],

        preprocessors: {
            './test/*.js'      : ['browserify'],
            './../../index.js' : ['browserify']
        },

        browserify: {
            debug: true,
            transform: [istanbul({
                ignore: ['**/node_modules/**', '**/test/**'],
            })],
        },

        frameworks: ['browserify', 'jasmine'],

        reporters: ['progress', 'coverage'],

        coverageReporter: {
            type: 'html',
            dir: './../../dist/last/doc/',
            subdir: 'coverage'
        },

        colors: true,

        logLevel: config.LOG_INFO,

        port: 9876,

        browsers: [
            'PhantomJS'
        ],

        autoWatch: true,

        singleRun: true
    });

};