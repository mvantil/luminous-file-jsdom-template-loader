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
		var typeNameParts = typeName.split('/');
		var typeFileBase = '';
		var result = _.chain(typeNameParts)
		.filter(function(item) {
			return item.length > 0;
		})
		.map(function(item) {
			var newItem = typeFileBase + '/' + item;
			typeFileBase += '/' + item;
			return newItem;
		})
		.reverse()
		.value();
		result.push(defaultTemplate);

		var fileContent;
		async.detectSeries(result, function(item, callback) {
			fs.readFile(path + item + '.' + extension, function(err, content) {
				if (err) return callback(false);
				fileContent = content;
				callback(true);
			});
		}, function(result) {
			if (!result) return callback(new Error('Could not location matching template: ' + typeName));

			parseDom(fileContent, options, callback);
		});
	}

	function parseDom(content, options, callback) {
		jsdom.env({
			html: content,
			done: function(err, result) {
				if (err) return callback(err);

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

				if (!element) return callback(new Error('Did not return an element from template for ' + typeName + ' with options ' + JSON.stringify(options)));

				callback(null, element ? element.innerHTML : null);
			}
		});
	}

	this.load = function(typeName, options, callback) {
		if (typeof options == 'function') {
			callback = options;
			options = null;
		}
		options = options || {};

		findTemplate(typeName, options, function(err, html) {
			if (err) return callback(err);

			return callback(null, new TemplateRenderer(html));
		});
	};
}

module.exports = new TemplateLoader();