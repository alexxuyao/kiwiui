// Basic usage
var CmpNode = classdef({
	
	cmpDefine : null,
	
	parent : null,
	
	positions : {}, //{positonName : [CmpNode, CmpNode]}

	attrs : {}, //{attrName : attrValue}
	
	constructor: function(cmpDefine) {    
		this.cmpDefine = cmpDefine;
	},
	
	getRenderHtml : function(){
		
	},
	
	addChild : function(child, position){
		
	},
	
	remove : function(){
		
	},
	
	renderTo : function(dom){
		var elms = this.getRenderHtml();
		var header = elms.header;
		var body = elms.body;
		
		// remove old headers
		// $('head').find('.old-header').remove();
		// append new headers
		
		// refresh the body
		// bind the events
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
		if(ret.Data){
			var html = '';
			for(var i in ret.Data){
				var item = ret.Data[i];
				html += '<div class="cmp-define">';
				html += item.Title;
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
		id : 'pcRoot',
		name  : 'pcRoot',
		leaf : false,
		category : 'system',
		attrs : [],
		events : []
	});

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
});