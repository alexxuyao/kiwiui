// kiwiapp
package main

import (
	"log"
	"net/http"

	c "github.com/alexxuyao/kiwiui/controller"
	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()

	// Routes consist of a path and a handler function.
	r.HandleFunc("/", c.IndexController)

	r.HandleFunc("/cmpList/{page:[0-9]+}", c.CmpListController)
	r.HandleFunc("/getRenderHtml", c.GetRenderHtmlController)

	// r.HandleFunc("/static/{file:.*}", c.StaticController)
	r.HandleFunc("/{file:.*\\.(css|js|jpg|jpeg|png)}", c.StaticController)

	// Bind to a port and pass our router in
	log.Fatal(http.ListenAndServe(":8000", r))
}
