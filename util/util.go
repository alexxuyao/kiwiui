// util
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

//
func Json(w http.ResponseWriter, resp interface{}) {
	ret, _ := json.Marshal(resp)
	w.Header().Add("Content-Type", "application/json")
	w.Write(ret)
}

func GetRequestByte(r *http.Request) []byte {
	b := make([]byte, r.ContentLength, r.ContentLength)
	r.Body.Read(b)
	return b
}

func GetRequestBody(r *http.Request, v interface{}) {
	b := GetRequestByte(r)
	fmt.Println(string(b))
	a := `{"cmpDefine":{"id":"pcRoot","name":"pcRoot","leaf":false,"category":"system","attrs":[],"events":[]},"positions":{"aa" : [{"cmpDefine":{"id":"pcRoot","name":"pcRoot","leaf":false,"category":"system","attrs":[],"events":[]},"positions":{"bb" : []},"attrs":{}}]},"attrs":{"bb" : "cc", "ee": "ff"}}`
	json.Unmarshal([]byte(a), v)
}

// 用来表示一个json返回
type JsonResp struct {
	Success bool        `json:"success"` // 是否成功
	Message string      `json:"message"` // 错误信息
	Data    interface{} `json:"data"`    // 返回的数据
}

// 表示一个list类型的json返回
type ListJsonResp struct {
	JsonResp
	Total       int `json:"total"`       // 共多少条记录
	TotalPage   int `json:"totalPage"`   // 共多少页记录
	PrePage     int `json:"prePage"`     // 每页多少条记录
	CurrentPage int `json:"currentPage"` // 当前是第几页
}
