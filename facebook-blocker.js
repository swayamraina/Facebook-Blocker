var newTimestamp = new Date();

init();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var id = "mjobflbocmfafgpechpfjnbadfegleea";
	if(request.origin == "facebook-blocker" && sender.id == id) {
		sendResponse(JSON.parse(getTimestamp()));
	}
});

var run = setTimeout(function() {
	kickStartBlocker();
}, getTime());

function getTime() {
	return getFromDB("facebook-blocker") ? 1000 : 1000*60*10;
}

function init() {
	if(getTimestamp() == null) {
		createAndSaveTimestamp();
	} else {
		var previousTimestamp = JSON.parse(getTimestamp());
		if(checkValidity(previousTimestamp, newTimestamp) == false) {
			createAndSaveTimestamp();
			saveToDB("facebook-blocker", false);
		}
	}
}

function createAndSaveTimestamp() {
	var jsonTimestamp = {
		"day": newTimestamp.getDay(), 
		"hours": newTimestamp.getHours(),
		"minutes": newTimestamp.getMinutes(),
		"seconds": newTimestamp.getSeconds()
	};
	setTimestamp(JSON.stringify(jsonTimestamp));
}

function checkValidity(oldT, newT) {
	var minuteDiff = (newT.getDay()-oldT.day)*24*60 + (newT.getHours()-oldT.hours)*60 + (newT.getMinutes()-oldT.minutes);
	return ((minuteDiff/60) >= 8) ? false : true;
}

function kickStartBlocker() {
	document.getElementsByTagName('body')[0].remove();
	document.body = document.createElement("body");

	if(!getFromDB("facebook-blocker")) {
		saveToDB("facebook-blocker", true);
	}
}

function setTimestamp(data) {
	saveToDB("blocker-start", data);
}

function getTimestamp() {
	return getFromDB("blocker-start");
}

function saveToDB(key, value) {
	localStorage.setItem(key, value);
}

function getFromDB(key) {
	return localStorage.getItem(key);
}

