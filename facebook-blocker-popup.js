var minutes = 0;
var seconds = 0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	minutes = 0;
	seconds = 60;
	updateLastUpdated(request.timestamp);
});

var timer = setInterval(function() {
	if(minutes!=0 || seconds!=0) {
		updateTime();
		updateTimer();
	}
	updateDisplay();
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

	var lastUpdate = new Date();
	var jsonLasUpdate = {
							"day": lastUpdate.getDay(), 
			          		"hours": lastUpdate.getHours(),
			          		"minutes": lastUpdate.getMinutes(),
			            	"seconds": lastUpdate.getSeconds()
			            };
	updateLastUpdated(jsonLasUpdate);
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
		if(seconds==0 && minutes==0) {
			document.getElementById('timer').innerHTML = "Have a Productive day!";
		} else {
			document.getElementById('timer').innerHTML = getTimeForDisplay(minutes) + " : " + getTimeForDisplay(seconds);
		}
	}
}

function updateLastUpdated(timestamp) {
	saveToDB("lastUpdated", JSON.stringify(timestamp));
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