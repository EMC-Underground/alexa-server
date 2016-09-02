
/***************************************************************************************************************
****************************************************************************************************************

This is a front end app servicing requests via Alexa for EMC info.
It is set up to be hosted on Pivotal Cloud Foundry.

Ideas for more modules:

- report any outstanding sev 1 SRs
- report the number of sev 1s in the last X time periods
- provide the number of outstanding SRs
- provide the average age of SRs.

/***************************************************************************************************************
****************************************************************************************************************/


module.change_code = 1;
'use strict';

var alexa = require( 'alexa-app' ), // this app uses the alexa-app node module
	SMS = require('./SMS'),
	app = new alexa.app( 'askEMC' ), // name of this app
	speechOutput, // what to say back to the user
	repromptOutput, // what to say if the user doesn't answer
	paginationSize = 5, // specifies the number of customer names to say at one time
	listOfQuestions = '', // a description for the user of all the questions they can ask 
	dataTypes = []; // an array that gets populated with other arrays, each of which contain the different kind of things 
					// a user can ask about for a given customer.
					// examples: 	dataTypes[0] = VNX, RecoverPoint, Avamar, Symmetrix (see insightModule1.addThisDataType )
					//				dataTypes[1] = Washington, Oregon, Idaho, Arizona, California
					// This can be expanded to include SR information, such as answering the question:
					// 'Does T-Mobile have any outstanding sev ones?, where 'sev ones' will be a dataType array
	
/****************************************************
For each module: Add insight modules below. 
*****************************************************/
var insightModule1 = require('./insightModule1');
var insightModule2 = require('./insightModule2');	

	
	
/****************************************************
For each module: Add the question that can be asked by a user. 
*****************************************************/	
listOfQuestions += insightModule1.addThisQuestion(); 
listOfQuestions += insightModule2.addThisQuestion(); 



/****************************************************
For each module: Add DataType that can be asked about for a given customer 
*****************************************************/	
dataTypes[0] = [] // the 1st item in the dataTypes array is a new empty array we will now populate with products
insightModule1.addThisDataType(dataTypes[0], function (subDataTypesAdded) { dataTypes[0] = subDataTypesAdded; });
// Now dataTypes[0] holds an array of products, each one is an object such as: {ItemName: "ATMOS", OpsConsoleName:"Atmos", suffixCode:"1"}

dataTypes[1] = [] // the 2nd item in the dataTypes array is a new empty array we will now populate with states
insightModule2.addThisDataType(dataTypes[1], function (subDataTypesAdded) { dataTypes[1] = subDataTypesAdded; });
// Now dataTypes[1] holds an array of states, each one is an object such as {ItemName: "Washington", OpsConsoleName: "WA", suffixCode: "1"}


console.log('**************************************************************************************************************')
for (var i = 0; i < dataTypes.length; i++) { // loop through each dataType (dataType[0] is products, dataType[1] is states...)
	
	for (var x = 0; x < dataTypes[i].length; x++) { // loop through each array of possible dataType items (ex: products)

		console.log('dataTypes[' + i + '][' + x + '] = ' + JSON.stringify(dataTypes[i][x]) );		

	}
}
console.log('**************************************************************************************************************')

/**
 * Both the one-shot and dialog based paths lead to this method to get the specific request the user is looking for
 */
function getSpecificRequest(customerInfo, reqType, request, response) {
	console.log('entering getSpecificRequest function');
	console.log('customerInfo.gdun = ' + customerInfo.gdun);
	console.log('reqType.ItemName = ' + reqType.ItemName);
	
	/****************************************************
	Add one entry for each module below
	*****************************************************/	
	// 		
	for (var i = 0; i < dataTypes.length; i++) { // loop through each dataType (dataType[0] is products, dataType[1] is states...)
		
		for (var x = 0; x < dataTypes[i].length; x++) { // loop through each array of possible dataType items (ex: products)
		
			if (dataTypes[i][x].ItemName == reqType.ItemName) { //if one of the dataType items matches what the user specified
			
				if (i == 0) { // if item was a match in the 1st array, we know it was a product aka insightModule1 should be used
					insightModule1.addResponseLogic(customerInfo, reqType, request, response, function(userResponseText) { // get the response to give the user
						var repromptOutput = 'What else can I help you with?';
						response.say(userResponseText).reprompt(repromptOutput).shouldEndSession( false );	
						// Must call send to end the original request
						response.send();
					});						
				} else if (i == 1) { // if item was a match in the 2nd array, we know it was a state aka insightModule2 should be used
					insightModule2.addResponseLogic(customerInfo, reqType, request, response, function(userResponseText) { // get the response to give the user
						var repromptOutput = 'What else can I help you with?';
						response.say(userResponseText).reprompt(repromptOutput).shouldEndSession( false );	
						// Must call send to end the original request
						response.send();
					});	
				}					
			}
		}
	}	
}

	

