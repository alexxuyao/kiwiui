package dao

import (
	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql"
)

func init() {
	// register model
	//orm.RegisterModel(new(User))

	// set default database
	orm.RegisterDataBase("default", "mysql", "root:root@/my_db?charset=utf8", 30)
}
