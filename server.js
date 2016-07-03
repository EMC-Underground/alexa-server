'use strict';

var AlexaAppServer = require( 'alexa-app-server' );

var server = new AlexaAppServer( {
	httpsEnabled: true,
	port: process.env.PORT || 80
} );

server.start();