// load the local file that is built in the Jenkins PCF deployment process:
var CUSTOMERS = require('./customers.json');
console.log('CUSTOMERS = ' + JSON.stringify(CUSTOMERS))
	
// on skill launch with no intent specified:
app.launch( function( request, response ) {	
	handleWelcomeRequest(response);	
} );

// error handling for alexa-app
app.error = function( exception, request, response ) {
	console.log(exception)
	console.log(request);
	console.log(response);	
	response.say( 'Sorry an error occured ' + error.message);
};

// intent handler for user providing either neither, one or both of the following: 1) Customer and 2) dataType, where dataType is from predefined list
// examples of dataType include products (VMAX, VNX etc...), states where gear may be installed (WA, OR etc...), ...
app.intent('OneShotGetDataIntent',
	{	  
		"slots": 
			{
				"Customer": "CUSTOMER",
				"DataType": "DATATYPE"
			},
	   
		"utterances":
			// alexa-app builds the utterances file for copy/paste into Alexa skill when deployed	
			[ 
				"{-|DataType} at {-|Customer}",
				"{-|Customer} {-|DataType}",
				"{-|Customer} in {-|DataType}",
				"{get|get me|get me any|tell|tell me|tell me any|tell me about|tell me about any|give|give me|give me any} {data|some data|information|some information}",
				"{get|get me|get me any|tell|tell me|tell me any|tell me about|tell me about any|give|give me|give me any} {data|some data|information|some information} {on|about} {-|DataType}",				
				"{get|get me|get me any|tell|tell me|tell me any|tell me about|tell me about any|give|give me|give me any} {-|DataType}",
				"{get|get me|get me any|tell|tell me|tell me any|tell me about|tell me about any|give|give me|give me any} {data|some data|information|some information} {on|about} {-|Customer}",	
				"{get|get me|get me any|tell|tell me|tell me any|tell me about|tell me about any|give|give me|give me any} {-|Customer}",				
				"{get|get me|get me any|tell|tell me|tell me any|tell me about|tell me about any|give|give me|give me any} {data|some data|information|some information} {on|about} {-|DataType} {at|for} {-|Customer}",
				"{get|get me|get me any|tell|tell me|tell me any|tell me about|tell me about any|give|give me|give me any} {-|DataType} {at|for} {-|Customer}",
				"{how many} {-|DataType} {arrays|frames|boxes|solutions |} {does} {-|Customer} {have}",	
				"{how many} {-|DataType} {arrays|frames|boxes|solutions |} {are at|are installed at} {-|Customer}",
				"Does {-|Customer} {use|have|own} {any |} {-|DataType} {arrays |}",
				"Is {-|DataType} {out|installed|used} at {-|Customer}",
				"How many {systems|products|solutions} does {Customer} have in {-|DataType}" 
			]
						
	},
 
	function (request, response) { 
        console.log('entering OneShotGetDataIntent');
		console.log('request.slot.Customer = ' + request.slot('Customer'));
		console.log('request.slot.DataType = ' + request.slot('DataType'));		
		handleOneshotDataRequest(request, response);
		// Return false immediately so alexa-app doesn't send the response
		return false;
	}
);

