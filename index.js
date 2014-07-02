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
        if (fs.existsSync("tmp.sass")){
          fs.unlinkSync("tmp.sass");
        }
        callback(null, css);
    }.bind(this);

    opt.error = function (err) {
        if (fs.existsSync("tmp.sass")){
          fs.unlinkSync("tmp.sass");
        }
        callback(err);
    };

    if(opt.format == 'sass') {
      fs.writeFileSync("tmp.sass", opt.data);
      delete opt.data;
      opt.file = "tmp.sass";
      sass.render(opt);
    } else {
      sass.render(opt);
    }
};
