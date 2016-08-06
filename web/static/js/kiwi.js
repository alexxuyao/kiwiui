var constant = {
    dropActiveLineColor : '#999900',
    dropActiveColor : '#cccc66',
    dropOverColor : '#aaaa33'
}

var util = {

    // 注册忽略拖动事件
    registerNotDrop : function(dom, cmpId) {
        dom.kwdroppable({
            accept : "cmp-define"
        });
    },

    idIndex : 0,

    // 生成一个唯一ID
    newCmpId : function() {
        return 'cmp-' + (++util.idIndex);
    }
}

// Basic usage
var CmpNode = classdef({
    id : '',

    cmpDefine : null,

    parent : null,

    context : null,

    positions : null, // {positonName : [CmpNode, CmpNode]}

    attrs : null, // {attrName : attrValue}

    constructor : function(config) {
        // this.cmpDefine = config.cmpDefine;
        $.extend(true, this, config);

        this.positions = {};
        this.attrs = {};

        // the attrs default value
        for ( var i in config.cmpDefine['attrs']) {
            var attr = config.cmpDefine['attrs'][i];
            var attrName = attr['name'];
            var val = attr['defaultValue'];
            if (val === undefined) {
                val = '';
            }
            this.attrs[attrName] = val;
        }
    },

    getRenderHtml : function(func) {

        var cloneNode = function(node) {

            var jobj = $.extend(true, {}, {
                id : node.id,
                cmpDefine : node.cmpDefine,
                positions : node.positions,
                attrs : node.attrs
            });

            for ( var i in jobj['positions']) {
                for ( var j in jobj['positions'][i]) {
                    jobj['positions'][i][j] = cloneNode(jobj['positions'][i][j]);
                }
            }

            // delete jobj['positions']
            return jobj;
        }

        var jobj = cloneNode(this);

        var djson = JSON.stringify(jobj);
        $.post('/getRenderHtml', djson, function(ret) {
            // alert(ret);
            if (ret.success) {
                func(ret.data);
            } else {
                alert(ret.message);
            }

        });
    },

    // 添加一个子组件
    addChild : function(child, position) {

        if (!this.positions[position]) {
            this.positions[position] = [];
        }

        this.positions[position].push(child);

        // 找到要添加到的位置的dom元素
        var rdom = $("[cmp-id='" + this.id + "']");
        var pdom = rdom.find(".cmp-position[position='" + position + "']");
        if (!pdom.length) {
            pdom = rdom;
        }
        pdom = pdom.eq(0);

        // 渲染
        child.renderTo(pdom);
    },

    // 从父节点把自己删除
    remove : function() {

    },

    renderTo : function(dom) {
        var self = this;
        self.getRenderHtml(function(html) {
            if (!html) {
                return;
            }

            self.context.processLibs(html.libs);

            var head = html.head;
            var body = html.body;

            // remove old headers
            // $('head').find('.old-header').remove();

            // append new headers
            $('head').append(head);
            dom.append(body);
            body = $('#' + self.id);

            // 绑定拖动事件
            var bodyPositions = [ body.find(".cmp-position") ];
            if (body.hasClass('cmp-position')) {
                bodyPositions.push(body);
            }

            for ( var i in bodyPositions) {
                bodyPositions[i].kwdroppable({
                    accept : "cmp-define",
                    activate : function(e) {
                        console.debug('activate:' + self.id);
                        var target = $(this);

                        var ocss = {
                            'padding-top' : target.css('padding-top'),
                            'padding-left' : target.css('padding-left'),
                            'padding-right' : target.css('padding-right'),
                            'padding-bottom' : target.css('padding-bottom'),
                            'background-color' : target.css('background-color')
                        };

                        target.attr('old-style', JSON.stringify(ocss));
                        target.css('border-style', 'dashed');

                        target.css({
                            'padding' : 20,
                            'border-width' : '2px',
                            'border-color' : '#000000',
                            'background-color' : constant.dropActiveColor
                        });
                    },
                    deactivate : function(e) {
                        console.debug('deactivate:' + self.id);
                        var target = $(this);
                        var ocss = {};
                        try{
                            ocss = $.parseJSON(target.attr('old-style'));
                        }catch(e){
                            console.debug(e);
                            console.debug(target.attr('old-style'));
                        }
                        target.removeAttr('old-style');

                        target.css(ocss);
                    },
                    out : function(e) {
                        console.debug('out:' + self.id);
                        var target = $(this);
                        target.css({
                            'background-color' : constant.dropActiveColor
                        });
                    },
                    over : function(event, ui) {
                        console.debug('over:' + self.id);
                        var target = $(this);
                        target.css({
                            'background-color' : constant.dropOverColor
                        });
                    },
                    drop : function(e) {
                        
                        var targetNode = self;
                        var cmpDefine = $.parseJSON(e.drager.find('textarea').val());
                        var position = $(this).attr('position');

                        var child = new CmpNode({
                            cmpDefine : cmpDefine,
                            context : self.context
                        });

                        child.id = util.newCmpId();
                        targetNode.addChild(child, position);

                    }
                });
            }

            // 绑定not-drop事件，
            var bodyNotDrops = [ body.find(".not-drop") ];
            if (body.hasClass('not-drop')) {
                bodyNotDrops.push(body);
            }

            for ( var i in bodyNotDrops) {
                util.registerNotDrop(bodyNotDrops[i], self.id);
            }

        });
    },

    setAttr : function(name, value) {

    }
});

