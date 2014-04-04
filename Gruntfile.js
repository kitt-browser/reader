module.exports = function(grunt) {

  // PATH where to store unzipped build
  var BUILD = process.env.KITT_EXT_BUILD_PATH || 'build';
  // PATH where to store final zip
  var DIST = process.env.KITT_EXT_DIST_PATH || 'dist';

  var EMBEDLY_TOKEN = process.env.READER_EMBEDLY_TOKEN;
  if (!EMBEDLY_TOKEN) {
      grunt.fail.fatal('You have to specify EmbedLy token.');
  }

  // Read extension manifest
  var manifest = grunt.file.readJSON('manifest.json');
  // Update version string
  var version = manifest.version.split('.');
  for (var i = version.length; i < 3; i++) {
    version.push(0);
  }
  version[2]++;
  manifest.version = version.join('.');

  var backgroundScripts = [];
  if (manifest.background && manifest.background.scripts) {
    backgroundScripts = manifest.background.scripts;
  }

  var contentScripts = [];
  if (manifest.content_scripts) {
    manifest.content_scripts.forEach(function(content) {
      contentScripts = contentScripts.concat(content.js || []);
    });
  }

  var html = 'html/**/*.html';
  var css = 'css/**/*.css';
  var js = 'js/**/*.js';

  // Grunt config
  grunt.initConfig({
    config: {
      dist: DIST,
      build: BUILD
    },
    typescript: {
      base: {
        src: ['js/**/*.ts'],
        dest: BUILD,
        options: {
          module: 'commonjs', //or commonjs
          target: 'es3', //or es3
          sourceMap: false,
          declaration: false
        }
      }
    },
    exec: {
      bower: {
        command: 'bower install'
      }
    },
    bumpup: {
      setters: {
        name: function(old, releaseType, options) {
          return manifest.name;
        },
        version: function(old, releaseType, options) {
          return manifest.version;
        },
        author: function(old, releaseType, options) {
          return manifest.author;
        },
        description: function(old, releaseType, options) {
          return manifest.description;
        }
      },
      files: [
        'manifest.json', 'bower.json', 'package.json'
      ]
    },
    copy: {
      main: {
        files: [
          {expand: true, src: [html, css, 'images/**/*', 'manifest.json', 'key.pem'], dest: BUILD},
          {expand: true, src: backgroundScripts, dest: BUILD},
          {expand: true, src: contentScripts, dest: BUILD}
        ]
      }
    },
    'string-replace': {
      dist: {
        files: {
          '<%= config.build %>/js/commons.js': '<%= config.build %>/js/commons.js'
        },
        options: {
          replacements: [{
            pattern: /<%== EMBEDLY_TOKEN ==>/ig,
            replacement: EMBEDLY_TOKEN
          }]
        }
      }
    },
    useminPrepare: {
      html: html,
      options: {
        flow: {
          steps: {js: ['concat'], css: ['concat']},
          post: []
        },
        dest: BUILD + '/html'
      }
    },
    usemin: {
      html: BUILD + '/' + html
    },
    crx: {
      main: {
        src: [BUILD+'/**'],
        dest: DIST,
        filename: manifest.name + '.crx',
        baseURL: 'http://localhost:8777/', // clueless default
        privateKey: BUILD+'/key.pem'
      }
    }
  });

  // Load task
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-bumpup');
  grunt.loadNpmTasks('grunt-crx');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-string-replace');

  grunt.registerTask('default', ['typescript', 'bumpup', 'exec:bower', 'copy', 'string-replace', 'crx']);
};
