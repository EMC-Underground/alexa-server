'use strict';
var insightModule4 = (function () {

    return {

		addThisQuestion: function () {
			var questionsOut = ' How many systems does Customer XYZ have in a given state?'
			return questionsOut;
		},

		addThisDataType: function (subDataTypes, callback) {
			console.log('entering insightModule4 addThisDataType function')

			subDataTypes.push(

				{ItemName: "WASHINGTON", 	OpsConsoleName: "WA", 	suffixCode: "1"},
				{ItemName: "OREGON", 		OpsConsoleName: "OR", 	suffixCode: "2"},
				{ItemName: "IDAHO", 		OpsConsoleName: "ID", 	suffixCode: "3"},
				{ItemName: "ARIZONA", 		OpsConsoleName: "AZ", 	suffixCode: "4"},
				{ItemName: "CALIFORNIA", 	OpsConsoleName: "CA", 	suffixCode: "5"}  );

			callback(subDataTypes);
		},

		addResponseLogic: function (customerInfo, reqType, request, response, callback) {
			var getDataFromMunger = require('./getDataFromMunger') // module to get lightweight sanitized 'insight' from s3
			var key = customerInfo.gdun + '.' + reqType.suffixCode + '.4'; // the .4 refers to munger4
			console.log('key being used to retrieve insight: ' + '"' + key + '"');

			getDataFromMunger.getData(key, function (result) {

				if (!result) {

					var speechOutput = 'That information doesn\'t seem to be available right now. Can I help with something else?';

				} else { // successfully pulled JSON inventory info
					console.log('result body = ' + result );
					var parsedResult = JSON.parse(result);
					var answer = parsedResult.answer;
					console.log('answer = ' + answer );

					var isAre = 'are';

					if (answer == '0') {
						answer = 'no';
					} else if (answer == '1') {
						isAre = 'is';
					}

					var speechOutput = 'There ' + isAre + ' ' + answer + ' systems installed at ' + customerInfo.customerName +
										' in their ' + reqType.ItemName + ' data centers.';

					// rotate language used
					var counter = request.session('counter'); // pull the counter from session
					if (!counter) { // counter needs to be initialized
						counter = 1
					} else {
						counter++ // increment the counter
					}

					console.log('counter = ' + counter);
					response.session('counter', counter); // re-store the counter in session

					if (counter == 1) {
						speechOutput += '<break time=\"0.4s\" />What else are you interested in?';
					} else if (counter == 2) {
						speechOutput += '<break time=\"0.4s\" />What else can I help with?';
					} else if (counter == 3) {
						speechOutput += '<break time=\"0.4s\" />What other information would you like to hear?';
					} else if (counter == 4) {
						speechOutput += '<break time=\"0.4s\" />What next?';
						response.session('counter', 0); // reset the counter in session
					}
				};

				callback(speechOutput);
			});
		}
	}

})();

module.exports = insightModule4;
