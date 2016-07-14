// index
package controller

import (
	"net/http"

	util "github.com/alexxuyao/kiwiui/util"
)

func IndexController(w http.ResponseWriter, r *http.Request) {
	util.Tpl(w, "index.html", nil)
}
