var gulp       = require('gulp');
var karma      = require('gulp-karma');
var jsdoc      = require('gulp-jsdoc');
var jsdocareok = require('gulp-validate-jsdoc');
var browserify = require('gulp-browserify');
var sourcemaps = require('gulp-sourcemaps');
var rename     = require('gulp-rename');
var uglify     = require('gulp-uglify');
var closure    = require('gulp-closure-compiler-service');
var plato      = require('plato');
var package    = require('./package.json');


// settings:

var eam = {

	options : ['./index.js'],
	sources : ['./lib/eam/src/**/*.js'],
	tests   : ['./lib/eam/test/*.spec.js'],

	libs    : {
		satellite : ['./node_modules/ja-satellite-extensions/lib/satellite.js'],
		jquery    : ['./node_modules/node_modules/jquery/dist/jquery.js']
	},

	target : {
		bin  : './dist/last',
		doc  : './dist/last/doc'		
	}
}

// ******************************************************
// aliases:

gulp.task('doc', ['doc-coverage', 'doc-complexity', 'doc-reference']);
gulp.task('build', ['build-debug', 'build-release', 'build-release-compressed', 'build-original', 'build-compressed']);

// ******************************************************
// build tasks:

gulp.task('build-original', function() {

	var code = eam.options;

	var config = {
	    insertGlobals: false
	};

	gulp
	 .src(code)
	 .pipe(browserify(config))
	 .pipe(rename('eam.js'))
	 .pipe(gulp.dest(eam.target.bin));

});

gulp.task('build-compressed', function() {

	var code = eam.options;

	var config = {
	    insertGlobals: false
	};

	gulp
	 .src(code)
	 .pipe(browserify(config))
	 .pipe(uglify())
	 .pipe(rename('eam.min.js'))
	 .pipe(gulp.dest(eam.target.bin));

});


gulp.task('build-release-compressed', function() {

	var code = eam.options;

	var config = {
	    insertGlobals: false
	};


	gulp
	 .src(code)
	 .pipe(browserify(config))
	 .pipe(uglify())
	 .pipe(closure({compilation_level: 'ADVANCED_OPTIMIZATIONS'}))
	 .pipe(rename('eam.release.min.js'))
	 .pipe(gulp.dest(eam.target.bin));

});


gulp.task('build-release', function() {

	var code = eam.options;

	var config = {
	    insertGlobals: false
	};

	gulp
	 .src(code)
	 .pipe(browserify(config))
	 .pipe(closure({compilation_level: 'ADVANCED_OPTIMIZATIONS'}))
	 .pipe(rename('eam.release.js'))
	 .pipe(gulp.dest(eam.target.bin));

});


gulp.task('build-debug', function() {

	var code = eam.options;

	var config = {
	    insertGlobals: true,
	    options: {
            bundleOptions : {
                debug: true 
            }
        }
	};

	gulp
	 .src(code.concat(eam.sources))
	 .pipe(sourcemaps.init())
	 .pipe(browserify(config))
	 .pipe(sourcemaps.write())
	 .pipe(rename('eam.debug.js'))
	 .pipe(gulp.dest(eam.target.bin));
	 
});


// ******************************************************
// test tasks:

gulp.task('test', function() {

	var code = eam.libs.satellite.concat(eam.tests);

	var config = { 
		action     : 'run', 
		configFile : './config/test/karma.conf.js'
	};

	gulp
	 .src(code)
     .pipe(karma(config));
});

// ******************************************************
// doc tasks:

gulp.task('doc-coverage', function() {

	var code = eam.libs.satellite.concat(eam.tests);

	var config = { 
		action     : 'run', 
		configFile : './config/doc/karma.conf.js'
	};

	gulp
	 .src(code)
     .pipe(karma(config));
});


gulp.task('doc-complexity', function(done) {

	var code = eam.sources;

	var config = {
        title : package.name
    };

    plato
     .inspect(code, eam.target.doc + "/complexity", config, done);
});


gulp.task('doc-reference', function() {

	var code = eam.libs.satellite
				   .concat(eam.options)
				   .concat(eam.sources)
				   .concat(eam.tests);

    var config = {
        path            : 'ink-docstrap',
        systemName      : 'Engagement Analytics Model',
        navType         : "vertical",
        theme           : "spacelab",
        linenums        : true,
        collapseSymbols : true,
        inverseNav      : true,
        showPrivate		: true
    };

	gulp
	 .src(code)		
	// .pipe(jsdocareok())
     .pipe(jsdoc.parser())
     .pipe(jsdoc.generator(eam.target.doc + '/reference', config));
});
