var lastUpdate = JSON.parse(getFromDB("lastUpdated"));
var minutes = getFromDB("minutes") != null ? syncMinutes() : 0;
var seconds = getFromDB("seconds") != null ? syncSeconds() : 0;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var re = new RegExp("(https:\/\/www\.facebook\.com\/)[a-zA-Z0-9\/?&=_#]*");
	if(re.test(sender.url)) {
		minutes = 10;
		seconds = 0;
		updateLastUpdated(request.timestamp);
	}
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
	var jsonLastUpdate = {
							"day": lastUpdate.getDay(), 
			          		"hours": lastUpdate.getHours(),
			          		"minutes": lastUpdate.getMinutes(),
			            	"seconds": lastUpdate.getSeconds()
			             };
	updateLastUpdated(jsonLastUpdate);
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

function syncMinutes() {
	var currentTime = new Date();
	var minutesDiff = (currentTime.getHours()*60 + currentTime.getMinutes()) - (60*lastUpdate.hours + lastUpdate.minutes);
	return (getFromDB("minutes") - minutesDiff);
}

function syncSeconds() {
	var currentTime = new Date();
	var secondsDiff = (currentTime.getMinutes()*60 + currentTime.getSeconds()) - (60*lastUpdate.minutes + lastUpdate.seconds);	
	if(getFromDB("seconds") > secondsDiff) {
		return getFromDB("seconds") - secondsDiff;
	} else {
		if(minutes==0) {
			return 0;
		} else {
			return 60+getFromDB("seconds") - secondsDiff;
		}
	}
}

function getFromDB(key) {
	return localStorage.getItem(key);
}

function saveToDB(key, value) {
	localStorage.setItem(key, value);
}