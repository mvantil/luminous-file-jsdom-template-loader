var Luminous = require('Luminous');
var luminous = new Luminous();

describe("Luminous File jsdom Loader suite", function() {
	it("must be able to load generic templates without filters", function(done) {
		luminous.templateLoader.load('/missingType', function(err, result) {
			expect(result.html).toBe('Generic handler no filters');
			done();
		});
	});

	it("must be able to load generic templates with filters", function(done) {
		luminous.templateLoader.load('/missingType', {
			testFilter: 'test'
		}, function(err, result) {
			expect(result.html).toBe('Generic handler testFilter="test"');
			done();
		});
	});

	it("must be able to load generic templates without filters", function(done) {
		luminous.templateLoader.load('/string', function(err, result) {
			expect(result.html).toBe('String handler no filters');
			done();
		});
	});

	it("must be able to load generic templates with filters", function(done) {
		luminous.templateLoader.load('/string', {
			testFilter: 'test'
		}, function(err, result) {
			expect(result.html).toBe('String handler testFilter="test"');
			done();
		});
	});
});
