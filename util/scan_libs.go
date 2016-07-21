package util

import (
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"strings"

	"encoding/json"

	kconst "github.com/alexxuyao/kiwiui/const"
	"github.com/alexxuyao/kiwiui/entity"
	"github.com/emirpasic/gods/maps/treemap"
	"github.com/robertkrimen/otto"
)

var libDetails = ScanLibDir()

// 格式化版本号
// 只支持最多4节的版本号，只支持数字版本号
// 1.0.0 => 0001 0000 0000 0000
// 1.2.3.4 => 0001 0002 0003 0004
// 1.2.3-fix => 0001 0002 0000 0000
// 1.2.3.4.5 => 0001 0002 0003 0004
func parseLibVersion(version string) string {
	strs := strings.Split(version, ".")
	ret := ""

	for i := 0; i < 4; i++ {
		var seg int64
		if len(strs) > i {
			tmp, ok := strconv.ParseInt(strs[i], 0, 32)
			if ok == nil {
				seg = tmp
			}
		}

		ret = ret + fmt.Sprintf("%04d", seg)
	}

	return ret
}

// 从配置文件读取库信息
func ReadLibInfo(name string, version string, libInfoFile string) entity.LibDetail {
	fbyte, _ := ioutil.ReadFile(libInfoFile)
	fcontent := string(fbyte)

	vm := otto.New()
	vm.Run("var o = JSON.stringify(" + fcontent + ")")
	val, _ := vm.Get("o")
	jstr := val.String()
	var lib entity.LibDetail
	json.Unmarshal([]byte(jstr), &lib)

	// js
	for i := range lib.Js {
		file := "/libs/" + name + "/" + version + lib.Js[i]
		lib.Js[i] = file
	}

	// css
	for i := range lib.Css {
		file := "/libs/" + name + "/" + version + lib.Css[i]
		lib.Css[i] = file
	}

	return lib
}

// 扫描库目录
func ScanLibDir() map[string]*treemap.Map {

	ret := make(map[string]*treemap.Map)

	libDir := kconst.WebPath() + "/libs"
	fs, _ := ioutil.ReadDir(libDir)

	for k := range fs {
		libName := fs[k].Name()

		subDir := libDir + "/" + libName
		subFs, _ := ioutil.ReadDir(subDir)

		for subK := range subFs {
			version := subFs[subK].Name()

			targetDir := subDir + "/" + version
			libInfoFile := targetDir + "/lib-info.js"

			// 文件存在则加载
			if _, err := os.Stat(libInfoFile); err == nil {

				libDetail := ReadLibInfo(libName, version, libInfoFile)

				_, exist := ret[libName]
				if !exist {
					ret[libName] = treemap.NewWithStringComparator()
				}

				fversion := parseLibVersion(version)
				ret[libName].Put(fversion, libDetail)
			}
		}
	}

	return ret
}

// 查找最接近的库的详情
func GetLibDetail(name string, version string) (entity.LibDetail, bool) {
	var prev entity.LibDetail
	fversion := parseLibVersion(version)

	if _, exist := libDetails[name]; !exist {
		return prev, false
	}

	it := libDetails[name].Iterator()
	hasPrev := false

	for it.Next() {
		kversion := it.Key().(string)
		val, _ := it.Value().(entity.LibDetail)

		if kversion > fversion {
			if hasPrev {
				return prev, true
			}

			return val, true
		}

		prev = val
		hasPrev = true
	}

	if hasPrev {
		return prev, true
	}

	return prev, false
}
