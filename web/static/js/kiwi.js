// Basic usage
var KwTreeBox = classdef({
  constructor: function() {    
	this.initComponent();
  },

  initComponent: function() {    
	$( "#dialog" ).dialog({
		dialogClass: "no-close",
	  	position: { my: "left center", at: "left bottom", of: window }
	});
  }
});

var KwComponentBox = classdef({
	constructor: function() {    
	this.initComponent();
  },

  initComponent: function() {    
	this.dom = $( "#componentList" );
	this.dom.dialog({
		dialogClass: "no-close",
	  	position: { my: "left center", at: "right bottom", of: window }
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
		}
	}
});

$(document).ready(function(){
	var box = new KwTreeBox();	
	var cmpList = new KwComponentBox();
});