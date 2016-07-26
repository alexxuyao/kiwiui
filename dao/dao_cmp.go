package dao

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"strings"

	"github.com/alexxuyao/kiwiui/const"
	"github.com/alexxuyao/kiwiui/entity"
	"github.com/robertkrimen/otto"
)

func init() {
	// 初始化时，加载组件到索引中

}

type CmpIndex struct {
	Id          int      `json:"Id"`          // 自增ID
	ArtifactId  string   `json:"artifactId"`  // 组件名称
	GroupId     string   `json:"groupId"`     // 分
	Author      string   `json:"author"`      // author
	Description string   `json:"description"` // description
	Title       string   `json:"title"`       // 组件名称
	Docs        []string `json:"docs"`        // 文档
}

var acId int = 0

// 生成自增ID
func makeId() int {
	acId = acId + 1
	return acId
}

// 添加组件到索引中
func indexCmpDir(cmpDir string) {

	var tcmp *entity.CmpDefineEntity = nil

	// 处理组件定义文件
	defineFile := cmpDir + "/" + "cmp-define.js"

	if _, err := os.Stat(defineFile); err == nil {
		fbyte, err := ioutil.ReadFile(defineFile)
		if nil != err {
			fcontent := string(fbyte)

			vm := otto.New()
			vm.Run("var o = JSON.stringify(" + fcontent + ")")
			val, _ := vm.Get("o")
			jstr := val.String()
			var cmp entity.CmpDefineEntity
			json.Unmarshal([]byte(jstr), &cmp)

			tcmp = &cmp
		}
	}

	// 扫描组件的文档
	if nil != tcmp {

		docDir := cmpDir + "/doc"
		fs, err := ioutil.ReadDir(docDir)
		if err != nil {
			panic(err)
		}

		docs := make([]string, 1, 2)
		for i := range fs {
			if !fs[i].IsDir() {
				if strings.HasSuffix(fs[i].Name(), ".html") {
					docFile := docDir + "/" + fs[i].Name()
					docContent, err := ioutil.ReadFile(docFile)
					if nil != err {
						panic(err)
					}

					// 添加文档到索引
					docs = append(docs, string(docContent))
				}
			}
		}

		// 开始处理组件信息
		id := makeId()
		cmpIndex := CmpIndex{Id: id,
			ArtifactId:  tcmp.ArtifactId,
			GroupId:     tcmp.GroupId,
			Author:      tcmp.Author,
			Description: tcmp.Description,
			Title:       tcmp.Title,
			Docs:        docs}

		// 添加到boltDB
		SaveCmpDefine(id, tcmp)

		// 添加到索引
		IndexCmpDefine(id, &cmpIndex)
	}
}

// 扫描组件目录，把组件信息添加到索引
func scanCmpDir() {

	cmpDir := kconst.WebPath() + "/components"
	fs, err := ioutil.ReadDir(cmpDir)

	if nil != err {
		panic(err)
	}

	for i := range fs {

		// 系统组件不添加到索引中
		if "system" != fs[i].Name() {

			subDir := cmpDir + "/" + fs[i].Name()
			sfs, err := ioutil.ReadDir(subDir)

			if nil != err {
				panic(err)
			}

			for j := range sfs {
				indexCmpDir(subDir + "/" + sfs[j].Name())
			}
		}
	}
}

// 保存组件定义信息到数据库中
func SaveCmpDefine(id int, cmpDefine *entity.CmpDefineEntity) {

}

// 添加组件定义信息到索引中
func IndexCmpDefine(id int, cmpIndex *CmpIndex) {

}

// 从索引中查找
func SearchCmpDefine(word string) []*entity.CmpDefineEntity {
	return nil
}
