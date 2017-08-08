var currentTime = new Date();
var lastUpdate = getFromDB("lastUpdated")!=null ? JSON.parse(getFromDB("lastUpdated")) : 0;
var minutes = getFromDB("minutes") != null ? syncMinutes() : 0;
var seconds = getFromDB("seconds") != null ? syncSeconds() : 0;

(function() {
	if(minutes==0 && seconds==0 && getFromDB("facebook-blocker")==null) {
		fetchStartTime();
	}
})();

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
		deleteFromDB("minutes");
		deleteFromDB("seconds");
	}
}

function syncMinutes() {
	var minutesDiff = (currentTime.getDay()*24*60 + currentTime.getHours()*60 + currentTime.getMinutes()) - (24*60*lastUpdate.day + 60*lastUpdate.hours + lastUpdate.minutes);
	var diff = getFromDB("minutes") - minutesDiff;
	return (diff < 0) ? 0 : diff;
}

function syncSeconds() {
	var secondsDiff = (currentTime.getDay()*24*60*60 + currentTime.getHours()*60*60 + currentTime.getMinutes()*60 + currentTime.getSeconds()) - (24*60*60*lastUpdate.day + 60*60*lastUpdate.hours + 60*lastUpdate.minutes + lastUpdate.seconds);	
	var diff = getFromDB("seconds") - secondsDiff%60;
	return (diff < 0) ? 60+diff : diff;
}

function fetchStartTime() {
	var query = {url: "https://www.facebook.com/*"};
	var request = {"action": "handshake", "origin": "facebook-blocker"};
	chrome.tabs.query(query, function(tabs) {
		if(tabs.length > 0) {
			chrome.tabs.sendMessage(tabs[0].id, request, function(response) {
				var diff = (response.hours*60*60 + response.minutes*60 + response.seconds) - (currentTime.getHours()*60*60 + currentTime.getMinutes()*60 + currentTime.getSeconds());
				if(diff >= 10*60) {
					minutes = 0;
					seconds = 0;
				} else {
					if(diff < 60) {
						minutes = 9;
						seconds = 60 - diff;
					} else {
						minutes = 9 - diff/60;
						seconds = 60 - diff%60;
					}
				}
				saveToDB("minutes", minutes);
				saveToDB("seconds", seconds);
				updateLastUpdated(respone);
			});
		}
	});
}

function getFromDB(key) {
	return localStorage.getItem(key);
}

function saveToDB(key, value) {
	localStorage.setItem(key, value);
}

function deleteFromDB(key) {
	localStorage.removeItem(key);
}