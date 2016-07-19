// Basic usage
var CmpNode = classdef({
	
	cmpDefine : null,
	
	parent : null,
	
	positions : {}, //{positonName : [CmpNode, CmpNode]}

	attrs : {}, //{attrName : attrValue}
	
	constructor: function(cmpDefine) {    
		this.cmpDefine = cmpDefine;		
	},
	
	getRenderHtml : function(func){
		
		var cloneNode = function(node){
			var jobj = jQuery.extend(true, {}, node);
			delete jobj['parent'];
			
			for (var i in jobj['positions']){
				for(var j in jobj['positions'][i]){
					jobj['positions'][i][j] = cloneNode(jobj['positions'][i][j]);
				}
			}
								
			// delete jobj['positions']
			return jobj;
		}
		
		var jobj = cloneNode(this);

		var djson = JSON.stringify(jobj);
		$.post('/getRenderHtml', djson, function(ret){
			// alert(ret);
			if(ret.success){
				func(ret.data);
			}else{
				alert(ret.message);
			}
			
		});
	},
	
	addChild : function(child, position){
		
	},
	
	// 从父节点把自己删除
	remove : function(){
		
	},
	
	renderTo : function(dom){
		var self = this;
		self.getRenderHtml(function(html){
			if(!html){
				return;
			}
			
			var head = html.head;
			var body = html.body;
			
			// remove old headers
			// $('head').find('.old-header').remove();
			
			// append new headers
			$('head').append(head);
			dom.html(body);
			
			// refresh the body
			// bind the events
			dom.find( ".cmp-position" ).droppable({
				accept: ".cmp-define",
				greedy: true,
			    classes: {
			      "ui-droppable-active": "ui-state-active",
			      "ui-droppable-hover": "ui-state-hover"
			    },
				drop: function( event, ui ) {
					// TODO
					$( this ).css( "background", "#EEE" ).append('drop here!');
					var positonName = '';
					var targetNode = '';
					var cmpDefind = '';
					
				}
			});
		
			dom.find( ".not-drop" ).droppable({
				accept: ".cmp-define",
				greedy: true,	    
				drop: function( event, ui ) {
					return false;
				}
			});
			
		});
	},
	
	setAttr : function(name, value){
		
	}
});

var KwContext = classdef({
	
	cmpTreeRoot : null,
	
	constructor: function() {    
	
	},
	
	// 初始化根组件
	initRootCmp : function(cmpDefine){
		this.cmpTreeRoot = new CmpNode(cmpDefine);
		this.cmpTreeRoot.renderTo($('#rootContainer'));
	},
	
	// 添加一个组件
	addComponent: function(cmpDefine, targetCmp, position){
		
	}
});

var KwTreeBox = classdef({
  constructor: function(ctx) {    
	this.initComponent();
	this.ctx = ctx;
  },

  initComponent: function() {    
	$( "#dialog" ).dialog({
		dialogClass: "no-close",
	  	position: { my: "left bottom", at: "left bottom", of: window }
	});
  }
});

var KwComponentBox = classdef({
	constructor: function(ctx) {    
	this.initComponent();
	this.ctx = ctx;
  },

  initComponent: function() {    
	this.dom = $( "#componentList" );
	this.dom.dialog({
		dialogClass: "no-close",
	  	position: { my: "right bottom", at: "right bottom", of: window },
		width : 400,
		height : 450
	});
	
	this.loadList(1)
	
  },

	loadList : function(page){
		var self = this;
		$.get('/cmpList/' + page, function(ret){			
			self.initList(ret);
		});
	},

	initList : function(ret){	
		if(ret.data){
			var html = '';
			for(var i in ret.data){
				var item = ret.data[i];
				html += '<div class="cmp-define">';
				html += item.title;
				html += '</div>';
			}
			
			this.dom.find('.list').append(html);
			this.dom.find('.cmp-define').draggable({ 
				cursor: 'move', 
				cursorAt: { top: 50, left: 50 } ,
				revert: "invalid", 
				helper: "clone",
				appendTo : 'body',
				zIndex: 1000
			});
		}
	}
});

$(document).ready(function(){
	var ctx = new KwContext();
	var box = new KwTreeBox(ctx);	
	var cmpList = new KwComponentBox(ctx);
	
	ctx.initRootCmp({
		name  : 'pcBody',
		title : 'pcBody',
		leaf : false,
		category : 'system',
		thumbnail : '',
		attrs : [],
		events : []
	});

	/*
	$( ".cmp-position" ).droppable({
		accept: ".cmp-define",
		greedy: true,
	    classes: {
	      "ui-droppable-active": "ui-state-active",
	      "ui-droppable-hover": "ui-state-hover"
	    },
		drop: function( event, ui ) {
			$( this ).css( "background", "#EEE" );
		}
	});

	$( ".not-drop" ).droppable({
		accept: ".cmp-define",
		greedy: true,	    
		drop: function( event, ui ) {
			return false;
		}
	});
	*/
});