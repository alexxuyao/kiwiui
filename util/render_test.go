package util

import (
	"testing"

	"github.com/alexxuyao/kiwiui/entity"
)

func Test_RenderCmpNode(t *testing.T) {

	define := entity.CmpDefineEntity{Name: "pcBody", Leaf: false}
	node := entity.CmpNodeEntity{Id: "pcBodyId", CmpDefine: define, Attrs: make(map[string]string)}

	h, b := RenderCmpNode(node)
	t.Log(h)
	t.Log(b)
}

func Benchmark_RenderCmpNode(b *testing.B) {
	for i := 0; i < b.N; i++ { //use b.N for looping
		define := entity.CmpDefineEntity{Name: "pcBody", Leaf: false}
		node := entity.CmpNodeEntity{Id: "pcBodyId", CmpDefine: define, Attrs: make(map[string]string)}

		RenderCmpNode(node)
		// b.Log(node)
	}
}
