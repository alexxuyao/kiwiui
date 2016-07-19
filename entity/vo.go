package entity

// 表示一个组件属性
type Attr struct {
	Name         string `json:"name"`         // 属性名称
	Type         string `json:"type"`         // 属性类型 input, select, file, color
	DefaultValue string `json:"defaultValue"` // 默认值
	Description  string `json:"description"`  // 属性说明
	Meta         string `json:"meta"`         // 元数据
}

// 组件定义
type CmpDefineEntity struct {
	Name      string   `json:"name"`      // 组件名称
	Title     string   `json:"title"`     // 组件名称
	Leaf      bool     `json:"leaf"`      // 是否叶子组件
	Category  string   `json:"category"`  // 分类
	Thumbnail string   `json:"thumbnail"` // 缩略图
	Attrs     []Attr   `json:"attrs"`     // 组件属性
	Events    []string `json:"events"`    // 组件事件
}

type CmpNodeEntity struct {
	Id        string                     `json:"id"`        // 组件ID
	CmpDefine CmpDefineEntity            `json:"cmpDefine"` // 组件定义
	Positions map[string][]CmpNodeEntity `json:"positions"` //
	Attrs     map[string]string          `json:"attrs"`     //
}
