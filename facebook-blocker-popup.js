var currentTime = Date.now();
var lastUpdate = getFromDB("lastUpdated")!=null ? parseInt(getFromDB("lastUpdated")) : 0;

var minutes = 0;
var seconds = 0;

(function() {
	var start = getFromDB("facebook-blocker");

	if(start == null) {
		fetchStartTime();
	} else if(start == "false") {
		syncTime(lastUpdate, currentTime)
	}
	startTimer();

})();

function startTimer() {
	var timer = setInterval(function() {
		if(minutes!=0 || seconds!=0) {
			updateTime();
			updateTimer();
		}
		updateDisplay();
	}, 1000);  
}

function updateTime() {
	updateMinutes();
	updateSeconds();
}

function updateSeconds() {
	if(seconds==0) {
		seconds = 60;
	}
	seconds = (seconds-1)%60;
	saveToDB("seconds", seconds);
	updateLastUpdated(Date.now());
}

function updateMinutes() {
	if(seconds==0 && minutes>0) {
		minutes = minutes-1;
		saveToDB("minutes", minutes);
	}
}

function updateDisplay() {
	if(getFromDB("facebook-blocker")=="true") {
		document.getElementById('timer').innerHTML = "Enough of facebook today!";
	} else {
		if(seconds==0 && minutes==0) {
			document.getElementById('timer').innerHTML = "Have a Productive day!";
		} else {
			document.getElementById('timer').innerHTML = getTimeForDisplay(minutes) + " : " + getTimeForDisplay(seconds);
		}
	}
}

function updateTimer() {
	if(seconds==0 && minutes==0) {
		saveToDB("facebook-blocker", "true");
		clearInterval(timer);
		deleteFromDB("minutes");
		deleteFromDB("seconds");
	}
}

function syncTime(oldT, newT) {
	var millisecDiff = parseInt(newT) - parseInt(oldT);
	if(millisecDiff >= 10*60*1000) {
		minutes = 0;
		seconds = 0;
	} else {
		var m = getFromDB("minutes")!=null ? parseInt(getFromDB("minutes")) : 9;
		var s = getFromDB("seconds")!=null ? parseInt(getFromDB("seconds")) : 60;
		if(millisecDiff > 60*1000) {
			var tempDiff = (m*60 + s)*1000 - millisecDiff;
			minutes = parseInt(tempDiff/(1000*60));
			seconds = tempDiff%(1000*60);
		} else {
			if(s - parseInt(millisecDiff/1000) >= 0) {
				minutes = m;
				seconds = s-parseInt(millisecDiff/1000);
			} else {
				minutes = m-1;
				seconds = 60+s - parseInt(millisecDiff/1000);
			}
		}
	}
	saveToDB("minutes", minutes);
	saveToDB("seconds", seconds);
}

function fetchStartTime() {
	var query = {url: "https://www.facebook.com/*"};
	var request = {"action": "handshake", "origin": "facebook-blocker"};
	chrome.tabs.query(query, function(tabs) {
		if(tabs.length > 0) {
			chrome.tabs.sendMessage(tabs[0].id, request, function(response) {
				if(response != null) {
					syncTime(response, currentTime);
					updateLastUpdated(response);
					saveToDB("facebook-blocker", "false");
				}
			});
		}
	});
}

function updateLastUpdated(timestamp) {
	saveToDB("lastUpdated", timestamp);
}

function getTimeForDisplay(data) {
	return (data < 10 ? "0"+data : data);
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