// intent handler for user providing one piece of input between dataType and Customer, prompt for the other if data is not already stored in session.
app.intent('DialogGetDataIntent',
	{	  
		"slots": 
			{
				"Customer": "CUSTOMER", // format is 'CustomSlotName: CustomSlotType'. CustomSlotType must be specified in the skill interface's interaction model
				"DataType": "DATATYPE"	// same as above
			},
	   
		"utterances":
		
			[ 
				"{-|Customer}",
				"{-|DataType}"
			]
	},
 
	function (request, response) { 
        console.log('entering DialogGetDataIntent');
		console.log('request.slot.Customer = ' + request.slot('Customer'));
		console.log('request.slot.DataType = ' + request.slot('DataType'));
		var customerSlot = request.slot('Customer');
		var dataTypeSlot = request.slot('DataType');

        if (customerSlot) {
            handleCustomerNameDialogRequest(request, response);
        } else if (dataTypeSlot) {
            handleDataTypeDialogRequest(request, response);
        } else {
            handleNoSlotDialogRequest(request, response);
        }		
		// Return false immediately so alexa-app doesn't send the response
		return false;	
	}
);

// intent handler for user asking for an SO number for a given customer
app.intent('GetSOIntent',
	{	  
		"slots": 
			{
				"Customer": "CUSTOMER"
			},
	   
		"utterances":
			// alexa-app builds the utterances file for copy/paste into Alexa skill when deployed	
			[ 
				"{for|get|get me|tell me|what is|I need|about} {an S.O.|an S.O. number|S.O.|S.O. number|sales order|sales order number} for {-|Customer}",
				"{for|get|get me|tell me|what is|I need|about} an S.O. number",
				"{S.O.|S.O. number|sales order|sales order number} {information|data|info} for {-|Customer}"
			]						
	},
 
	function (request, response) { 
        console.log('entering GetSOIntent');
		console.log('request.slot.Customer = ' + request.slot('Customer'));	
		handleSOrequest(request, response);
		// Return false immediately so alexa-app doesn't send the response
		return false;
	}
);

// intent handler for user providing a serial number in order to hear the corresponding SO number
app.intent('SerialNumberProvidedIntent',
	{	  
		"slots": 
			{
				"SN": "SERIALNUMBER"
			},
	   
		"utterances":
			// alexa-app builds the utterances file for copy/paste into Alexa skill when deployed	
			[ 
				"{SN|serial number} {-|SN}",
				"{-|SN}"
			]						
	},
 
	function (request, response) { 
        console.log('entering SerialNumberProvidedIntent');
		console.log('request.slot.SN = ' + request.slot('SN'));
		handleSerialNumberProvided(request, response);
		// Return false immediately so alexa-app doesn't send the response
		return false;
	}
);

// intent handler for user asking what information they can get about a given customer
app.intent('SupportedQuestionsIntent',
	{	  	   
		"utterances":
		
			[ 
				"{what | which} {questions |} {do you know about | do you know | do you have information for | do you have information about | are supported | can I ask about | can you tell me about  | can you provide information for | can you provide information on | can you provide information about}"
			]
	},
 
	function (request, response) { 
        console.log('entering SupportedQuestionsIntent');
		handleSupportedQuestions(request, response);		
	}
);

// intent handler for user asking for what customers they can inquire about
app.intent('SupportedCustomersIntent',
	{	  	   
		"utterances":
		
			[ 
				"{what | which} {customers | accounts | companies} {do you know about | do you know | do you have information for | do you have information about | are supported | can I ask about | can you tell me about  | can you provide information for | can you provide information on | can you provide information about}"
			]
	},
 
	function (request, response) { 
        console.log('entering SupportedCustomersIntent');
		handleInitialList(request, response);		
	}
);

// intent handler for user asking for what customers they can inquire about
app.intent('ContinueCustomerListIntent',
	{	  	   
		"utterances":
		
			[ 
				"{hear | say | tell me} {more | more customers}"
			]
	}, 
 
	function (request, response) { 
        console.log('entering SupportedCustomersIntent');
		handleContinueList(request, response);		
	}
);

// intent handler for user asking for an SO number for a given customer
app.intent('SendTextIntent',
	{	  
		"slots": 
			{
				"Customer": "CUSTOMER"
			},
	   
		"utterances":
			// alexa-app builds the utterances file for copy/paste into Alexa skill when deployed	
			[ 
				"{send me a {text|dashboard} for {-|Customer}",
			]						
	},
 
	function (request, response) { 
        console.log('entering SendTextIntent');
		console.log('request.slot.Customer = ' + request.slot('Customer'));	
		handleSendTextRequest(request, response);
		// Return false immediately so alexa-app doesn't send the response
		return false;
	}
);



