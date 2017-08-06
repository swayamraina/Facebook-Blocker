init();

var run = setTimeout(function() {
	kickStartBlocker();
}, getTime());

function getTime() {
	return getFromDB("facebook-blocker") ? 1000 : 1000*60*10;
}

function init() {
	var newTimestamp = new Date();
	if(getFromDB("blocker-start") == null) {
		var jsonTimestamp = {
								"day": newTimestamp.getDay(), 
						      	"hours": newTimestamp.getHours(),
						      	"minutes": newTimestamp.getMinutes(),
						      	"seconds": newTimestamp.getSeconds()
						    };
		setTimestamp(JSON.stringify(jsonTimestamp));
		sendMessage(getTimestamp());
	} else {
		var previousTimestamp = JSON.parse(getFromDB("blocker-start"));
		if(validateTimestamp(previousTimestamp, newTimestamp)) {
			setTimestamp(newTimestamp);
			saveToDB("facebook-blocker", false);
		}
	}
}

function validateTimestamp(oldT, newT) {
	var dayDiff = newT.getDay() - oldT.day;
	return (((dayDiff*24 + newT.getHours()) - oldT.hours) > 8) ? true : false;
}

function kickStartBlocker() {
	document.getElementsByTagName('body')[0].remove();
	document.body = document.createElement("body");

	if(!getFromDB("facebook-blocker")) {
		saveToDB("facebook-blocker", true);
	}
}

function sendMessage(timestamp) {
	chrome.runtime.sendMessage({"timestamp": timestamp});
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

