var ItemListManager=Class.$extend({__init__:function(h,e,g,f){this.el=h;this.list=this.el.find(e);this.count=this.list.find(g).length;this.btn=this.el.find("div.more-btn > a");this.is_response=false;this.is_md=false;this.url=f;this.response=null;this.btn.mousedown(function(a){a.preventDefault();a.stopPropagation();this.is_md=true;this.btn.addClass("__pd");this.sendRequest()}.bind(this));$(document.body).mouseup(function(a){if(this.is_md){this.btn.removeClass("__pd");(!this.is_response);this.renderResponse()}this.is_md=false}.bind(this))},showLoader:function(){this.btn.addClass("__loading")},hideLoader:function(){this.btn.removeClass("__loading")},sendRequest:function(){if(this.is_response){return}this.is_response=true;this.response=false;var b={csrfmiddlewaretoken:window.CSRF_TOKEN,count:this.count};this.showLoader();$.post(this.url,b,function(a){this.is_response=false;if(a.error){this.showErr()}else{this.response=a;if(!this.is_md){this.renderResponse()}}}.bind(this),"json");return false},renderResponse:function(){if(!this.response){return}this.list.append(this.response.html);this.count+=this.response.num;if(this.response.last){this.btn.hide()}this.response=false;this.hideLoader()},showErr:function(){}});