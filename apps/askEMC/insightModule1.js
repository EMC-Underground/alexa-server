'use strict';
var insightModule1 = (function () {

    return {
				
		addThisQuestion: function () {
			var questionsOut = ' How many of any given product is installed at a given customer?'
			return questionsOut;						
		},	
	
		addThisDataType: function (dataTypes, callback) {
			
			dataTypes.push(
		//		{ItemName: "ATMOS", 		OpsConsoleName:"Atmos", 						suffixCode:"1"},
				{ItemName: "AVOMAR", 		OpsConsoleName:"Avamar", 						suffixCode:"2"},
				{ItemName: "CLARIION", 		OpsConsoleName:"CLARiiON", 						suffixCode:"3"},
		//		{ItemName: "CAPTIVA", 		OpsConsoleName:"Captiva Products", 				suffixCode:"4"},
				{ItemName: "CELERRA", 		OpsConsoleName:"Celerra", 						suffixCode:"5"},
				{ItemName: "CENTERA", 		OpsConsoleName:"Centera", 						suffixCode:"6"},
		//		{ItemName: "CLOUDARRAY", 	OpsConsoleName:"CloudArray", 					suffixCode:"7"},
				{ItemName: "CONNECTRIX", 	OpsConsoleName:"Connectrix", 					suffixCode:"8"},
		//		{ItemName: "DSSD", 			OpsConsoleName:"DSSD", 							suffixCode:"9"},
				{ItemName: "DATADOMAIN", 	OpsConsoleName:"Data Domain", 					suffixCode:"10"},
		//		{ItemName: "DOCUMENTUM", 	OpsConsoleName:"Documentum", 					suffixCode:"11"},
				{ItemName: "ESRS", 			OpsConsoleName:"EMC Secure Remote Services", 	suffixCode:"12"},
				{ItemName: "ECS", 			OpsConsoleName:"Elastic Cloud Storage", 		suffixCode:"13"},
		//		{ItemName: "GREENPLUM", 	OpsConsoleName:"Greenplum", 					suffixCode:"14"},
				{ItemName: "EYESILON", 		OpsConsoleName:"Isilon", 						suffixCode:"15"},
		//		{ItemName: "NETWORKER", 	OpsConsoleName:"NetWorker Family", 				suffixCode:"16"},
		//		{ItemName: "PIVOTAL", 		OpsConsoleName:"Pivotal", 						suffixCode:"17"},
				{ItemName: "POWERPATH", 	OpsConsoleName:"PowerPath", 					suffixCode:"18"},
		//		{ItemName: "RSA", 			OpsConsoleName:"RSA", 							suffixCode:"19"},
				{ItemName: "RECOVER POINT",	OpsConsoleName:"RecoverPoint", 					suffixCode:"20"},
				{ItemName: "SCALEIO", 		OpsConsoleName:"ScaleIO Family", 				suffixCode:"21"},
		//		{ItemName: "SMARTS", 		OpsConsoleName:"Smarts", 						suffixCode:"22"},
		//		{ItemName: "SOURCEONE", 	OpsConsoleName:"SourceOne", 					suffixCode:"23"},
				{ItemName: "SYMMETRIX", 	OpsConsoleName:"Symmetrix", 					suffixCode:"24"},
				{ItemName: "UNITY", 		OpsConsoleName:"Unity Family",					suffixCode:"25"},
				{ItemName: "V MAX", 		OpsConsoleName:"VMAX Family", 					suffixCode:"26"},
				{ItemName: "VNX", 			OpsConsoleName:"VNX/VNXe Family", 				suffixCode:"27"},
				{ItemName: "VEEPLEX", 		OpsConsoleName:"VPLEX Series", 					suffixCode:"28"},
		//		{ItemName: "VSPEXBLUE", 	OpsConsoleName:"VSPEX BLUE Appliance", 			suffixCode:"29"},
				{ItemName: "VIPER", 		OpsConsoleName:"ViPR Family", 					suffixCode:"30"},
				{ItemName: "XTREMIO", 		OpsConsoleName:"Xtrem", 						suffixCode:"32"}   );
						
			callback(dataTypes);						
		},			

		addResponseLogic: function (customerInfo, reqType, request, response, callback) {
			var getDataFromMunger = require('./getDataFromMunger') // module to get lightweight sanitized 'insight' from s3			
			var key = customerInfo.gdun + '.' + reqType.suffixCode + '.1'; // the .1 refers to munger1
			console.log('key being used to retrieve insight: ' + '"' + key + '"');
			
			getDataFromMunger.getData(key, function (result) {	
				
				if (!result) {

					var speechOutput = 'That information doesn\'t seem to be available right now. Can I help with something else?';
					
				} else { // successfully pulled JSON inventory info
					console.log('result body = ' + result );
					var parsedResult = JSON.parse(result);
					var answer = parsedResult.answer;
					console.log('answer = ' + answer );				
					
					var addedS = "'s";
					var isAre = 'are';
				
					if (answer == '0') {
						answer = 'no';
					} else if (answer == '1') {
						isAre = 'is';
						addedS = '';
					} 

					if (reqType.ItemName == 'CONNECTRIX' || reqType.ItemName == 'POWERPATH') {
						addedS = "";
					}

					if (reqType.ItemName == 'SYMMETRIX') {
						var productToSay = 'Symm'
					} else if (reqType.ItemName == 'XTREMIO') {
						var productToSay = 'Extreme I O';						
					} else {
						var productToSay = reqType.ItemName;
					}

					var speechOutput = "There " + isAre + ' ' + answer + ' ' + productToSay + addedS +
										" installed at " + customerInfo.customerName + '. ';
										
					if (reqType.ItemName == 'ESRS') {
						if (answer == '0') {
							speechOutput = reqType.ItemName + " is not installed at " + customerInfo.customerName
										+ ". You should probably do something about that. "
						} else {
							speechOutput = reqType.ItemName + " is installed at " + customerInfo.customerName + ". Thank goodness. ";
						}						
					}

					if (reqType.ItemName == 'SYMMETRIX') {
						speechOutput += "That is sims only. If you are interested in VMAX, I can tell you about that too. ";					
					} else if (reqType.ItemName == 'VNX') {
						speechOutput += "That is VNX only. If you\'re interested in Clariion or Unity, Ican tell you about them too. ";				
					} else if (reqType.ItemName == 'Clariion') {
						speechOutput += "That is Clariion only. If you\'re interested in VNX or Unity, Ican tell you about them too. ";
					} else if (reqType.ItemName == 'Unity') {
						speechOutput += "That is Unity only. If you\'re interested in VNX or Clariion, Ican tell you about them too. ";
					}
					
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

module.exports = insightModule1;
