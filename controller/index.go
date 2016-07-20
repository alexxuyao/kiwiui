// index
package controller

import (
	//	"fmt"
	"net/http"

	"github.com/alexxuyao/kiwiui/entity"
	"github.com/alexxuyao/kiwiui/util"
	//"github.com/gorilla/mux"
)

// 首页
func IndexController(w http.ResponseWriter, r *http.Request) {
	util.Tpl(w, "index.html", nil)
}

// 组件列表
func CmpListController(w http.ResponseWriter, r *http.Request) {
	// return json
	// page := mux.Vars(r)["page"]

	data := make([]entity.CmpDefineEntity, 12, 12)
	// data = append(data, entity.CmpDefineEntity{})
	dlen := len(data)
	for i := 0; i < dlen; i++ {
		data[i].Title = "component-" + string(i+32)
	}

	resp := util.ListJsonResp{JsonResp: util.JsonResp{Success: true, Data: data, Message: ""}, Total: 10, TotalPage: 1, PrePage: 10, CurrentPage: 1}
	util.Json(w, resp)
}

// 渲染组件
func GetRenderHtmlController(w http.ResponseWriter, r *http.Request) {
	var node entity.CmpNodeEntity
	util.GetRequestBody(r, &node)
	//	fmt.Println(node)
	libs, head, body := util.RenderCmpNode(node)
	ret := make(map[string]interface{})
	ret["libs"] = libs
	ret["head"] = head
	ret["body"] = body
	util.Json(w, util.JsonResp{Success: true, Data: ret, Message: ""})
}
