package util

import (
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	pf "path/filepath"

	kconst "github.com/alexxuyao/kiwiui/const"
)

func Tpl(w http.ResponseWriter, tpl string, data interface{}) {
	tpl = kconst.WebPath() + "/template/" + tpl

	fmt.Println(pf.Abs(tpl))
	temp, _ := template.ParseFiles(tpl)
	temp.Execute(w, data)
}

func Json(w http.ResponseWriter, resp interface{}) {
	ret, _ := json.Marshal(resp)
	w.Header().Add("Content-Type", "application/json")
	w.Write(ret)
}

type JsonResp struct {
	Success bool
	Message string
	Data    interface{}
}

type ListJsonResp struct {
	JsonResp
	Total       int
	TotalPage   int
	PrePage     int
	CurrentPage int
}
