var gulp 			= require('gulp'),
	sass 			= require('gulp-sass'),
	browserSync 	= require('browser-sync'),
	concat 			= require('gulp-concat'),
	uglify 			= require('gulp-uglifyjs'),
	cssnano 		= require('gulp-cssnano'),
	uncss 			= require('gulp-uncss'),
	rename 			= require('gulp-rename'),
	del 			= require('del'),
	imagemin 		= require('gulp-imagemin'),
	pngquant 		= require('imagemin-pngquant'),
	cache 			= require('gulp-cache'),
	autoprefixer	= require('gulp-autoprefixer'),
	rigger			= require('gulp-rigger'),
	mainBowerFiles  = require('main-bower-files'),
	spritesmith		= require('gulp.spritesmith');

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'dist'
		},
		notify: false
	});
});

gulp.task('html', function(){
	return gulp.src(['app/[^_]*.html'])
	.pipe(rigger())
	.pipe(rename({
		basename: "index",
		extname: '.html'
	}))
	.pipe(gulp.dest('app'))
	.pipe(gulp.dest('dist'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('sass', function() {
	return gulp.src('app/sass/**/*.+(sass|scss)')
	.pipe(sass({
		includePaths: ['app/sprites'],
		outputStyle: 'expanded'})
		.on('error', sass.logError))
	.pipe(autoprefixer(['last 5 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('css-min', ['sass'], function() {
	return gulp.src(['app/css/**/[^_]*.css'])
	.pipe(concat('style.css'))
	.pipe(gulp.dest('dist/css'))
	.pipe(cssnano())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('dist/css'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts', function(){
	return gulp.src(['app/js/[^_]*.js'])
	.pipe(rigger())
	.pipe(rename({basename: "script"}))
	.pipe(gulp.dest('dist/js'))
	.pipe(uglify())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('dist/js'))
	.pipe(browserSync.reload({stream: true}));
});

// gulp.task('mainfiles', function() {
// 	return gulp.src(mainBowerFiles({
// 		"overrides" : {
// 			"bootstrap" : {
// 				"main" : [
// 				"./dist/js/bootstrap.min.js",
// 				"./dist/css/bootstrap.min.css",
// 				"./dist/css/bootstrap-theme.min.css"
// 				]
// 			},
// 			"jquery" : {
// 				"main" : [
// 				"./dist/jquery.min.js"
// 				]
// 			}
// 		}
// 	}))
// 	.pipe(gulp.dest('dist/libs'));
// });

gulp.task('sprite', function () {
	var spriteData = gulp.src('app/img/icons/*.png').pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: 'sprite.scss'
	}));
	return spriteData.pipe(gulp.dest('app/sprites'));
});

gulp.task('watch', ['html', 'css-min', 'scripts', 'browser-sync'], function() {
	//gulp.watch(['app/css/**/*.css'], ['css-min']);
	gulp.watch(['app/sass/**/*.sass', 'app/sass/**/*.scss'], ['css-min']);
	gulp.watch('app/js/**/*.js', ['scripts']);
	gulp.watch('app/*.html', ['html']);
	// gulp.watch('bower.json', ['mainfiles']);
});

gulp.task('clean', function() {
	return del.sync('dist');
});

gulp.task('clear-cache', function() {
	return cache.clearAll();
});

gulp.task('img', function() {
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeVievBox: false}],
		une: [pngquant()]
	})))
	.pipe(gulp.dest('dist/img'));
});

gulp.task('uncss-libs', function () {
	return gulp.src('dist/libs/*.css')
	.pipe(uncss({
		html: ['dist/index.html']
	}))
	.pipe(gulp.dest('dist/libs'));
});

gulp.task('uncss-css', function () {
	return gulp.src('dist/css/*.css')
	.pipe(uncss({
		html: ['dist/index.html']
	}))
	.pipe(gulp.dest('dist/css'));
});

gulp.task('build', ['clean', 'clear-cache', 'img', 'sass', 'mainfiles', 'css-min', 'scripts', 'uncss-libs', 'uncss-css'], function() {

	var buildFonts = gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'));
});