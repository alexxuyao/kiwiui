// index
package controller

import (
	"html/template"
	"net/http"
)

func IndexController(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("hello, this is the index handler"))
	tpl, _ := template.New("name").ParseFiles("")

	tpl.Execute(w, nil)

}
