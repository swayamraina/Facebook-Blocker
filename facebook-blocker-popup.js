var minutes = loadSynchronizedMinutesValue();
var seconds = loadSynchronizedSecondsValue();

var timer = setInterval(function() {
	updateTime();
	updateDisplay();
	updateTimer();
}, 1000);

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
	saveToDB("lastUpdated", new Date());
}

function updateMinutes() {
	if(seconds==0 && minutes>0) {
		minutes = minutes-1;
		saveToDB("minutes", minutes);
	}
}

function updateDisplay() {
	if(getFromDB("facebook-blocker")) {
		document.getElementById('timer').innerHTML = "Enough of facebook today!";
	} else {
		document.getElementById('timer').innerHTML = getTimeForDisplay(minutes) + " : " + getTimeForDisplay(seconds);
	}
}

function getTimeForDisplay(data) {
	return (data < 10 ? "0"+data : data);
}

function updateTimer() {
	if(seconds==0 && minutes==0) {
		saveToDB("facebook-blocker", true);
		clearInterval(timer);
	}
}

function getFromDB(key) {
	return localStorage.getItem(key);
}

function saveToDB(key, value) {
	localStorage.setItem(key, value);
}