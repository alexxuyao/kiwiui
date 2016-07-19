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

// 渲染组件节点
func RenderCmpNode(node entity.CmpNodeEntity) (string, string) {

	cdefine := node.CmpDefine
	tplfile := kconst.WebPath() + "/components/" + cdefine.Name + "/template.html"

	tpl, err := template.ParseFiles(tplfile)
	data := node.Attrs
	data["cmpPath"] = "/components/" + cdefine.Name

	// fmt.Println(pf.Abs(tplfile))
	if err != nil {
		fmt.Println(err)
		return "", ""
	}

	var buf bytes.Buffer
	tpl.Execute(&buf, data)
	// fmt.Println(buf.String())

	doc, _ := goquery.NewDocumentFromReader(&buf)

	if !cdefine.Leaf {
		// render the child
		cheads := ""

		for positionName, nodeList := range node.Positions {

			cbodys := ""

			for i := range nodeList {
				chead, cbody := RenderCmpNode(nodeList[i])
				cheads += chead
				cbodys += cbody
			}

			// append to html body
			doc.Find(".cmp-position[@position='" + positionName + "']").Append(cbodys)
		}

		// append to html head
		nheads := "<!-- start-head-" + node.Id + " -->"
		nheads += cheads
		nheads += "<!-- end-head-" + node.Id + " -->"

		doc.Find("head").Append(nheads)
	}

	// all, _ := doc.Html()
	// fmt.Println(all)

	head, _ := doc.Find("head").Html()
	body, _ := doc.Find("body").Html()

	return head, body
}
