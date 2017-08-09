var currentTime = new Date();
var lastUpdate = getFromDB("lastUpdated")!=null ? JSON.parse(getFromDB("lastUpdated")) : {"date":0,"hours":0,"minutes":0,"seconds":0};

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
		"date": lastUpdate.getDate(), 
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
	var dayDiff = newT.getDate() - parseInt(oldT.date); 
	var hourDiff = newT.getHours() - parseInt(oldT.hours);
	var minDiff = newT.getMinutes() - parseInt(oldT.minutes);
	var secDiff = newT.getSeconds() - parseInt(oldT.seconds);

	var diff = (dayDiff*24*60*60 + hourDiff*60*60 + minDiff*60 + secDiff);

	if(diff >= 10*60) {
		minutes = 0;
		seconds = 0;
	} else {
		var m = getFromDB("minutes")!=null ? parseInt(getFromDB("minutes")) : 9;
		var s = getFromDB("seconds")!=null ? parseInt(getFromDB("seconds")) : 60;
		if(diff > 60) {
			var temp = m*60 + s - diff;
			minutes = parseInt(temp/60);
			seconds = temp%60;
		} else {
			if(s-diff >= 0) {
				minutes = m;
				seconds = s-diff;
			} else {
				minutes = m-1;
				seconds = 60+s-diff;
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
	saveToDB("lastUpdated", JSON.stringify(timestamp));
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