//TODO implement the yes/no intents
//app.intent('YesIntent',
//    {"utterances":config.utterances.Yes
//    },function(request,response) {
//        response.say('I heard you say yes, this has not been implemented yet');
//    });
//
//app.intent('NoIntent',
//    {"utterances":config.utterances.No
//    },function(request,response) {
//        response.say('I heard you say no, this has not been implemented yet');
//    });
//

app.intent('StopIntent',
    {"utterances": [ "{stop | end | quit | exit}" ]
    },function(request,response) {
        console.log('REQUEST:  Stopping...');
        response.say("OK, stopping.").send();
    });

app.intent('CancelIntent',
    {"utterances": [ "{cancel | cancel that}" ]
    },function(request,response) {
        console.log('REQUEST:  Cancelling...');
        response.say("Cancelling that.").send();
    });

app.intent('HelpIntent',
    {"utterances": [ "{help}" ]
    },function(request,response) {
        console.log('REQUEST:  Help...');
		handleWelcomeRequest(response);
    });

function handleSendTextRequest(request, response) {
	console.log('entering handleSendTextRequest');	
	var ARNtoSend = 'arn:aws:sns:us-east-1:863554537735:emc';
	var textToSend = 'IT WOOOORKED!';

	SMS.publishSMS(ARNtoSend, textToSend, function (success) {
		console.log('returned success = ' + success);
		if (success == true) {
			speechOutput = 'Text sent.'
			repromptOutput = 'What would you like to hear about?';

		} else {
			speechOutput = 'Hmm, there was a problem sending the text.'
			repromptOutput = 'What else can I help with?';

		}
		response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
	})
};	
	
function handleSupportedQuestions(request, response) {
		
	speechOutput = 'Here are some questions I can answer: '
				+ listOfQuestions
				+ ' What would you like to know?';

	repromptOutput = 'What would you like to hear about?';

	response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
};

function handleWelcomeRequest(response) {
	speechOutput = 'Hi there. I can provide quick customer info on the go. ' 
				+ 'How can I help?';

	repromptOutput = 
		"I can lead you through providing a customer name and "
			+ "what type of data you are looking for, "
			+ "or you can simply ask a question like, "
			+ "What warranties are about to expire at Starbucks, or, tell me about any sev ones for Microsoft. "
			+ "For a list of supported customers, ask what customers I know about. ";

	response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
};

/**
 * Handles the case where the user asked for information all at once and deals with any missing information
 * Examples: 	'tell me about any sev 1s at Microsoft'
 * 				'get maintenance information for LinkedIn'
 * 				'give me service request data for Nike'
 */
function handleOneshotDataRequest(request, response) {
	console.log('entering handleOneshotDataRequest function');

    // Determine customer the user is interested in
    var customerInfo = getGdunFromIntent(request);
	// Determine which product the user is interested in
    var reqType = getRequestTypeFromIntent(request);
	
	response.session('customerInfo', customerInfo); // not needed immediately, but set this so we have access to customer name later

	console.log('customerInfo = ' + JSON.stringify(customerInfo));
	console.log('reqType = ' + JSON.stringify(reqType));
	
    if (customerInfo.error) {
        // invalid customer. Move to the dialog by prompting to fire DialogGetDataIntent
        // if we received a value for an unknown customer, repeat it to the user, otherwise we received an empty slot
        speechOutput = "I'm sorry, I don't have any data for ";
		if (customerInfo.customerName) { 
			speechOutput += customerInfo.customerName + ". What else can I help you with?";
		} else {
			speechOutput += "that. What else can I help you with?";
		}		
        repromptOutput = "What else can I help you with?";						
        response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
		// Must call send to end the original request
		response.send();
        return;
    }

	// no error, so set this so we have access to customer name later
	response.session('customerInfo', customerInfo);	
	
    if (reqType.error) {
        // Invalid request type. Set customer in session and prompt for request type which will fire DialogGetDataIntent
		repromptOutput = " What would you like to hear about?";	
        speechOutput = "I didn't catch what you wanted to hear about  ";
		var custInfo = request.session('customerInfo')
		if (custInfo) {
			speechOutput += ' at ' + custInfo.customerName;
		}	
	
        response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
		// Must call send to end the original request
		response.send();		
        return;
    }
	
	// no error, so set this so we have access to user's request type later	
	response.session('dataType', reqType); 

    // all slots filled, either from the user or by default values. Move to final request
    getSpecificRequest(customerInfo, reqType, request, response);
}

