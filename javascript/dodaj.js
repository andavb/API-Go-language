$(document).ready(function(){
	var token = getCookie("token");

	if (token == "") {
		window.location.href = "login.html";
	}


});