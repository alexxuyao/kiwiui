var kwdd = {

    // 拖动的目录
    target : null,

    // 在拖动时，焦点跟着移动
    docmousemove : function(e) {
        kwdd.movecursor({
            x : e.pageX,
            y : e.pageY
        });
    },

    // 在document上放，说明没有接收者
    docmouseup : function(e) {
        console.debug('up document');
        // 清除事件
        kwdd.docclearup();
    },

    // 清除document上的事件
    docclearup : function() {

        $(document).off('mousemove', kwdd.docmousemove);
        $(document).off('mouseup', kwdd.docmouseup);

        kwdd.hidecursor();
        $('.kw-droppable').trigger('kwstopdrag', [ kwdd.target ]);
        kwdd.stopdraghock();

        kwdd.target = null;
    },
    
    startdraghock : function(){
        // document cursor
        $('body').attr('old-style', $('body').attr('style'));
        $('body').css('cursor', 'move');
    },
    
    stopdraghock : function(){
        // document cursor
        $('body').removeAttr('style');
        $('body').attr('style', $('body').attr('old-style'));
    },

    appendcursor : function() {
        var html = '<div id="ddhandlertop" class="ddhandler" style="z-index:99999;border-top:2px dotted #000000;width:14px;position:absolute;"></div>';
        html += '<div id="ddhandlerbottom" class="ddhandler" style="z-index:99999;border-bottom:2px dotted #000000;width:14px;position:absolute;"></div>';
        html += '<div id="ddhandlerleft" class="ddhandler" style="z-index:99999;border-left:2px dotted #000000;height:14px;position:absolute;"></div>';
        html += '<div id="ddhandlerright" class="ddhandler" style="z-index:99999;border-right:2px dotted #000000;height:14px;position:absolute;"></div>';
        $('body').append(html);
    },

    showcursor : function() {
        $('.ddhandler').css('display', 'block');
    },

    hidecursor : function() {
        $('.ddhandler').css('display', 'none');
    },

    movecursor : function(point) {
        $('#ddhandlertop').css({
            top : point.y - 10,
            left : point.x - 6
        });
        $('#ddhandlerbottom').css({
            top : point.y + 10,
            left : point.x - 6
        });
        $('#ddhandlerleft').css({
            top : point.y - 7,
            left : point.x - 10
        });
        $('#ddhandlerright').css({
            top : point.y - 7,
            left : point.x + 10
        });

        // 取消文本选定
        if (document.selection) {
            document.selection.empty();
        } else if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
    }
};

$.fn.extend({

    // 拖
    kwdraggable : function(obj) {

        obj = $.extend({}, obj);

        $(this).mousedown(function(e) {

            // 停止冒泡，不能同时拖动多个
            e.stopPropagation();

            if ($('.ddhandler').length == 0) {
                kwdd.appendcursor();
            } else {
                kwdd.showcursor();
            }

            kwdd.movecursor({
                x : e.pageX,
                y : e.pageY
            });

            $(document).on('mousemove', kwdd.docmousemove);
            $(document).on('mouseup', kwdd.docmouseup);

            kwdd.target = $(this);
            $('.kw-droppable').trigger('kwstartdrag', [ kwdd.target ]);
            kwdd.startdraghock();
        });
    },

    /**
     * 放事件 obj :
     * 
     * accept: 一个class样式，不带.号，表示接受哪些元素的放事件
     * 
     * activate: 一个function
     * 
     * deactivate: 一个function
     * 
     * over: 一个function
     * 
     * out: 一个function
     * 
     * drop: 一个function
     * 
     * activateCls: 一个样式，在activate的时候添加，在deactivate的时候删除
     * 
     * overCls: 一个样式，在over的时候添加，在out的时候删除
     */
    kwdroppable : function(obj) {

        obj = $.extend({}, obj);

        // 接收哪些元素
        var isAccept = function(target) {
            if (undefined === obj.accept) {
                return true;
            }

            return target.hasClass(obj.accept);
        }

        $(this).addClass('kw-droppable');

        // 响应开始拖动事件
        $(this).on('kwstartdrag', function(e, target) {
            // 停止事件冒泡
            e.stopPropagation();
            if (kwdd.target && isAccept(kwdd.target)) {

                // 触发激活事件
                if (obj.activate) {
                    obj.activate.call(this, {
                        drager : kwdd.target
                    });
                }

                // 添加激活样式
                if (obj.activateCls) {
                    $(this).addClass(obj.activateCls);
                }
            }
        });

        // 响应停止拖动事件
        $(this).on('kwstopdrag', function(e, target) {
            // 停止事件冒泡
            e.stopPropagation();
            if (kwdd.target && isAccept(kwdd.target)) {

                // 触发解除激活事件
                if (obj.deactivate) {
                    obj.deactivate.call(this, {
                        drager : kwdd.target
                    });
                }

                // 移除激活样式
                if (obj.activateCls) {
                    $(this).removeClass(obj.activateCls);
                }
            }
        });

        // 拖动进入此区域
        $(this).mouseover(function(e) {
            console.debug('over me:' + $(this).attr('id'));
            if (kwdd.target && isAccept(kwdd.target)) {
                // 停止事件冒泡
                e.stopPropagation();

                // 触发进入区域事件
                if (obj.over) {
                    obj.over.call(this, {
                        drager : kwdd.target
                    });
                }

                // 添加over样式
                if (obj.overCls) {
                    $(this).addClass(obj.overCls);
                }
            }
        });

        // 拖动离开此区域
        $(this).mouseout(function(e) {
            console.debug('out me:' + $(this).attr('id'));
            if (kwdd.target && isAccept(kwdd.target)) {
                // 停止事件冒泡
                e.stopPropagation();

                // 触发离开区域事件
                if (obj.out) {
                    obj.out.call(this, {
                        drager : kwdd.target
                    });
                }

                // 移除over样式
                if (obj.overCls) {
                    $(this).removeClass(obj.overCls);
                }
            }
        });

        // 放事件发生
        $(this).mouseup(function(e) {
            console.debug('up me:' + $(this).attr('id'));
            if (kwdd.target && isAccept(kwdd.target)) {
                // 停止事件冒泡
                e.stopPropagation();

                // 触发放事件
                if (obj.drop) {
                    obj.drop.call(this, {
                        drager : kwdd.target
                    });
                }

                kwdd.docclearup();
            }
        });
    }
});
