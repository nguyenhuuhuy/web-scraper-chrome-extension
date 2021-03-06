var SelectorLink = {
	canReturnMultipleRecords: function () {
		return true;
	},

	canHaveChildSelectors: function () {
		return true;
	},

	canHaveLocalChildSelectors: function () {
		return false;
	},

	canCreateNewJobs: function () {
		return true;
	},
	willReturnElements: function () {
		return false;
	},
	_getData: function (parentElement) {
		var elements = this.getDataElements(parentElement);

		var dfd = $.Deferred();

		// return empty record if not multiple type and no elements found
		if (this.multiple === false && elements.length === 0) {
			var data = {};
			data[this.id] = null;
			dfd.resolve([data]);
			return dfd;
		}

		// extract links one by one
		var deferredDataExtractionCalls = [];
		$(elements).each(function (k, element) {

			deferredDataExtractionCalls.push(function(element) {

				var deferredData = $.Deferred();

				var data = {};

				if (this.regex !== undefined && this.regex.length) {
					var matches = element.href.match(new RegExp(this.regex));

					if (matches !== null) {
						data[this.id] = $(element).text();
						data._followSelectorId = this.id;
						data[this.id + '-href'] = matches[0];
						data._follow = element.href;
					}
					else {
						data = undefined;
					}
				} else {
					data[this.id] = $(element).text();
					data._followSelectorId = this.id;
					data[this.id + '-href'] = element.href;
					data._follow = element.href;
				}


				deferredData.resolve(data);

				return deferredData;
			}.bind(this, element));
		}.bind(this));

		$.whenCallSequentially(deferredDataExtractionCalls).done(function(responses) {
			var result = [];
			responses.forEach(function(dataResult) {
				result.push(dataResult);
			});
			dfd.resolve(result);
		});

		return dfd.promise();
	},

	getDataColumns: function () {
		return [this.id, this.id + '-href'];
	},

	getFeatures: function () {
		return ['multiple', 'regex', 'delay']
	},

	getItemCSSSelector: function() {
		return "a";
	}
};