/**
 * Handles the dialog step where the user provides a customer name
 */
function handleCustomerNameDialogRequest(request, response) {
	console.log('entering handleCustomerNameDialogRequest function');

    // Determine customer
    var customerInfo = getGdunFromIntent(request);	
		
    if (customerInfo.error) {
        // invalid customer. Move to the dialog by prompting to fire DialogGetDataIntent
        // if we received a value for an unknown customer, repeat it to the user, otherwise we received an empty slot
        speechOutput = "I'm sorry, I don't have any data for ";
		if (customerInfo.customerName) { 
			speechOutput += customerInfo.customerName + ". What else can I help you with?";
		} else {
			speechOutput += "that. What else can I help you with?";
		}		
        repromptOutput = "What else can I help you with?";						
        response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
		// Must call send to end the original request
		response.send();
        return;
    }
	
	// no error, so set this so we have access to customer name later
	response.session('customerInfo', customerInfo);

    // if we don't have the request type yet, go ask for it. If we have the request type, perform the final request
    if ( request.session('dataType') ) {
        getSpecificRequest(customerInfo, request.session('dataType'), request, response);
    } else {
		if (request.session('SOrequest') == 'TRUE') {
			// customer slot filled, prompt for serial number
			speechOutput = "OK. For what serial number";
			if (customerInfo.customerName) { 
				speechOutput += " at " + customerInfo.customerName + "?";
			} else {
				speechOutput += "?";
			}		
			repromptOutput = "For what serial number?";						
			response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
			// Must call send to end the original request
			response.send();		
		} else {
			// prompt for request type
			repromptOutput = "Options include product names, states and serial numbers. ";
			speechOutput = "What would you like to hear about for " + customerInfo.customerName + "?";
			response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
			// Must call send to end the original request
			response.send();			
		}

    }
}

/**
 * Handles the dialog step where the user provides the type of request (inventory, sev 1's or service requests)
 */
function handleDataTypeDialogRequest(request, response) {
	console.log('entering handleDataTypeDialogRequest function');

    // Determine request type (inventory, sev 1's, service requests)
    var reqType = getRequestTypeFromIntent(request);
	
    if (reqType.error) {
        // Invalid request type. Prompt for request type which will re-fire DialogGetDataIntent
		repromptOutput = "What would you like?"
        speechOutput = "I can provide information on ";
		if ( request.session('customerInfo') ) {
			speechOutput += request.session('customerInfo').customerName;
		}
		speechOutput += " products, states and serial numbers. What would you like to hear about?";
        response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
		// Must call send to end the original request
		response.send();
        return;
    }
	
	// set this so we have access to user's request type later
	response.session('dataType', reqType); 

    // if we don't have a customer name yet, go get it. If we have a customer name/gdun, perform the final request
    if ( request.session('customerInfo') ) {
        getSpecificRequest( request.session('customerInfo'), reqType, request, response );
    } else {
        // The user provided the request type but no customer name. Prompt for customer name.
        speechOutput = "Which customer would you like " + reqType.displayDataType  + " information for?";
        repromptOutput = "For which customer?";
		response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
		// Must call send to end the original request
		response.send();
    }
}

/**
 * Handle no slots, or slot(s) with no values
 */
function handleNoSlotDialogRequest(request, response) {
	console.log('entering handleNoSlotDialogRequest function');
	
    if ( request.session('customerInfo') ) {
        // get request type re-prompt
        repromptOutput = "What are you interested in hearing about? Options include product names, serial numbers and states.";
        speechOutput = repromptText;
		response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
		// Must call send to end the original request
		response.send();
    } else {
        // get customer name re-prompt
        handleSupportedCustomersRequest(request, response);
    }
}

/**
 * Gets the customer gdun from the intent, or returns an error
 */
