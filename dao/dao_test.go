package dao

import (
	"fmt"
	"testing"
)

func Test_listCmpDefine(t *testing.T) {
	list := CmpStore.ListCmpDefine("", 5)
	for i := range list {
		fmt.Println(list[i])
	}
}
