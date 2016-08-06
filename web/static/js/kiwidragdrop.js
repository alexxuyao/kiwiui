var kwdd = {

    // 拖动的目录
    target : null,

    // 在拖动时，焦点跟着移动
    docmousemove : function(e) {
        $('#ddhandler').css({
            top : e.pageY - 10,
            left : e.pageX - 10
        });
    },

    // 在document上放，说明没有接收者
    docmouseup : function(e) {
        // 清除事件
        kwdd.docclearup();
    },

    // 清除document上的事件
    docclearup : function() {
        
        $(document).off('mousemove', kwdd.docmousemove);
        $(document).off('mouseup', kwdd.docmouseup);
        
        $('#ddhandler').css({
            'display' : 'none'
        });
        
        $('.kw-droppable').trigger('stopDrag', [kwdd.target]);

        kwdd.target = null;
    }
};

$.fn.extend({
    
    // 拖
    kwdraggable : function(obj) {
        
        obj = $.extend({}, obj);
        
        $(this).mousedown(function(e) {
            
            // 停止冒泡，不能同时拖动多个
            e.stopPropagation();
            
            var csobj = {
                top : e.pageY - 10,
                left : e.pageX - 10
            };

            if ($('#ddhandler').length == 0) {
                $('body').append('<div id="ddhandler" style="border:none;border-radius:10px;padding:0px;width:20px;height:20px;background:#8888AA;position:absolute;"></div>');
            } else {
                csobj['display'] = 'block';
            }

            $('#ddhandler').css(csobj);

            $(document).on('mousemove', kwdd.docmousemove);
            $(document).on('mouseup', kwdd.docmouseup);

            kwdd.target = $(this);
            
            $('.kw-droppable').trigger('startDrag', [kwdd.target]);
        });
    },
    // 放
    kwdroppable : function(obj) {
        
        obj = $.extend({}, obj);

        // 接收哪些元素        
        var isAccept = function(target) {
            if (undefined === obj.accept){
                return true;
            }
            
            return target.hasClass(obj.accept);            
        }
        
        $(this).addClass('kw-droppable');
        
        // 响应开始拖动事件
        $(this).on('startDrag', function(target){
            if (kwdd.target && isAccept(kwdd.target)) {
                if (obj.activate) {
                    obj.activate({
                        drager : kwdd.target,
                        droper : $(this)
                    });
                }
            }
        });
        
        // 响应停止拖动事件
        $(this).on('stopDrag', function(target){
            if (kwdd.target && isAccept(kwdd.target)) {
                if (obj.deactivate) {
                    obj.deactivate({
                        drager : kwdd.target,
                        droper : $(this)
                    });
                }
            }
        });
        
        // 拖动进入此区域
        $(this).mouseover(function(e){
            if (kwdd.target && isAccept(kwdd.target)) {
                // 停止事件冒泡
                e.stopPropagation();

                // 触发放事件
                if (obj.over) {
                    obj.over({
                        drager : kwdd.target,
                        droper : $(this)
                    });
                }
            }
        });
        
        // 拖动离开此区域
        $(this).mouseout(function(e){
            if (kwdd.target && isAccept(kwdd.target)) {
                // 停止事件冒泡
                e.stopPropagation();

                // 触发放事件
                if (obj.out) {
                    obj.out({
                        drager : kwdd.target,
                        droper : $(this)
                    });
                }
            }
        });

        // 放事件发生
        $(this).mouseup(function(e) {
            if (kwdd.target && isAccept(kwdd.target)) {
                // 停止事件冒泡
                e.stopPropagation();

                // 触发放事件
                if (obj.drop) {
                    obj.drop({
                        drager : kwdd.target,
                        droper : $(this)
                    });
                }

                kwdd.docclearup();
            }
        });
    }
});
