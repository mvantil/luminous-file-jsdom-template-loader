var jsdom = require('jsdom'),
	async = require('async')
	fs = require('fs'),
	_ = require('underscore'),
	config = require('luminous-server-config'),
	TemplateRenderer = config.loadModule('templateRenderer');

var loaderConfig = config.load().templateLoader;
var path = loaderConfig.path,
	extension = loaderConfig.extension,
	defaultTemplate = loaderConfig.defaultTemplate;

function TemplateLoader() {
	function findTemplate(typeName, options, callback) {
		async.waterfall([function(callback) {
			fs.readFile(path + typeName + '.' + extension, function(err, content) {
				callback(null, content);
			});
		}, function(content, callback) {
			if (content) return callback(null, content);

			fs.readFile(path + defaultTemplate + '.ko', callback);
		}], function(err, content) {
			if (err) {
				return callback(err);
			}
			jsdom.env({
				html: content,
				done: function(err, result) {
					var element = _.chain(result.document.body.children)
					.filter(function(child) {
						return _.every(child.attributes, function(attr) {

							//jsdom does not retain case sensitivity!
							var key = _.chain(_.keys(options))
							.filter(function(item) {
								return item.toLowerCase() == attr.name;
							})
							.first()
							.value();

							return key ? options[key] == attr.value : false;
						});
					})
					.first()
					.value();
					callback(null, element ? element.innerHTML : null);
				}
			});
		})
	}

	this.load = function(typeName, options, callback) {
		if (typeof options == 'function') {
			callback = options;
			options = {};
		}

		findTemplate(typeName, options, function(err, html) {
			return callback(null, new TemplateRenderer(html));
		});
	};
}

module.exports = new TemplateLoader();