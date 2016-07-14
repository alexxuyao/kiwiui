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
	$( "#componentList" ).dialog({
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
		alert(ret);
	}
});

$(document).ready(function(){
	var box = new KwTreeBox();	
	var cmpList = new KwComponentBox();
});