package util

import (
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
