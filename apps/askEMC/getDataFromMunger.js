'use strict';
var getDataFromMunger = (function () {
	
	var AWS = require( "aws-sdk" );
	AWS.config.loadFromPath(__dirname + '/AWSconfig.json');
	var	s3 = new AWS.S3();
	
	
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
						
		}		
	}
				
})();

module.exports = getDataFromMunger;
