

// create timestamp on pageg load
var currentTime = Date.now();


// get last updated timestamp
var lastUpdate = getFromDB("lastUpdated")!=null ? parseInt(getFromDB("lastUpdated")) : 0;

// initialise timer to 0
// later on we'll sync this time
var minutes = 0;
var seconds = 0;


// check if blocker has already started
// and sync time accordingly
(function() {
	var start = getFromDB("facebook-blocker");

	switch(start) {
		// blocker not started yet
		// we need to get the time of start
		case null:
			fetchStartTime();
			break;
		
		// blocker timer started
		// sync the time from previously saved timestamp
		case "false":
			if((minutes|seconds) != 0) syncTime(lastUpdate, currentTime);
			break;

		// blocker started and Facebook is locked
		// need to check if timestamp has expired or not
		case "true":
			if(checkValidity(lastUpdate, currentTime) == "false") {
				updateLastUpdated(Date.now());
				deleteFromDB("facebook-blocker")
			}
			break;
	}

	startTimer();

})();


// validate the passed timestamp by comparing with the newly generated one
function checkValidity(oldT, newT) {
	var millisecDiff = parseInt(newT) - parseInt(oldT);
	return (parseInt(millisecDiff) >= 8*60*60*1000) ? "false" : "true";
}


// ticker display timer
function startTimer() {
	var timer = setInterval(function() {
		if(minutes!=0 || seconds!=0) {
			updateTime();
			updateTimer();
		}
		updateDisplay();
	}, 1000);  
}


// update time
// update minutes first to avoid early trigger of blocker display
function updateTime() {
	updateMinutes();
	updateSeconds();
}


// update timestamp every second
// this timestamp is used later on for sync
function updateSeconds() {
	if(seconds==0) {
		seconds = 60;
	}
	seconds = (seconds-1)%60;
	saveToDB("seconds", seconds);
	updateLastUpdated(Date.now());
}


// update minutes only when required
function updateMinutes() {
	if(seconds==0 && minutes>0) {
		minutes = minutes-1;
		saveToDB("minutes", minutes);
	}
}


// update display in popup
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


// update timer and declare blocker has started
function updateTimer() {
	if(seconds==0 && minutes==0) {
		saveToDB("facebook-blocker", "true");
		clearInterval(timer);
		deleteFromDB("minutes");
		deleteFromDB("seconds");
	}
}


// Whenever the popup is opened sync time to display
// get the old and new timestamp and update timer 
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


// when popup is opened send handshake message to facebook tab for time sync
// facebook tab sends the original timestamp to be used for sync
// timestamp from facebook tab only arrives if it has never been opened before
// or when previous timestamp has expired
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


//// Utility Methods ////

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