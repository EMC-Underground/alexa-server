'use strict';
var getCustomerInfoFromECS = (function () {

	var AWS = require( "aws-sdk" ),
		ECS = require( "aws-sdk" );
	
	var ECSconfig = {
	  s3ForcePathStyle: true,
	  endpoint: new AWS.Endpoint('http://10.4.44.125:9020')
	};
	
	// setup ECS config to point to Bellevue lab 
	ECS.config.loadFromPath(__dirname + '/ECSconfig.json'); // load ECS credentials
	
	var ecs = new ECS.S3(ECSconfig);
	
    return {
		
		getData: function (callback) {
			
			// get json data object from ECS bucket
			var params = {
					Bucket: 'pacnwinstalls',
					Key: 'PNWandNCAcustomers-small.json'
			};	  
			  
			ecs.getObject(params, function(err, data) {
				if (err) {
					callback(err); 
				} else { // success	
					// note: Body is outputted as type buffer which is an array of bytes of Body 				
					//console.log(data.Body.toString());					
					var dataPayload = JSON.parse(data.Body);
					//console.log('length of dataPayload= ' + dataPayload.length);
					
					callback(dataPayload) 
				}
			});																
		}		
	}
				
})();

module.exports = getCustomerInfoFromECS;
