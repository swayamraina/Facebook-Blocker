init();

var run = setTimeout(function() {
	kickStartBlocker();
}, getTime());

function getTime() {
	return getFromDB("facebook-blocker") ? 1000 : 1000*60*10;
}

function init() {
	if(getFromDB("blocker-start") == null) {
		setTimestamp(new Date());
		// pass message here
	} else {
		var previousTimestamp = getFromDB("blocker-start");
		var newTimestamp = new Date();
		if(validateTimestamp(previousTimestamp, newTimestamp)) {
			setTimestamp(newTimestamp);
			saveToDB("facebook-blocker", false);
		}
	}
}

function validateTimestamp(oldT, newT) {
	var dayDiff = newT.getDay() - oldT.getDay();
	return (((dayDiff*24 + newT.getHours()) - oldT.getHours()) > 8) ? true : false;
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

function saveToDB(key, value) {
	localStorage.setItem(key, value);
}

function getFromDB(key) {
	return localStorage.getItem(key);
}