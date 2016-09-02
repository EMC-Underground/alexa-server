
'use strict';
console.log('entering SMS.js');
var AWS = require("aws-sdk");

var SMS = (function () {
    // var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
	var sns = new AWS.SNS();

    return {
        sendTopicSubscribeRequest: function (phoneKey, callback) {
			console.log('entering SMS.createTopic function');			
			var topicName = {
			  Name: phoneKey.toString()
			};
			
			sns.createTopic(topicName, function(err, data) {
				console.log('sequence 1');
				if (err) {
					console.log(err, err.stack); // an error occurred
					callback('errorCreatingTopicARN'); 
				} else {
					console.log(JSON.stringify(data)); // successful response
					console.log('data.TopicArn = ' + data.TopicArn);
					var topicArn = data.TopicArn;
					console.log('topicArn = ' + topicArn);
																
					// now create the display name, which is a required attribute				
					var params = {
					  AttributeName: 'DisplayName',
					  TopicArn: topicArn, 
					  AttributeValue: 'Alexa text'
					};					
					sns.setTopicAttributes(params, function(err, data) {
						if (err) {
							console.log(err, err.stack); // an error occurred
						} else {
							//console.log('data = ' + data);           // successful response
							
							// now send the subscription request							
							console.log('entering sendSubscribeRequest portion');							
							var subscribeInputParams = {
							  Protocol: 'sms', 
							  TopicArn: topicArn, 
							  Endpoint: '1-' + phoneKey.toString() //'1-425-890-8484'
							};
											
							sns.subscribe(subscribeInputParams, function(err, data) {
								if (err) {
									console.log(err, err.stack); // an error occurred
								} else {
									console.log(JSON.stringify(data)); // successful response
								};
								console.log('stringified data = ' + JSON.stringify(data)); // successful response
								callback(topicArn); 
							});											
						};
					});																			
				};
			});			
        },
						
		
        publishSMS: function (incomingARN, incomingMessage, callback) {
			console.log('entering SMS.publishSMS function');							
	
			sns.publish({
				Message: incomingMessage,
				TopicArn: incomingARN
			}, function(err, data) {
				if (err) {
					console.log(err.stack);
					console.log(err, 'publishSMS function did not successfully complete.');
					var success = false;
				}
				console.log(JSON.stringify('return data from sns.publish call = ' + data));

				if (data) {
					console.log('publishSMS function successfully sent a text to ' + incomingARN);
					var success = true;					
				};
				
				// delay callback for 1 second to allow texts to arrive in order
				setTimeout(callBackAfterDelay, 200);

				function callBackAfterDelay() {
					callback(success);
				};		
			});
        }		
    };		

})();
console.log('exiting SMS.js');
module.exports = SMS;
