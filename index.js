var temp = require('temp');
var util = require('util');
var fs = require('fs');
var utils = require('loader-utils');
var sass = require('node-sass');
var path = require('path');

module.exports = function (content) {
    this.cacheable();
    var callback = this.async();

    var opt = utils.parseQuery(this.query);
    opt.data = content;

    // set include path to fix imports
    opt.includePaths = opt.includePaths || [];
    opt.includePaths.push(path.dirname(this.resourcePath));
    if (this.options.resolve && this.options.resolve.root) {
        var root = [].concat(this.options.resolve.root);
        opt.includePaths = opt.includePaths.concat(root);
    }

    // output compressed by default
    opt.outputStyle = opt.outputStyle || 'compressed';
    opt.stats = {};

    opt.success = function (css) {
        // mark dependencies
        opt.stats.includedFiles.forEach(function(path) {
            this.addDependency(path);
        }, this);
        callback(null, css);
    }.bind(this);

    opt.error = function (err) {
      callback(err);
    };

    if(opt.format == 'sass') {
      opt.sourceComments == "none"
      temp.track();
      temp.open({suffix: '.sass'}, function(err, info) {
        if (err) throw err;
        fs.writeSync(info.fd, opt.data);
        fs.close(info.fd, function(err) {
          if (err) throw err;
          delete opt.data;
          opt.file = info.path;
          sass.render(opt);
        });
      });
    } else {
      sass.render(opt);
    }
};
