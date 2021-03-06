package entity

// the libraries like jquery, boostrap, ztree
type Lib struct {
	Name    string `json:"name"`    // 名称
	Version string `json:"version"` // 称
}

// libraries details
type LibDetail struct {
	Lib
	Js  []string `json:"js"`  // javascript files
	Css []string `json:"css"` // style files
}

// 表示一个组件属性
type Attr struct {
	Name         string      `json:"name"`         // 属性名称
	Type         string      `json:"type"`         // 属性类型 input, select, file, color, icons, radio
	DefaultValue string      `json:"defaultValue"` // 默认值
	Description  string      `json:"description"`  // 属性说明
	Meta         interface{} `json:"meta"`         // 元数据
}

// 组件定义
type CmpDefineEntity struct {
	ArtifactId  string   `json:"artifactId"`  // 组件名称
	GroupId     string   `json:"groupId"`     // 分
	Author      string   `json:"author"`      // author
	Description string   `json:"description"` // description
	Title       string   `json:"title"`       // 组件名称
	Leaf        bool     `json:"leaf"`        // 是否叶子组件
	Thumbnail   string   `json:"thumbnail"`   // 缩略图
	Attrs       []Attr   `json:"attrs"`       // 组件属性
	Events      []string `json:"events"`      // 组件事件
	Libs        []Lib    `json:"libs"`        // 组
}

type CmpNodeEntity struct {
	Id        string                     `json:"id"`        // 组件ID
	CmpDefine CmpDefineEntity            `json:"cmpDefine"` // 组件定义
	Positions map[string][]CmpNodeEntity `json:"positions"` //
	Attrs     map[string]string          `json:"attrs"`     //
}

// 用于索引组件
type CmpIndexEntity struct {
	Id          string   `json:"Id"`          // 自增ID
	ArtifactId  string   `json:"artifactId"`  // 组件名称
	GroupId     string   `json:"groupId"`     // 分
	Author      string   `json:"author"`      // author
	Description string   `json:"description"` // description
	Title       string   `json:"title"`       // 组件名称
	Docs        []string `json:"docs"`        // 文档
}
