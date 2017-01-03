var loaderUtils = require('loader-utils');
var mime = require('mime');

var domains = null;
var basePath = null;
var index = 0;

module.exports = function (content) {
  if (this.cacheable) {
    this.cacheable();
  }
  var query = loaderUtils.parseQuery(this.query);
  var limit = (this.options && this.options.url && this.options.url.dataUrlLimit) || 0;
  if (query.limit) {
    limit = parseInt(query.limit, 10);
  }
  var mimetype = query.mimetype || query.minetype || mime.lookup(this.resourcePath);
  if (limit <= 0 || content.length < limit) {
    return 'module.exports = ' + JSON.stringify('data:' + (mimetype ? mimetype + ';' : '') + 'base64,' + content.toString('base64'));
  } else {
    var fileLoader = require('file-loader');
    var exp = fileLoader.call(this, content);
    exp = exp.replace(/\\\\/g, '/');
    if (query.basePath) {
      basePath = query.basePath;
    }
    if (!domains && query.domains) {
      var ret = decodeURIComponent(query.domains).split(',');
      domains = ret.length && (ret);
    }
    if (domains) {
      exp = '__webpack_public_path__ = "' + domains[(index++) % domains.length] + basePath + '"; ' + exp;
    }
    return exp;
  }
};
module.exports.raw = true;