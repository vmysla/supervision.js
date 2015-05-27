var istanbul = require('browserify-istanbul');

module.exports = function(config) {
    
    config.set({

        basePath: './../../lib/eam',

        exclude: [],

        preprocessors: {
            './test/*.js'      : ['browserify', 'coverage'],
            './../../index.js' : ['browserify', 'coverage']
        },

        browserify: {
            debug: true,
            transform: [istanbul({
                ignore: ['**/node_modules/**', '**/test/**'],
            })],
        },

        frameworks: ['browserify', 'jasmine'],

        reporters: ['coverage', 'progress','junit'],

        coverageReporter : {
          type : 'text'
        },

        colors: true,

        logLevel: config.LOG_INFO,

        port: 9876,

        browsers: [
            'PhantomJS',
            'Chrome',
            'Firefox',
            'IE'
        ],

        autoWatch: false,

        singleRun: true
    });

};