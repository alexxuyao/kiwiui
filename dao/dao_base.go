package dao

import (
	"fmt"
	"log"

	"github.com/alexxuyao/kiwiui/entity"
	_ "github.com/astaxie/beego/orm"
	"github.com/boltdb/bolt"
	_ "github.com/go-sql-driver/mysql"
)

var boltDB *bolt.DB = newBolt()

var CmpStore *CmpDao = newCmpDao(boltDB)

func newBolt() *bolt.DB {
	db, err := bolt.Open("kiwiui.db", 0600, nil)
	if err != nil {
		log.Fatal(err)
	}
	return db
}

func init() {
	// register model
	//orm.RegisterModel(new(User))

	// set default database
	// orm.RegisterDataBase("default", "mysql", "root:root@/my_db?charset=utf8", 30)

	fmt.Println("hello world")

	// 初始化时，扫描组件目录
	scanCmpDir(func(id string, define *entity.CmpDefineEntity, index *entity.CmpIndexEntity) {
		fmt.Println(id)

		CmpStore.SaveCmpDefine(id, define)
		CmpStore.IndexCmpDefine(id, index)
	})
}
