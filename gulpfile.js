let projectFolder = "dist";
let sourceFolder = "src";

let path = {
  build: {
    html: projectFolder + "/",
    css: projectFolder + "/assets/styles/",
    js: projectFolder + "/assets/js/",
    img: projectFolder + "/assets/imgs/",
    fonts: projectFolder + "/assets/fonts/",
  },

  src: {
    html: [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"],
    css: sourceFolder + "/assets/styles/*.scss",
    js: sourceFolder + "/assets/js/script.js",
    img: sourceFolder + "/assets/imgs/**/*.{jpg,png,jpeg,webp}",
    fonts: sourceFolder + "/assets/fonts/**/*.{ttf,woff}",
  },
  watch: {
    html: sourceFolder + "/**/*.html",
    css: sourceFolder + "/assets/styles/**/*.scss",
    js: sourceFolder + "/assets/js/**/*.js",
    img: sourceFolder + "/assets/imgs/**/*.{jpg,png,jpeg,webp}",
    fonts: sourceFolder + "/assets/fonts/**/*.{ttf,woff}",
  },
  clean: "./" + projectFolder + "/",
};

let { src, dest } = require("gulp"),
  gulp = require("gulp"),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  scss = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  groupmedia = require("gulp-group-css-media-queries"),
  cleancss = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify-es").default,
  imagemin = require("gulp-imagemin"),
  webp = require("gulp-webp"),
  webphtml = require("gulp-webp-html"),
  webpcss = require("gulp-webp-css");

function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + projectFolder + "/",
    },
    port: 3000,
    notify: false,
  });
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
  gulp.watch([path.watch.fonts], fonts);
}

function clean(params) {
  return del(path.clean);
}

function css(params) {
  return (
    src(path.src.css)
      
      .pipe(
          scss({
              outputStyle: "expanded"
          })
      )
      .pipe(groupmedia())
      
      .pipe(
        autoprefixer({
          overrideBrowserslist: ["last 5 versions"],
          cascade: true,
        })
      )
      .pipe(webpcss())
      .pipe(dest(path.build.css))
      .pipe(browsersync.stream())
      .pipe(cleancss())
      .pipe(
        rename({
          extname: ".min.css",
        })
      )
      .pipe(dest(path.build.css))
      .pipe(browsersync.stream())
  );
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js",
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function images() {
  return src(path.src.img)

    .pipe(
        webp({
            quality: 70
        })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        interlaced: true,
        optimizationLevel: 3,
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}


function fonts() {
  return src(path.src.fonts)
    
    .pipe(dest(path.build.fonts))
    .pipe(browsersync.stream());
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);


exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
