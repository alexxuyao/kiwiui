package util

import (
	"bytes"
	"fmt"
	//pf "path/filepath"
	"text/template"

	"github.com/PuerkitoBio/goquery"
	kconst "github.com/alexxuyao/kiwiui/const"
	"github.com/alexxuyao/kiwiui/entity"
)

func RenderCmpLibs(cdefine entity.CmpDefineEntity) map[string]entity.LibDetail {
	libs := make(map[string]entity.LibDetail)

	for i := range cdefine.Libs {
		lib := cdefine.Libs[i]
		libDetail := entity.LibDetail{
			Lib: lib,
			Js:  make([]string, 0, 5),
			Css: make([]string, 0, 5)}

		libs[libDetail.Name] = libDetail
	}

	return libs
}

// 渲染组件节点
func RenderCmpNode(node entity.CmpNodeEntity) (map[string]entity.LibDetail, string, string) {

	cdefine := node.CmpDefine
	tplfile := kconst.WebPath() + "/components/" + cdefine.GroupId + "/" + cdefine.ArtifactId + "/template.html"

	tpl, err := template.ParseFiles(tplfile)
	data := node.Attrs
	data["cmpPath"] = "/components/" + cdefine.GroupId + "/" + cdefine.ArtifactId

	// fmt.Println(pf.Abs(tplfile))
	if err != nil {
		fmt.Println(err)
		return nil, "", ""
	}

	var buf bytes.Buffer
	tpl.Execute(&buf, data)
	// fmt.Println(buf.String())

	doc, _ := goquery.NewDocumentFromReader(&buf)
	docHead := doc.Find("head")
	docBody := doc.Find("body")

	docHead.Children().SetAttr("head-cmp-id", node.Id)

	// parse the libs
	libs := RenderCmpLibs(cdefine)

	// parse the children
	if !cdefine.Leaf {
		// render the child
		cheads := ""

		for positionName, nodeList := range node.Positions {

			cbodys := ""

			for i := range nodeList {
				clibs, chead, cbody := RenderCmpNode(nodeList[i])
				cheads += chead
				cbodys += cbody

				for lname, v := range clibs {
					libs[lname] = v
				}
			}

			// append to html body
			doc.Find(".cmp-position[@position='" + positionName + "']").Append(cbodys)
		}

		// append to html head
		nheads := "<!-- start-head-" + node.Id + " -->"
		nheads += cheads
		nheads += "<!-- end-head-" + node.Id + " -->"

		docHead.Append(nheads)
	}

	// all, _ := doc.Html()
	// fmt.Println(all)

	if docBody.Children().Length() != 1 {
		docBody.Children().WrapAllHtml("<div></div>")
	}

	docBody.Children().First().SetAttr("cmp-id", node.Id)

	head, _ := docHead.Html()
	body, _ := docBody.Html()

	return libs, head, body
}
