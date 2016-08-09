/**
 * 常量对象
 */
var constant = {
    ACTIVE_LINE_CLR : '#999900', // 组件激活时边框颜色
    ACTIVE_BG_CLR : '#cccc66', // 组件激活时背景色
    OVER_BG_CLR : '#aaaa33' // 组件over时的背景色
}

/**
 * 工具对象
 */
var util = {

    /**
     * 注册忽略拖动事件
     */
    registerNotDrop : function(dom, cmpId) {
        dom.kwdroppable({
            accept : "cmp-define",
            activate : function(e) {
                $(this).attr('old-style', $(this).attr('style'));
                $(this).css('background-color', '#FFFFFF;');
            },
            deactivate : function(e) {
                var ostyle = $(this).attr('old-style');
                $(this).removeAttr('style').attr('style', ostyle);
            }
        });
    },

    idIndex : 0,

    /**
     * 生成一个组件ID
     */
    newCmpId : function() {
        return 'cmp-' + (++util.idIndex);
    },

    /**
     * 根据样式名找到自己及子元素中包含cls的元素
     */
    find : function(dom, cls) {
        var ret = [];

        // 先看自己有没有这个样式
        if (dom.hasClass(cls)) {
            ret.push(dom);
        }

        // 子元素有无这个样式
        var child = dom.find('.' + cls);

        if (child.length > 0) {
            ret.push(child);
        }

        return ret;
    }
}

/**
 * 表示一个组件
 */
var CmpNode = classdef({
    id : '', // 组件的ID

    cmpDefine : null, // 组件的定义对象

    parent : null, // 组件的父亲

    context : null, // 上下文对象

    positions : null, // {positonName : [CmpNode, CmpNode]} 组件的位置及位置上的子组件节点

    attrs : null, // {attrName : attrValue} 组件的属性

    /**
     * 新建一个组件
     */
    constructor : function(config) {
        // this.cmpDefine = config.cmpDefine;
        $.extend(true, this, config);

        this.positions = {};
        this.attrs = {};

        // 设置属性的默认值
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

    /**
     * 生成本node的html，并应用回调函数func
     */
    getRenderHtml : function(func) {

        // 深度复制一个组件，用于json编码并传到后台
        var cloneNode = function(node) {

            var jobj = $.extend(true, {}, {
                id : node.id,
                cmpDefine : node.cmpDefine,
                positions : node.positions,
                attrs : node.attrs
            });

            // 深度复制positions
            for ( var i in jobj['positions']) {
                for ( var j in jobj['positions'][i]) {
                    jobj['positions'][i][j] = cloneNode(jobj['positions'][i][j]);
                }
            }

            // delete jobj['positions']
            return jobj;
        }

        var jobj = cloneNode(this);

        // 请求后台生成组件的html
        var djson = JSON.stringify(jobj);
        $.post('/getRenderHtml', djson, function(ret) {
            if (ret.success) {
                func(ret.data);
            } else {
                alert(ret.message);
            }
        });
    },

    /**
     * 添加一个子组件
     * </p>
     * child: 子组件
     * </p>
     * pdom: 要添加到的目标position dom
     */
    addChild : function(child, pdom) {

        var position = pdom.attr('position');
        if (!this.positions[position]) {
            this.positions[position] = [];
        }

        this.positions[position].push(child);
        child.parent = this;

        // 渲染
        child.renderTo(pdom);

        this.context.fire('addchild', this, child, position);
        this.context.putCmpMap(child.id, child);
    },

    /**
     * 从父节点把自己删除
     */
    remove : function() {
        // 移除head
        // 移除body
        // 移除节点
    },

    /**
     * 把自己渲染到目标position dom
     */
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
            var bodyPositions = util.find(body, 'cmp-position');

            for ( var i in bodyPositions) {
                bodyPositions[i].kwdroppable({
                    accept : "cmp-define",
                    activate : function(e) {
                        console.debug('activate:' + self.id);
                        var target = $(this);

                        target.attr('old-style', $(this).attr('style'));
                        target.css('border-style', 'dashed');

                        target.stop().animate({
                            'padding' : 20,
                            'border-width' : '2px',
                            'border-color' : constant.ACTIVE_LINE_CLR,
                            'background-color' : constant.ACTIVE_BG_CLR
                        }, 200);
                    },
                    deactivate : function(e) {
                        console.debug('deactivate:' + self.id);
                        var target = $(this);
                        var ostyle = target.attr('old-style');
                        target.stop();
                        target.removeAttr('style').attr('style', ostyle);
                    },
                    out : function(e) {
                        console.debug('out:' + self.id);
                        var target = $(this);
                        target.css({
                            'background-color' : constant.ACTIVE_BG_CLR
                        });
                    },
                    over : function(event, ui) {
                        console.debug('over:' + self.id);
                        var target = $(this);
                        target.css({
                            'background-color' : constant.OVER_BG_CLR
                        });
                    },
                    drop : function(e) {

                        var targetNode = self;
                        var cmpDefine = $.parseJSON(e.drager.find('textarea').val());

                        var child = new CmpNode({
                            cmpDefine : cmpDefine,
                            context : self.context
                        });

                        child.id = util.newCmpId();
                        targetNode.addChild(child, $(this));

                    }
                });
            }

            // 绑定not-drop事件，
            var notDrops = util.find(body, 'not-drop');

            for ( var i in notDrops) {
                util.registerNotDrop(notDrops[i], self.id);
            }

        });
    },

    setAttr : function(name, value) {

    }
});

/**
 * 上下文对象
 */
