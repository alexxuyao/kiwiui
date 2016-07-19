// static
package controller

import (
	"fmt"
	"net/http"
	pf "path/filepath"

	kconst "github.com/alexxuyao/kiwiui/const"
	"github.com/gorilla/mux"
)

// 静态文件处理控制器
func StaticController(w http.ResponseWriter, r *http.Request) {
	fname := mux.Vars(r)["file"]
	fmt.Println(fname)
	fname = kconst.WebPath() + "/" + fname
	nf, _ := pf.Abs(fname)
	fmt.Println(nf)
	http.ServeFile(w, r, fname)
}
