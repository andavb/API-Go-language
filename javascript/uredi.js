$(document).ready(function(){
	var token = getCookie("token");

	var id = "";
	var naslov = "";
	var besedilo = "";

	if (token == "") {
		window.location.href = "login.html";
	}
	else{
		var url_string = window.location.href;
		var url = new URL(url_string);
		id = url.searchParams.get("idnews");
		naslov = url.searchParams.get("naslov");
		besedilo = url.searchParams.get("besedilo");

		document.getElementById("naslov").value = naslov;
		document.getElementById("besedilo").value = besedilo;		
	}

});