var KwContext = classdef({

    // 根组件节点
    cmpTreeRoot : null,

    // 引用了哪些库
    libs : null,

    // 用于记录注册了哪些事件
    evtRegs : null, // {'eventName' : [{obj:obj, callback: function(){}}, ...]}

    // 组件ID与组件节点的散列表
    cmpMap : null,

    /**
     * 初始化上文对象
     */
    constructor : function() {
        this.cmpTreeRoot = null;
        this.evtRegs = {};
        this.cmpMap = {};

        this.libs = {
            'jquery' : '1.11',
            'ztree' : '3.5'
        };

    },

    /**
     * 初始化根组件
     */
    initRootCmp : function(cmpDefine) {
        this.cmpTreeRoot = new CmpNode({
            cmpDefine : cmpDefine,
            context : this
        });
        this.cmpTreeRoot.id = 'cmpRoot';
        this.cmpTreeRoot.renderTo($('#rootContainer'));
        this.putCmpMap(this.cmpTreeRoot.id, this.cmpTreeRoot);
    },

    /**
     * 处理依赖库
     */
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
    },

    /**
     * 添加到散列表中
     */
    putCmpMap : function(cmpId, node) {
        this.cmpMap[cmpId] = node;
    },

    /**
     * 根据ID取组件节点
     */
    getCmp : function(cmpId) {
        return this.cmpMap[cmpId];
    },

    /**
     * 从散列表中删除
     */
    removeCmpMap : function(cmpId) {
        var old = this.getCmp(cmpId);
        delete this.cmpMap[cmpId];
        return old;
    },

    /**
     * 注册事件
     */
    on : function(evtName, obj, func) {

        if (!this.evtRegs[evtName]) {
            this.evtRegs[evtName] = [];
        }

        this.evtRegs[evtName].push({
            obj : obj,
            callback : func
        });
    },

    /**
     * 解除事件
     */
    un : function(evtName, obj, func) {
        var evts = this.evtRegs[evtName];

        if (evts) {
            for (var i = 0; i < evts.length; i++) {
                var item = evts[i];
                if (item.obj === obj && item.callback === func) {
                    evts.splice(i - 1, 1);
                    i--;
                }
            }
        }
    },

    /**
     * 触发事件
     */
    fire : function(evtName) {
        var args = Array.prototype.slice.call(arguments, 1);
        var evts = this.evtRegs[evtName];

        if (evts) {
            for ( var i in evts) {
                var item = evts[i];
                item.callback.apply(item.obj, args);
            }
        }
    }
});

/**
 * 组件树视图及属性视图
 */
var KwTreeBox = classdef({

    tree : null,

    ctx : null,

    constructor : function(ctx) {
        this.initComponent();
        this.ctx = ctx;

        ctx.on('addchild', this, this.onAddChild);
        ctx.on('cmprender', this, this.onCmpRender);
    },

    initComponent : function() {

        $("#dialog").dialog({
            dialogClass : "no-close",
            position : {
                my : "left bottom",
                at : "left bottom",
                of : window
            },
            width : 400,
            height : 300
        });

        var self = this;

        this.tree = $.fn.zTree.init($("#cmp-tree"), {
            edit : {
                enable : true,
                showRemoveBtn : false,
                showRenameBtn : false
            },
            data : {
                simpleData : {
                    enable : true
                }
            },
            callback : {
                beforeDrop : self.beforeDrop,
                onDrop : self.onDrop,
                onClick : function() {
                    self.onClick.apply(self, arguments);
                }
            },
            view : {
                showIcon : false
            }
        }, []);

    },

    onAddChild : function(parent, child, position) {
        // 先找到父节点及父节点ID
        var pnode = null;

        if (parent) {
            pnode = this.tree.getNodeByParam('id', parent.id);
        }

        // 添加position节点
        // position节点的id规则
        var sid = parent.id + '-pos-' + position;
        var snode = this.tree.getNodeByParam('id', sid);
        if (null == snode) {
            this.tree.addNodes(pnode, -1, {
                id : sid,
                name : 'pos:' + position,
                type : 'position'
            });
            snode = this.tree.getNodeByParam('id', sid);
        }

        // 添加child节点
        znode = this.tree.addNodes(snode, -1, {
            id : child.id,
            name : child.attrs.name ? child.attrs.name : child.cmpDefine.title,
            type : 'node'
        });
    },

    onCmpRender : function(cmp) {

    },

    beforeDrop : function(treeId, treeNodes, targetNode, moveType, isCopy) {
        if (!targetNode) {
            return false;
        }

        if ('inner' === moveType) {
            return targetNode.type === 'position';
        }

        if ('prev' === moveType || 'next' === moveType) {
            return targetNode.type === 'node';
        }
        return false;
    },

    onDrop : function(event, treeId, treeNodes, targetNode, moveType, isCopy) {
        console.debug(treeNodes);
        console.debug(targetNode);
        console.debug(moveType);
    },

    onClick : function(e, t, node, f) {
        if (node.type !== 'node') {
            return;
        }
        var cmp = this.ctx.getCmp(node.id);
        console.debug(cmp);
        var html = '<form id="cmp-props-form">';
        html += '<table width="100%" >';
        for ( var i in cmp.attrs) {
            html += '<tr>';
            html += '<td>';
            html += i;
            html += '</td>';
            html += '<td>';
            html += cmp.attrs[i];
            html += '</td>';
            html += '</tr>';
        }
        html += '</form>';

        $('#cmp-prop-grid').html(html);
    }
});

/**
 * 组件盒子
 */
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

/**
 * main
 */
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
