// kiwiapp
package main

import (
	"log"
	"net/http"

	c "github.com/alexxuyao/kiwiui/controller"
	_ "github.com/alexxuyao/kiwiui/dao"
	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()

	// Routes consist of a path and a handler function.
	r.HandleFunc("/", c.IndexController)

	r.HandleFunc("/cmpList/{cmpId:.*}", c.CmpListController)
	r.HandleFunc("/getRenderHtml", c.GetRenderHtmlController)

	// r.HandleFunc("/static/{file:.*}", c.StaticController)
	r.HandleFunc("/{file:.*\\.(css|js|jpg|jpeg|png|gif|otf|eot|svg|ttf|woff|woff2)}", c.StaticController)

	// Bind to a port and pass our router in
	log.Fatal(http.ListenAndServe(":8000", r))
}
