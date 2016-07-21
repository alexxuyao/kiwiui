package util

import (
	"fmt"
	"testing"

	"github.com/alexxuyao/kiwiui/entity"
)

func Test_scanlib(t *testing.T) {
	//	o := ScanLibDir()

	//	for k, v := range o {
	//		it := v.Iterator()
	//		for it.Next() {
	//			key, _ := it.Key(), it.Value()
	//			fmt.Print(k)
	//			fmt.Println(key)
	//		}
	//	}

	lib, ok := GetLibDetail("bootstrap", "1.8")
	fmt.Println(ok)
	fmt.Println(lib)

	//	fmt.Println(parseLibVersion("1.2.3"))
	//	fmt.Println(parseLibVersion("1.2.3.4"))
	//	fmt.Println(parseLibVersion("1.2.3.4.5"))
	//	fmt.Println(parseLibVersion("1.2.3-fix"))

	//	fmt.Println(filepath.Abs(kconst.WebPath() + "/../"))
}

func Test_RenderCmpNode(t *testing.T) {

	define := entity.CmpDefineEntity{
		ArtifactId: "pcBody",
		GroupId:    "system",
		Leaf:       false}

	node := entity.CmpNodeEntity{
		Id:        "pcBodyId",
		CmpDefine: define,
		Attrs:     make(map[string]string)}

	l, h, b := RenderCmpNode(node)
	t.Log(l)
	t.Log(h)
	t.Log(b)
}

func Benchmark_RenderCmpNode(b *testing.B) {
	for i := 0; i < b.N; i++ { //use b.N for looping
		define := entity.CmpDefineEntity{
			ArtifactId: "pcBody",
			GroupId:    "system",
			Leaf:       false}

		node := entity.CmpNodeEntity{
			Id:        "pcBodyId",
			CmpDefine: define,
			Attrs:     make(map[string]string)}

		RenderCmpNode(node)
		// b.Log(node)
	}
}
