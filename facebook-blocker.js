

// create timestamp on page load
var newTimestamp = Date.now();

// Initialise setup everytime facebook page is loaded
init();


// handle handshake 
// when the extension pop up is generated send timestamp to sync the timer
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var id = "mjobflbocmfafgpechpfjnbadfegleea";
	if(request.origin == "facebook-blocker" && sender.id == id) {
		sendResponse(getTimestamp());
	}
});


// ticker as soon as Facebook starts
var run = setTimeout(function() {
	kickStartBlocker();
}, getTime());


// check if blocker is active or not
// set trigger time accordingly
function getTime() {
	return (getFromDB("facebook-blocker")=="true") ? 1000 : ((1000*60*10)-(newTimestamp-parseInt(getFromDB("facebook-blocker-timestamp"))));
}


// initialization function
// check if Facebook was opened before or not
// if yes, validate previous timestamp before providing access
// if no, generate a new timestamp
function init() {
	if(getTimestamp() == null) {
		createAndSaveTimestamp();
	} else {
		var previousTimestamp = getTimestamp();
		if(checkValidity(previousTimestamp, newTimestamp) == "false") {
			createAndSaveTimestamp();
			saveToDB("facebook-blocker", "false");
		}
	}
}


// save timestamp to local DB
// for better performance and accuracy, create on page load
function createAndSaveTimestamp() {
	setTimestamp(newTimestamp);
}


// validate the passed timestamp by comparing with the newly generated one
function checkValidity(oldT, newT) {
	var millisecDiff = parseInt(newT) - parseInt(oldT);
	return (parseInt(millisecDiff) >= 8*60*60*1000) ? "false" : "true";
}


// remove facebook data from DOM
function kickStartBlocker() {
	document.getElementsByTagName('body')[0].remove();
	document.body = document.createElement("body");

	var quote = getDisplayQuote(generateUrl());
	document.body.innerHTML = quote;	

	if(getFromDB("facebook-blocker") != "true") {
		saveToDB("facebook-blocker", "true");
	}
}


//// Utility Methods ////

function setTimestamp(data) {
	saveToDB("facebook-blocker-timestamp", data);
}

function getTimestamp() {
	return getFromDB("facebook-blocker-timestamp");
}

function saveToDB(key, value) {
	localStorage.setItem(key, value);
}

function getFromDB(key) {
	return localStorage.getItem(key);
}

