var myQuote = "Dreams are not those which come while we sleep, but Dreams are those which don't let you sleep";

var request = new XMLHttpRequest();

var base_url = "https://quotes.rest/qod.json?category=";
var type_array = ["inspire", "management", "sports", "life", "funny", "love", "art", "students"];

function generateUrl() {
	var index = getFromDB("api-index");
	index = (index==null) ? 0 : (parseInt(index)+1)%type_array.length;

	var type = type_array[index] ;
	saveToDB("api-index", index);
	return base_url + type;
}

function getDisplayQuote(url) {
	request.open("GET", url, false);
	request.send(null);
	if(request.status == 200) {
		var response = JSON.parse(request.responseText);
		return response.contents.quotes[0].quote;
	} else {
		return myQuote;
	}
}

function saveToDB(key, value) {
	localStorage.setItem(key, value);
}

function getFromDB(key) {
	return localStorage.getItem(key);
}