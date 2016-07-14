// index
package controller

import (
	"net/http"

	util "github.com/alexxuyao/kiwiui/util"
	//"github.com/gorilla/mux"
)

func IndexController(w http.ResponseWriter, r *http.Request) {
	util.Tpl(w, "index.html", nil)
}

func CmpListController(w http.ResponseWriter, r *http.Request) {
	// return json
	// page := mux.Vars(r)["page"]

	resp := util.ListJsonResp{JsonResp: util.JsonResp{Success: true, Data: nil, Message: ""}, Total: 10, TotalPage: 1, PrePage: 10, CurrentPage: 1}
	util.Json(w, resp)
}

type CmpEntity struct {
	Name string
}
