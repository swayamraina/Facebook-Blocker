function updateDisplay() {
	document.getElementById('timer')[0].innerHTML = getFromDB("minutes") + " : " + getFromDB("seconds");
}

function getFromDB(key) {
	return localStorage.getItem(key);
}