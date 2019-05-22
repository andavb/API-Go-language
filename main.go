package main

import(
	"encoding/json"
	"log"
	"net/http"
	//"math/rand"
	//"strconv"
	"fmt"
	"github.com/gorilla/mux"
	"os"
	"strings"
	"time"
	"github.com/nu7hatch/gouuid"

	jwtmiddleware "github.com/auth0/go-jwt-middleware"
	"github.com/dgrijalva/jwt-go"
	//"github.com/rs/cors"
	"github.com/gorilla/handlers"


)

var mySiginKey = []byte("topsecretnekinekineki12344321")

type Novica struct{
	ID string `json:"id"`
	Naslov string `json:"naslov"`
	Besedilo string `json:"besedilo"`
	Avtor string `json:"avtor"`
	Cas time.Time `json:"cas"`
}

type User struct{
	Username string `json:"username"`
}

//za userja mors poslat na http://localhost:8000/get-token
/*{
    "username": "Andrej Avbelj"
}*/
func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

var novice []Novica

//GET all news
func getNovice(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Authorization")
	println("\n")
	fmt.Println(formatRequest(r))

	json.NewEncoder(w).Encode(novice)
}

//GET single news
func getNovica(w http.ResponseWriter, r *http.Request){
	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r) //GET params

	//loop trough news
	for _,item := range novice{
		if item.ID == params["id"]{
			json.NewEncoder(w).Encode(item)
			return
		}
	}
	http.Error(w, "Novica ne obstaja", 401)


}

//create new news
func postNovica(w http.ResponseWriter, r *http.Request){
	enableCors(&w)

	uporabnik := r.Context().Value("uporabnik")

	for k, v := range uporabnik.(*jwt.Token).Claims.(jwt.MapClaims) {
		fmt.Fprintf(os.Stdout, "%s :\t%#v\n", k, v)
		if k == "admin"{
			if v == true{

				var novica Novica

				_ = json.NewDecoder(r.Body).Decode(&novica)

				u, err := uuid.NewV4()
				if err != nil {
					log.Fatal(err)
				}

				novica.ID = u.String()
				novica.Cas = time.Now()
				novice = append(novice, novica)

				json.NewEncoder(w).Encode(novica)

			} else{
				http.Error(w, "Nimate administratorskih pravic", 401)
			}
		}
	}

}

//change news
func changeNovica(w http.ResponseWriter, r *http.Request){
	enableCors(&w)
	params := mux.Vars(r)

	uporabnik := r.Context().Value("uporabnik")

	for k, v := range uporabnik.(*jwt.Token).Claims.(jwt.MapClaims) {
		fmt.Fprintf(os.Stdout, "%s :\t%#v\n", k, v)
		if k == "admin"{
			if v == true{

				var novica Novica

				_ = json.NewDecoder(r.Body).Decode(&novica)

				for i, item := range novice {
					if item.ID == params["id"] {
						println("neki\n")
						novice[i].Naslov = novica.Naslov
						novice[i].Besedilo = novica.Besedilo
						novice[i].Cas = time.Now()
						break
					}
				}


				json.NewEncoder(w).Encode(novice)

			} else{
				http.Error(w, "Nimate administratorskih pravic", 401)
			}
		}
	}

}


//delete news
func deleteNovica(w http.ResponseWriter, r *http.Request){
	enableCors(&w)
	params := mux.Vars(r)

	uporabnik := r.Context().Value("uporabnik")

	for k, v := range uporabnik.(*jwt.Token).Claims.(jwt.MapClaims) {
		fmt.Fprintf(os.Stdout, "%s :\t%#v\n", k, v)
		if k == "admin"{
			if v == true{

				for index, item := range novice {
					if item.ID == params["id"] {
						novice = append(novice[:index], novice[index+1:]...)
						break
					}
				}

				json.NewEncoder(w).Encode(novice)

			} else{
				http.Error(w, "Nimate administratorskih pravic", 401)
			}
		}
	}

}

func main(){

	//Mock data
	t := time.Now()

	u, err := uuid.NewV4()

	if err != nil {
        fmt.Println("Error: ", err)
        return
    }
	novice = append(novice, Novica{ID: u.String(), Naslov: "Nesreca", Besedilo: "qwerty", Avtor: "Andrej", Cas: t})

	u1, err := uuid.NewV4()

	if err != nil {
        fmt.Println("Error: ", err)
        return
    }
	novice = append(novice, Novica{ID: u1.String(), Naslov: "Nesreca", Besedilo: "qwerty", Avtor: "Andrej", Cas: t})

	u2, err := uuid.NewV4()

	if err != nil {
        fmt.Println("Error: ", err)
        return
    }
	novice = append(novice, Novica{ID: u2.String(), Naslov: "Nesreca", Besedilo: "qwerty", Avtor: "Andrej", Cas: t})

	router := mux.NewRouter().StrictSlash(true)
	headers := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	methods :=handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"})
	origins :=handlers.AllowedOrigins([]string{"*"})

	router.Use(func(h http.Handler) http.Handler { return handlers.LoggingHandler(os.Stdout, h) })
	router.Handle("/get-token", GetTokenHandler).Methods("POST")


	noviceRouter := router.PathPrefix("/vaja6").Subrouter()
	noviceRouter.Use(jwtMiddleware.Handler)

	noviceRouter.HandleFunc("/novice", getNovice).Methods("GET")
	noviceRouter.HandleFunc("/novice/{id}", getNovica).Methods("GET")
	noviceRouter.HandleFunc("/novice", postNovica).Methods("POST")
	noviceRouter.HandleFunc("/novice/{id}", changeNovica).Methods("PUT")
	noviceRouter.HandleFunc("/novice/{id}", deleteNovica).Methods("DELETE")


	println("Poslusamo na portu 8000")
	log.Fatal(http.ListenAndServe(":8000", handlers.CORS(headers, methods, origins)(router)))
}


var GetTokenHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)

	var user User

	_ = json.NewDecoder(r.Body).Decode(&user)

	if user.Username== "andrejavbelj" {
		claims["admin"] = true
	} else{
		claims["admin"] = false
	}
	claims["name"] = user.Username
	claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

	tokenString, _ := token.SignedString(mySiginKey)


	w.Write([]byte(tokenString))
})

var jwtMiddleware = jwtmiddleware.New(jwtmiddleware.Options{
	ValidationKeyGetter: func(token *jwt.Token) (interface{}, error) {
		return mySiginKey, nil
	},
	Extractor:     jwtmiddleware.FromFirst(jwtmiddleware.FromAuthHeader),
	UserProperty:  "uporabnik",
	SigningMethod: jwt.SigningMethodHS256,
})

func formatRequest(r *http.Request) string {
	// Create return string
	var request []string
	// Add the request string
	url := fmt.Sprintf("%v %v %v", r.Method, r.URL, r.Proto)
	request = append(request, url)
	// Add the host
	request = append(request, fmt.Sprintf("Host: %v", r.Host))
	// Loop through headers
	for name, headers := range r.Header {
		name = strings.ToLower(name)
		for _, h := range headers {
			request = append(request, fmt.Sprintf("%v: %v", name, h))
		}
	}

	// If this is a POST, add post data
	if r.Method == "POST" {
		r.ParseForm()
		request = append(request, "\n")
		request = append(request, r.Form.Encode())
	}
	// Return the request as a string
	return strings.Join(request, "\n")
}
