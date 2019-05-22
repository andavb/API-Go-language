
function uredi(id, naslov, besedilo){
  window.location.href = "uredi.html?idnews="+id+"&naslov="+naslov+"&besedilo="+besedilo;

}

function zbrisi(id){
  var token = getCookie("token");
  
  $.ajax({
           url: "http://localhost:8000/vaja6/novice/"+id,
           type: "DELETE",
           dataType: "json",
           beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + token); },
           success: function(result, status){
                location.reload();
            },
           error: function(xhr, status, error) {
                alert("Napaka pri posiljanju zahteve!");
            }
       })
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = decodeURIComponent(atob(base64Url).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(base64);
};

function setCookie(cname,cvalue,exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  var user=getCookie("username");
  if (user != "") {
    alert("Welcome again " + user);
  } else {
     user = prompt("Please enter your name:","");
     if (user != "" && user != null) {
       setCookie("username", user, 30);
     }
  }
}

function prijava(){
  username = document.getElementById("username").value;
  password = document.getElementById("password").value;


  if (username == "" || password == "") {
    alert("Niste vpisali uporabniškega imena ali gesla !");
  }
  else{
    $.ajax({
       type: "POST",
       url: "http://localhost:8000/get-token",
       contentType: "application/json",
       data: '{"username": "'+ username +'"}',
       success: function(result){
            setCookie("token", result, 2);
            window.location.href = "index.html";
       },
       error: function(){
         console.log("error");
       }
   })
  }
}

function getNews(token, admin) {

      //console.log(token);
      $.ajax({
           url: "http://localhost:8000/vaja6/novice",
           type: "GET",
           dataType: "json",
           beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + token); },
           success: function(result, status){
                var len = Object.keys(result).length;

                var novice = document.getElementById("novice");

                for(var i=0; i<len; i++){
                  var div = document.createElement('div');
                  div.className = "jumbotron";

                  var h1 = document.createElement('h1');
                  h1.innerHTML = result[i].naslov;
                  div.appendChild(h1);

                  var h6 = document.createElement('h6');
                  h6.innerHTML = "Avtor: " + result[i].avtor;
                  div.appendChild(h6);

                  if(admin == true){
                    var a = document.createElement('button');
                    a.innerHTML = "Uredi";
                    a.setAttribute('onclick', 'uredi("'+result[i].id+'","'+result[i].naslov+'","'+result[i].besedilo+'")');
                    a.setAttribute('class', 'btn btn-warning');
                    div.appendChild(a);

                    var a = document.createElement('button');
                    a.innerHTML = "Zbrisi";
                    a.setAttribute('onclick', 'zbrisi("'+result[i].id+'")');
                    a.setAttribute('class', 'btn btn-danger ml-2');
                    div.appendChild(a);
                  }

                  var p = document.createElement('p');
                  p.className = "lead";
                  p.innerHTML = result[i].besedilo;
                  div.appendChild(p);

                  novice.appendChild(div);
                }
           },
           error: function(xhr, status, error) {
              console.log(status);
            }
       })

}

function objaviUrejeno() {
  var token = getCookie("token");


  var url_string = window.location.href;
  var url = new URL(url_string);
  var id = url.searchParams.get("idnews");
  var naslov = document.getElementById("naslov").value;
  var besedilo = document.getElementById("besedilo").value;

  $.ajax({
           url: "http://localhost:8000/vaja6/novice/"+id,
           type: "PUT",
           dataType: "json",
           contentType: "application/json",
           data: '{  "naslov": "'+naslov+'", "besedilo": "'+besedilo+'"}',
           beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + token); },
           success: function(result, status){

                var novica = document.getElementById("novica");

                var div = document.createElement('div');
                div.setAttribute('class', 'alert alert-success');
                div.setAttribute('role', 'alert');
                div.innerHTML = "Uspešno posodobljeno!";
                novica.appendChild(div);

            },
           error: function(xhr, status, error) {
                var novica = document.getElementById("novica");

                var div = document.createElement('div');
                div.setAttribute('class', 'alert alert-danger');
                div.setAttribute('role', 'alert');
                div.innerHTML = "Prislo je do napake pri pošlijanju zahteve!";
                novica.appendChild(div);
            }
       })

}

function objaviNovico() {
  var token = getCookie("token");
  var parsed = parseJwt(token);

  var naslov = document.getElementById("naslov").value;
  var besedilo = document.getElementById("besedilo").value;

  if (naslov == "" && besedilo == "") {
    alert("Naslov ali besedilo je prazno!");
  }
  else{
     $.ajax({
               url: "http://localhost:8000/vaja6/novice",
               type: "POST",
               dataType: "json",
               contentType: "application/json",
               data: '{  "naslov": "'+naslov+'", "besedilo": "'+besedilo+'", "avtor": "'+parsed["name"]+'"}',
               beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + token); },
               success: function(result, status){

                    var novica = document.getElementById("novica");

                    var div = document.createElement('div');
                    div.setAttribute('class', 'alert alert-success');
                    div.setAttribute('role', 'alert');
                    div.innerHTML = "Uspešno objavleno!";
                    novica.appendChild(div);

                    window.location.href = "index.html";
                },
               error: function(xhr, status, error) {
                    var novica = document.getElementById("novica");

                    var div = document.createElement('div');
                    div.setAttribute('class', 'alert alert-danger');
                    div.setAttribute('role', 'alert');
                    div.innerHTML = "Prislo je do napake pri pošlijanju zahteve!";
                    novica.appendChild(div);
                }
           })
  }

}

function isci() {
  var token = getCookie("token");
  var parsed = parseJwt(token);
  var admin = parsed["admin"];

  var iskani = document.getElementById("iskan").value;

  if (iskani == "") {
      alert("Iskalni niz je prazen!");
  }
  else{
    $.ajax({
               url: "http://localhost:8000/vaja6/novice/"+iskani,
               type: "GET",
              dataType: "json",
               beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + token); },
               success: function(result, status){

                console.log(result);
                    var novica = document.getElementById("isk");
                    novica.innerHTML = "";

                    var div = document.createElement('div');
                    div.setAttribute('class', 'alert alert-success');
                    div.setAttribute('role', 'alert');
                    div.innerHTML = result.naslov + "<br>Avtor: " + result.avtor + "<br>" + result.besedilo;
                    novica.appendChild(div);
                },
               error: function(xhr, status, error) {
                    var novica = document.getElementById("isk");
                    novica.innerHTML = "";
                    console.log(status);

                    var div = document.createElement('div');
                    div.setAttribute('class', 'alert alert-danger');
                    div.setAttribute('role', 'alert');
                    div.innerHTML = "Novica ne obstaja!";
                    novica.appendChild(div);
                }
           })
  }

}