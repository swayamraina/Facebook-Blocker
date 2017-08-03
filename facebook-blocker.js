
var minutes = 0;
var seconds = 30;

var run = setInterval(function() {
	facebook_blocker();
}, 1000);

function facebook_blocker() {
	console.log("here");
	updateTime();
}

function updateTime() {
	updateSeconds();
	updateMinutes();
}

function updateSeconds() {
	if(seconds==0) {
		seconds = 60;
	}
	seconds = (seconds-1)%60;

	saveToDB("seconds", seconds);
	triggerBlockerIfRequired();
}

function updateMinutes() {
	if(seconds==0 && minutes>0) {
		minutes = minutes-1;
		saveToDB("minutes", minutes);
	}
}

function triggerBlockerIfRequired() {
	if(getFromDB("blocker-start") || (minutes==0 && seconds==0)) {
		kickStartBlocker();
		saveToDB("blocker-start", true);
	}
}

function kickStartBlocker() {
	// hide everything from facebook
	document.getElementsByTagName('body')[0].remove();

	// add empty body element
	// TODO : add ne wfeatures here
	document.body = document.createElement("body");

	//  stop processing
	clearInterval(run);
}

function saveToDB(key, value) {
	localStorage.setItem(key, value);
}

function getFromDB(key) {
	return localStorage.getItem(key);
}