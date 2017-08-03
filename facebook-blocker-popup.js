function updateDisplay() {
	document.getElementById('timer')[0].innerHTML = getFromDB("minutes") + " : " + getFromDB("seconds");
}

var timer = setInterval(function(){
	updateDisplay();
}, 1000);

function updateDisplay() {
	document.getElementById('timer').innerHTML = getFromDB("minutes") + " : " + getFromDB("seconds");
}

function getFromDB(key) {
	return localStorage.getItem(key);
}