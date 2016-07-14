// static
package controller

import (
	"fmt"
	"net/http"
	pf "path/filepath"

	kconst "github.com/alexxuyao/kiwiui/const"
	"github.com/gorilla/mux"
)

func StaticController(w http.ResponseWriter, r *http.Request) {
	fname := mux.Vars(r)["file"]
	fmt.Println(fname)
	fname = kconst.WebPath() + "/static/" + fname
	nf, _ := pf.Abs(fname)
	fmt.Println(nf)
	http.ServeFile(w, r, fname)
}
