'use strict';
var getDataFromMunger = (function () {

	var AWS = require( "aws-sdk"),
		cfenv = require("cfenv");
	
	// try and set the vcap from a local file, if it fails, appEnv will be set to use
	// the PCF user provided service specified with the getServiceCreds call
	var localVCAP  = null	
	try {
		localVCAP = require("./local-vcap.json")
		} catch(e) {}
		
	var appEnv = cfenv.getAppEnv({vcap: localVCAP}) // vcap specification is ignored if not running locally
	var AWScreds  = appEnv.getServiceCreds('aws-creds-service') || {}
	var ECScreds  = appEnv.getServiceCreds('ecs-creds-service') || {}

	var AWSconfig = {
	  region: AWScreds.region,
	  accessKeyId: AWScreds.accessKeyId,
	  secretAccessKey: AWScreds.secretAccessKey
	};
	var s3 = new AWS.S3(AWSconfig);

    return {

		getData: function (key, callback) {

			// get the data from the s3 bucket
			var s3params = {
					Bucket: 'munger-insights',
					Key: key
				};

			s3.getObject(s3params, function(err, data) {
				if (err) {
					console.log('Error getting s3 object: ' + err);
					callback();
				} else {
					// successful response
					//console.log('data = ' + data.Body.toString() );
					callback(data.Body.toString() );
				}
			});

		},

		getURL: function (key, callback) {

			// get the data from the s3 bucket
			var s3params = {
					Bucket: 'munger-insights',
					Key: key
				};

			var url = s3.getSignedUrl('getObject', s3params)
			console.log('The URL is', url);
			callback(url);
		}
}

})();

module.exports = getDataFromMunger;