function getGdunFromIntent(request) {
	console.log('entering getGdunFromIntent function');

	var customerSlot = request.slot('Customer')
	
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!customerSlot) {
            return {
                error: true
            }

    } else {
        // lookup the customer
		var capsCustomerWithPeriods = customerSlot.toUpperCase();
		capsCustomer = capsCustomerWithPeriods.split('.').join(""); // remove the dots, e.g. ST. LUKES -> ST LUKES
		console.log('capsCustomer = ' + capsCustomer );		
				
		for (var customer in CUSTOMERS) {
			// skip loop if the property is from prototype
			if (!CUSTOMERS.hasOwnProperty(customer)) continue;

			var thisCustomer = CUSTOMERS[customer];
			if (thisCustomer.customer == capsCustomer) {
				console.log('************* THERE IS A CUSTOMER MATCH *****************')
				console.log('customer gdun for ' + capsCustomer + ' = ' + thisCustomer.gduns)
				return {
					customerName: capsCustomer,
					gdun: thisCustomer.gduns
				}
			}			
		}		
		
		return {
			error: true,
			customerName: capsCustomer
		}      
    }
}

/**
 * Gets the request type from the intent or returns an error
 */
function getRequestTypeFromIntent(request) {
	console.log('entering getRequestTypeFromIntent function');

    var dataTypeSlot = request.slot('DataType');

    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!dataTypeSlot) {

        return {
            error: true		
        }
		
    } else {
		
		var capsDataType = dataTypeSlot.toUpperCase();
		console.log('capsDataType = ' + capsDataType );
		
		
		for (var i = 0; i < dataTypes.length; i++) { // loop through each dataType (dataType[0] is products, dataType[1] is states...)
			
			for (var x = 0; x < dataTypes[i].length; x++) { // loop through each array of possible dataType items (ex: products)
			
				//console.log('dataTypes[i][x].ItemName = ' + dataTypes[i][x].ItemName)
				if (dataTypes[i][x].ItemName == capsDataType) { //if one of the dataType items matches what the user specified				
					console.log('************* THERE IS A DATA TYPE MATCH *****************')
					var dataType = dataTypes[i][x];
					dataType.displayDataType = capsDataType;
					return dataType;						
				}
			}
		}					
		
		// if the return above isn't triggered, return error:true because there was no match
		return {
			error: true, 
			displayDataType: capsDataType		
		}						       
    }
}

/**
 * Handles the case where the user asked or for which customers they can ask about
 */
function handleInitialList(request, response) {
	console.log('entering handleInitialList function');
	
	repromptOutput = "Which customer would you like information for?";
	speechOutput = "Currently, I know information about " + CUSTOMERS.length + " customers. They include:" 

	var includedName = 0;
	
	for (i = 0; i < paginationSize; i++) {
		
		// make sure we aren't at the end of the customer list
		if (includedName >= CUSTOMERS.length) {
			break;
		}
		
		console.log('name to say = ' + CUSTOMERS[includedName].customer)
		speechOutput = speechOutput + "<p>" + CUSTOMERS[includedName].customer + "</p> ";
		
		// go to the next name on the list
		includedName++;
	}
	
	// store in session where we are at in the list of customer names 
	console.log('now at customer: ' + CUSTOMERS[includedName].customer)
	response.session('includedName', includedName);
	
	if (includedName < CUSTOMERS.length) {
		speechOutput = speechOutput + "To have me continue, say, hear more.";
	}	

	response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
}

/**
 * Handles the case where the user wants to hear more customers they can ask about
 */
function handleContinueList(request, response) {
	console.log('entering handleContinueList function');
	
	speechOutput = '';
	repromptOutput = "Which customer would you like information for?";

	// load from session where we are at in reading off the list of customer names available
	var includedName = request.session('includedName');
	
	if (!includedName) {
		includedName = 0;
	}
	
	for (i = 0; i < paginationSize; i++) {
		
		// make sure we aren't at the end of the customer list
		if (includedName >= CUSTOMERS.length) {
			break;
		}
		
		console.log('name to say = ' + CUSTOMERS[includedName].customer)
		speechOutput = speechOutput + "<p>" + CUSTOMERS[includedName].customer + "</p> ";
		
		// go to the next name on the list
		includedName++;
	}
	
	// store in session where we are at in the list of customer names 
	console.log('now at customer: ' + CUSTOMERS[includedName].customer)
	response.session('includedName', includedName);
	
	if (includedName < CUSTOMERS.length) {
		speechOutput = speechOutput + "To have me continue, say hear more.";
	}	

	response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
}


