'use strict';
var insightModule2 = (function () {

    return {

		addThisQuestion: function () {
			var questionsOut = ' Are there SRs open for XYZ customer?'
			return questionsOut;
		},

		addThisDataType: function (subDataTypes, callback) {
			console.log('entering insightModule2 addThisDataType function')

			subDataTypes.push(

        {ItemName: "SEV 1", 	OpsConsoleName: "S1", 	suffixCode: "1"},
    		{ItemName: "SEV 2", 		OpsConsoleName: "S2", 	suffixCode: "2"},
    		{ItemName: "SEV 3", 		OpsConsoleName: "S3", 	suffixCode: "3"},
    		{ItemName: "SEV 4", 		OpsConsoleName: "S4", 	suffixCode: "4"},
    		{ItemName: "SEV 5", 	OpsConsoleName: "S5", 	suffixCode: "5"},
    		{ItemName: "SEV 7H", 	OpsConsoleName: "S7h", 	suffixCode: "6"},
    		{ItemName: "SEV 7M", 	OpsConsoleName: "S7M", 	suffixCode: "7"},
    		{ItemName: "SEV 7L", 	OpsConsoleName: "S7L", 	suffixCode: "8"}  );

			callback(subDataTypes);
		},

		addResponseLogic: function (customerInfo, reqType, request, response, callback) {
			var getDataFromMunger = require('./getDataFromMunger') // module to get lightweight sanitized 'insight' from s3
			var key = customerInfo.gdun + '.' + reqType.suffixCode + '.2'; // the .2 refers to munger1
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

					var speechOutput = 'There ' + isAre + ' ' + answer + ' SRs open at ' + customerInfo.customerName +
										' of severity ' + reqType.ItemName;

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

module.exports = insightModule2;
