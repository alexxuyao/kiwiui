// Basic usage
var CmpNode = classdef({
	id : '',

	cmpDefine : null,

	parent : null,

	context : null,

	positions : null, //{positonName : [CmpNode, CmpNode]}

	attrs : null, //{attrName : attrValue}

	constructor: function(config) {
		// this.cmpDefine = config.cmpDefine;
		$.extend(true, this, config);

		this.positions = {};
		this.attrs = {};

		// the attrs default value
		for(var i in config.cmpDefine['attrs']){
			var attr = config.cmpDefine['attrs'][i];
			var attrName = attr['name'];
			var val = attr['defaultValue'];
			if(val === undefined){
				val = '';
			}
			this.attrs[attrName] = val;
		}
	},

	getRenderHtml : function(func){

		var cloneNode = function(node){

			var jobj = $.extend(true, {}, {
				id : node.id,
				cmpDefine : node.cmpDefine,
				positions : node.positions,
				attrs : node.attrs
			});

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
		if(!this.positions[position]){
			this.positions[position] = [];
		}

		this.positions[position].push(child);
		var rdom = $("[cmp-id='" + this.id + "']");
		var pdom = rdom.find(".cmp-position[position='" + position + "']");
		if(!pdom.length){
			pdom = rdom;
		}
		pdom = pdom.eq(0);
		child.renderTo(pdom);
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

			self.context.processLibs(html.libs);

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
					// $( this ).css( "background", "#EEE" ).append('drop here!');

					// var target = event.target;
					var targetNode = self;
					//var cmpDefine = ui.draggable.find('input').val();
					var position = $( this ).attr('position');

					// for test
					var cmpDefine = {
						artifactId : 'backendFrame',
						groupId : 'hybird',
						title : 'HyBird管理后台框架',
						leaf : false,
						category : 'frame',
						thumbnail : '',
						attrs : [{
							name : 'systemName',
							type : 'input',
							defaultValue : 'HYBIRD',
							description : '系统名称',
							meta : {}
						}],
						events : [],
						libs : [{
							name : 'jquery',
							version : '1.10'
						},{
							name : 'bootstrap',
							version : '3'
						},{
							name : 'font-awesome',
							version : '4.5'
						}]
					};

					var child = new CmpNode({
						cmpDefine : cmpDefine,
						context : self.context
					});

					child.id = 'newId';
					targetNode.addChild(child, position);

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

	libs : null,

	constructor: function() {
		this.cmpTreeRoot = null;
		this.libs = {};
	},

	// 初始化根组件
	initRootCmp : function(cmpDefine){
		this.cmpTreeRoot = new CmpNode({
			cmpDefine : cmpDefine,
			context : this
		});
		this.cmpTreeRoot.id = 'cmpRoot';
		this.cmpTreeRoot.renderTo($('#rootContainer'));
	},

	// 添加一个组件
	processLibs : function(libs){

		for(var i in libs){
			var libName = i.substring(0, i.lastIndexOf('-'));
			var libVersion = i.substring(i.lastIndexOf('-') + 1);

			var cVersion = this.libs[libName];
			if(cVersion){
				// 库已存在，比较版本
			}else{
				var html = '';
				for (var j in libs[i]['js']){
					html += '<script type="text/javascript" src="' + libs[i]['js'][j] + '"></script>';
				}
				for (var j in libs[i]['css']){
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

//组件盒子，
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
		width : 405,
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
		artifactId  : 'pcBody',
		groupId : 'system',
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