/**
 * Handles the case where the user asks for an SO number for a given customer
 */
function handleSOrequest(request, response) {
	console.log('entering handleSOrequest function');

    // Determine customer the user is interested in
    var customerInfo = getGdunFromIntent(request);
	
	response.session('customerInfo', customerInfo); // not needed immediately, but set this so we have access to customer name later

	console.log('customerInfo = ' + JSON.stringify(customerInfo));
	
    if (customerInfo.error) {
        // invalid customer. Move to the dialog by prompting to fire DialogGetDataIntent
        // if we received a value for an unknown customer, repeat it to the user, otherwise we received an empty slot
        speechOutput = "I'm sorry, I don't have any data for ";
		if (customerInfo.customerName) { 
			speechOutput += customerInfo.customerName + ". What else can I help you with?";
		} else {
			speechOutput = "For what customer?";
		}		
        repromptOutput = "For what customer?";	
		
		// clear any possible dataType session variable, and set a flag to indicate that an SO number request is in process
		response.clearSession('dataType');
		response.session('SOrequest', 'TRUE');
		
        response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
		// Must call send to end the original request
		response.send();
        return;
    }

	// no error, so set this so we have access to customer name later
	response.session('customerInfo', customerInfo);	

    // customer slot filled, prompt for serial number
	speechOutput = "OK. For what serial number";
	if (customerInfo.customerName) { 
		speechOutput += " at " + customerInfo.customerName + "?";
	} else {
		speechOutput += "?";
	}		
	repromptOutput = "For what serial number?";						
	response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );
	// Must call send to end the original request
	response.send();
	return;
}


/**
 * Handles the case where the user provides a serial number in order to hear a corresponding SO number
 */
function handleSerialNumberProvided(request, response) {
	console.log('entering handleSerialNumberProvided function');
	
	// reset SOrequest flag
	response.session('SOrequest', 'FALSE');
	
	var customerInfo = request.session('customerInfo')
	var getDataFromMunger = require('./getDataFromMunger') // module to get lightweight sanitized 'insight' from s3			
	var key = customerInfo.gdun + '.SNSO.3'; // the .3 refers to munger3
	console.log('key being used to retrieve insight: ' + '"' + key + '"');
	
	getDataFromMunger.getData(key, function (result) {	
		
		if (!result) {

			var speechOutput = 'That information doesn\'t seem to be available right now. Can I help with something else?';
			
		} else { // successfully pulled JSON inventory info
			//console.log('result body = ' + result );
			var parsedResult = JSON.parse(result);
			var answer = 'TBD'
			console.log('SN as interpreted = ' + request.slot('SN'));
			
			// remove any spaces and make all caps
			var SN = request.slot('SN');
			SN = SN.replace(/\s/g,'');
			SN = SN.toUpperCase();
			SN = SN.replace("8P.M.", "APM");
			
			console.log('cleaned up SN = ' + SN);
			
			for (var i = 0; i < parsedResult.length; i++) {
				//console.log('SN of this item = ' + parsedResult[i].SN)
				if (parsedResult[i].SN == SN) {
					var answer = parsedResult[i].SO;
				}
			}					
		
			console.log('answer = ' + answer );				
			
			if (answer == 'TBD') {
				var skipExtraPrompt = 'TRUE';
				var speechOutput = 'I heard you say: <say-as interpret-as="digits">' + SN + '</say-as> , either I heard wrong or that serial number isn\'t valid. Please try again.';
			} else {
				var speechOutput = 'That S.O. number is <say-as interpret-as="digits">' + answer + '</say-as> ';
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

			if (skipExtraPrompt) {
				// don't add to speechOutput
			} else {
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
			}

		};	
		
		var repromptOutput = 'What else can I help you with?';
		response.say(speechOutput).reprompt(repromptOutput).shouldEndSession( false );	
		// Must call send to end the original request
		response.send();
	});						
}

module.exports = app;