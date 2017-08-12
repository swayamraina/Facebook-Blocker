var newTimestamp = Date.now();

init();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var id = "mjobflbocmfafgpechpfjnbadfegleea";
	if(request.origin == "facebook-blocker" && sender.id == id) {
		sendResponse(getTimestamp());
	}
});

var run = setTimeout(function() {
	kickStartBlocker();
}, getTime());

function getTime() {
	return (getFromDB("facebook-blocker")=="true") ? 1000 : 1000*60*10;
}

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

function createAndSaveTimestamp() {
	setTimestamp(newTimestamp);
}

function checkValidity(oldT, newT) {
	var millisecDiff = parseInt(newT) - parseInt(oldT);
	return (parseInt(millisecDiff >= 8*60*60*1000)) ? "false" : "true";
}

function kickStartBlocker() {
	document.getElementsByTagName('body')[0].remove();
	document.body = document.createElement("body");

	if(!getFromDB("facebook-blocker")) {
		saveToDB("facebook-blocker", "true");
	}
}

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

