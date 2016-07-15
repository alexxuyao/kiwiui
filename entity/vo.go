package entity

// 表示一个组件属性
type Attr struct {
	Name         string
	Type         string
	DefaultValue string
	Description  string
	Meta         string
}

// 组件定义
type CmpDefineEntity struct {
	Name      string   //组件名称
	Title     string   //组件名称
	Leaf      bool     //是否叶子组件
	Category  string   //分类
	Thumbnail string   //缩略图
	Attrs     []Attr   //组件属性
	Events    []string //组件事件
}
