$(document).ready(function(){
	var token = getCookie("token");

	if (token == "") {
		window.location.href = "login.html";
	}
	else{
		jsonTokenData = parseJwt(token);

		var ime = jsonTokenData["name"];
		var admin = jsonTokenData["admin"];

		if (admin == true) {
			document.getElementById("dodajN").hidden = false;
			getNews(token, admin);
		}
		else{
			getNews(token, admin);
		}
	}
});