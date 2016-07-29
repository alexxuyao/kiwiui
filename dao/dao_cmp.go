package dao

import (
	"encoding/json"

	"github.com/alexxuyao/kiwiui/entity"
	"github.com/boltdb/bolt"
)

type CmpDao struct {
	db *bolt.DB //
}

// 新建一个组件DAO
func newCmpDao(boltDB *bolt.DB) *CmpDao {
	cmpDao := &CmpDao{db: boltDB}
	cmpDao.init()
	return cmpDao
}

// 组件DAO初始化
func (dao *CmpDao) init() {
	dao.db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte("cmp"))
		return err
	})
}

// 保存组件定义信息到数据库中
func (dao *CmpDao) SaveCmpDefine(id string, cmpDefine *entity.CmpDefineEntity) {
	dao.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("cmp"))

		buf, err := json.Marshal(cmpDefine)
		if err != nil {
			return err
		}

		return b.Put([]byte(id), buf)
	})
}

// 添加组件定义信息到索引中
func (dao *CmpDao) IndexCmpDefine(id string, cmpIndex *entity.CmpIndexEntity) {

}

// 从索引中查找
func (dao *CmpDao) SearchCmpDefine(word string) []*entity.CmpDefineEntity {
	return nil
}
