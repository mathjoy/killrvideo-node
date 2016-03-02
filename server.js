// Require from compiled lib folder
var KillrVideo = require('./lib');

// Create and start the web server
var webServer = KillrVideo.createWebServer();
var port = process.env.PORT || 3000;
webServer.listen(port);