var KwContext = classdef({

    cmpTreeRoot : null,

    libs : null,

    constructor : function() {
        this.cmpTreeRoot = null;
        this.libs = {
            'jquery' : '1.11'
        };
    },

    // 初始化根组件
    initRootCmp : function(cmpDefine) {
        this.cmpTreeRoot = new CmpNode({
            cmpDefine : cmpDefine,
            context : this
        });
        this.cmpTreeRoot.id = 'cmpRoot';
        this.cmpTreeRoot.renderTo($('#rootContainer'));
    },

    // 添加一个组件
    processLibs : function(libs) {

        for ( var i in libs) {
            var libName = i.substring(0, i.lastIndexOf('-'));
            var libVersion = i.substring(i.lastIndexOf('-') + 1);

            var cVersion = this.libs[libName];
            if (cVersion) {
                // 库已存在，比较版本
            } else {
                var html = '';
                for ( var j in libs[i]['js']) {
                    html += '<script type="text/javascript" src="' + libs[i]['js'][j] + '"></script>';
                }
                for ( var j in libs[i]['css']) {
                    html += '<link href="' + libs[i]['css'][j] + '" rel="stylesheet" />';
                }

                $('head').append(html);

                this.libs[libName] = libVersion;
            }
        }
    }
});

//
var KwTreeBox = classdef({
    constructor : function(ctx) {
        this.initComponent();
        this.ctx = ctx;
    },

    initComponent : function() {
        $("#dialog").dialog({
            dialogClass : "no-close",
            position : {
                my : "left bottom",
                at : "left bottom",
                of : window
            }
        });
    }
});

// 组件盒子，
var KwComponentBox = classdef({
    constructor : function(ctx) {
        this.initComponent();
        this.ctx = ctx;
    },

    initComponent : function() {
        this.dom = $("#componentList");
        this.dom.dialog({
            dialogClass : "no-close",
            position : {
                my : "right bottom",
                at : "right bottom",
                of : window
            },
            width : 405,
            height : 450
        });

        util.registerNotDrop(this.dom, 'cmpBox');

        this.loadList("");

    },

    loadList : function(lastCmpId) {
        var self = this;
        $.get('/cmpList/' + lastCmpId, function(ret) {
            self.initList(ret);
        });
    },

    initList : function(ret) {
        if (ret.data) {
            var html = '';
            for ( var i in ret.data) {
                var item = ret.data[i];
                html += '<div class="cmp-define">';
                html += item.title;
                html += '<textarea style="display:none;" >' + JSON.stringify(item) + '</textarea>';
                html += '</div>';
            }

            this.dom.find('.list').append(html);
            this.dom.find('.cmp-define').kwdraggable();
        }
    }
});

$(document).ready(function() {
    var ctx = new KwContext();
    var box = new KwTreeBox(ctx);
    var cmpList = new KwComponentBox(ctx);

    ctx.initRootCmp({
        artifactId : 'pcBody',
        groupId : 'system',
        title : 'pcBody',
        leaf : false,
        category : 'system',
        thumbnail : '',
        attrs : [],
        events : []
    });

});
