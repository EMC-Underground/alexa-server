'use strict';
var insightModule1 = (function () {

/** 	This module answers the question:
 *		How many VNX arrays? (Does a given customer have)
 *
 *		'DATATYPE' custom slot added: 'V.N.X.'
 *
 */

    return {
		
		
		addThisQuestion: function () {

			// load questions from other modules, add this one to the list and re-save
			var questionsOut = ' How many of any given product is installed at a given customer?'
			return questionsOut;						
		},	
	
		addThisDataType: function (dataTypes, callback) {
			
			dataTypes.push(
				//{ItemName: "ATMOS", OpsConsoleName:"Atmos", suffixCode:"1"},
				{ItemName: "AVAMAR", OpsConsoleName:"Avamar", suffixCode:"2"},
				{ItemName: "CLARIION", OpsConsoleName:"CLARiiON", suffixCode:"3"},
				//{ItemName: "CAPTIVA", OpsConsoleName:"Captiva Products", suffixCode:"4"},
				{ItemName: "CELERRA", OpsConsoleName:"Celerra", suffixCode:"5"},
				{ItemName: "CENTERA", OpsConsoleName:"Centera", suffixCode:"6"},
				//{ItemName: "CLOUDARRAY", OpsConsoleName:"CloudArray", suffixCode:"7"},
				{ItemName: "CONNECTRIX", OpsConsoleName:"Connectrix", suffixCode:"8"},
				{ItemName: "DSSD", OpsConsoleName:"DSSD", suffixCode:"9"},
				{ItemName: "DATADOMAIN", OpsConsoleName:"Data Domain", suffixCode:"10"},
				//{ItemName: "DOCUMENTUM", OpsConsoleName:"Documentum", suffixCode:"11"},
				{ItemName: "ESRS", OpsConsoleName:"EMC Secure Remote Services", suffixCode:"12"},
				//{ItemName: "ECS", OpsConsoleName:"Elastic Cloud Storage", suffixCode:"13"},
				//{ItemName: "GREENPLUM", OpsConsoleName:"Greenplum", suffixCode:"14"},
				{ItemName: "ISILON", OpsConsoleName:"Isilon", suffixCode:"15"},
				//{ItemName: "NETWORKER", OpsConsoleName:"NetWorker Family", suffixCode:"16"},
				//{ItemName: "PIVOTAL", OpsConsoleName:"Pivotal", suffixCode:"17"},
				{ItemName: "POWERPATH", OpsConsoleName:"PowerPath", suffixCode:"18"},
				//{ItemName: "RSA", OpsConsoleName:"RSA", suffixCode:"19"},
				{ItemName: "RECOVERPOINT", OpsConsoleName:"RecoverPoint", suffixCode:"20"},
				//{ItemName: "SCALEIO", OpsConsoleName:"ScaleIO Family", suffixCode:"21"},
				//{ItemName: "SMARTS", OpsConsoleName:"Smarts", suffixCode:"22"},
				//{ItemName: "SOURCEONE", OpsConsoleName:"SourceOne", suffixCode:"23"},
				{ItemName: "SYMMETRIX", OpsConsoleName:"Symmetrix", suffixCode:"24"},
				{ItemName: "UNITY", OpsConsoleName:"Unity Family", suffixCode:"25"},
				{ItemName: "VMAX", OpsConsoleName:"VMAX Family", suffixCode:"26"},
				{ItemName: "VNX", OpsConsoleName:"VNX/VNXe Family", suffixCode:"27"},
				{ItemName: "VPLEX", OpsConsoleName:"VPLEX Series", suffixCode:"28"},
				//{ItemName: "VSPEXBLUE", OpsConsoleName:"VSPEX BLUE Appliance", suffixCode:"29"},
				//{ItemName: "VIPR", OpsConsoleName:"ViPR Family", suffixCode:"30"},
				{ItemName: "XTREMIO", OpsConsoleName:"Xtrem", suffixCode:"32"} );
						
			callback(dataTypes);						
		},			

		addResponseLogic: function (customerInfo, reqType, callback) {
			var getDataFromMunger = require('./getDataFromMunger') // module to get lightweight sanitized 'insight' from s3			
			var key = customerInfo.gdun + '.' + reqType.suffixCode;
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
				
					if (answer == '0') {
						answer == 'no';
					}
					
					if (reqType.ItemName == 'SYMMETRIX') {
						reqType.ItemName = 'Symm';
					}

					if (reqType.ItemName == 'CONNECTRIX' || reqType.ItemName == 'POWERPATH') {
						addedS = "";
					}				

					var speechOutput = "There are " + answer + ' ' + reqType.ItemName + addedS +
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
						speechOutput += "That is VNX only. If you are interested in Clariion or Unity, I can tell you about them too. ";				
					} else if (reqType.ItemName == 'Clariion') {
						speechOutput += "That is Clariion only. If you are interested in VNX or Unity, I can tell you about them too. ";
					} else if (reqType.ItemName == 'Unity') {
						speechOutput += "That is Unity only. If you are interested in VNX or Clariion, I can tell you about them too. ";
					}	
									
					speechOutput += 'What else are you interested in?';												
				};	
				
				callback(speechOutput);
			});						
		}		
	}
				
})();

module.exports = insightModule1;
