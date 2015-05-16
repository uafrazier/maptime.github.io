(function(b){var f=false;if(typeof module!=="undefined"&&module.exports){f=true;var d=require("request")}var j=false;var a=false;try{var c=new XMLHttpRequest();if(typeof c.withCredentials!=="undefined"){j=true}else{if("XDomainRequest" in window){j=true;a=true}}}catch(h){}var i=Array.prototype.indexOf;var k=function(o,n){var m=0,e=o.length;if(i&&o.indexOf===i){return o.indexOf(n)}for(;m<e;m++){if(o[m]===n){return m}}return -1};var g=function(e){if(!this||!(this instanceof g)){return new g(e)}if(typeof(e)==="string"){e={key:e}}this.callback=e.callback;this.wanted=e.wanted||[];this.key=e.key;this.simpleSheet=!!e.simpleSheet;this.parseNumbers=!!e.parseNumbers;this.wait=!!e.wait;this.reverse=!!e.reverse;this.postProcess=e.postProcess;this.debug=!!e.debug;this.query=e.query||"";this.orderby=e.orderby;this.endpoint=e.endpoint||"https://spreadsheets.google.com";this.singleton=!!e.singleton;this.simple_url=!!e.simple_url;this.callbackContext=e.callbackContext;if(typeof(e.proxy)!=="undefined"){this.endpoint=e.proxy.replace(/\/$/,"");this.simple_url=true;this.singleton=true;j=false}this.parameterize=e.parameterize||false;if(this.singleton){if(typeof(g.singleton)!=="undefined"){this.log("WARNING! Tabletop singleton already defined")}g.singleton=this}if(/key=/.test(this.key)){this.log("You passed an old Google Docs url as the key! Attempting to parse.");this.key=this.key.match("key=(.*?)&")[1]}if(/pubhtml/.test(this.key)){this.log("You passed a new Google Spreadsheets url as the key! Attempting to parse.");this.key=this.key.match("d\\/(.*?)\\/pubhtml")[1]}if(!this.key){this.log("You need to pass Tabletop a key!");return}this.log("Initializing with key "+this.key);this.models={};this.model_names=[];this.base_json_path="/feeds/worksheets/"+this.key+"/public/basic?alt=";if(f||j){this.base_json_path+="json"}else{this.base_json_path+="json-in-script"}if(!this.wait){this.fetch()}};g.callbacks={};g.init=function(e){return new g(e)};g.sheets=function(){this.log("Times have changed! You'll want to use var tabletop = Tabletop.init(...); tabletop.sheets(...); instead of Tabletop.sheets(...)")};g.prototype={fetch:function(e){if(typeof(e)!=="undefined"){this.callback=e}this.requestData(this.base_json_path,this.loadSheets)},requestData:function(e,m){if(f){this.serverSideFetch(e,m)}else{var l=this.endpoint.split("//").shift()||"http";if(j&&(!a||l===location.protocol)){this.xhrFetch(e,m)}else{this.injectScript(e,m)}}},xhrFetch:function(l,n){var m=a?new XDomainRequest():new XMLHttpRequest();m.open("GET",this.endpoint+l);var e=this;m.onload=function(){try{var o=JSON.parse(m.responseText)}catch(p){console.error(p)}n.call(e,o)};m.send()},injectScript:function(o,p){var l=document.createElement("script");var n;if(this.singleton){if(p===this.loadSheets){n="Tabletop.singleton.loadSheets"}else{if(p===this.loadSheet){n="Tabletop.singleton.loadSheet"}}}else{var e=this;n="tt"+(+new Date())+(Math.floor(Math.random()*100000));g.callbacks[n]=function(){var q=Array.prototype.slice.call(arguments,0);p.apply(e,q);l.parentNode.removeChild(l);delete g.callbacks[n]};n="Tabletop.callbacks."+n}var m=o+"&callback="+n;if(this.simple_url){if(o.indexOf("/list/")!==-1){l.src=this.endpoint+"/"+this.key+"-"+o.split("/")[4]}else{l.src=this.endpoint+"/"+this.key}}else{l.src=this.endpoint+m}if(this.parameterize){l.src=this.parameterize+encodeURIComponent(l.src)}document.getElementsByTagName("script")[0].parentNode.appendChild(l)},serverSideFetch:function(l,m){var e=this;d({url:this.endpoint+l,json:true},function(o,p,n){if(o){return console.error(o)}m.call(e,n)})},isWanted:function(e){if(this.wanted.length===0){return true}else{return(k(this.wanted,e)!==-1)}},data:function(){if(this.model_names.length===0){return undefined}if(this.simpleSheet){if(this.model_names.length>1&&this.debug){this.log("WARNING You have more than one sheet but are using simple sheet mode! Don't blame me when something goes wrong.")}return this.models[this.model_names[0]].all()}else{return this.models}},addWanted:function(e){if(k(this.wanted,e)===-1){this.wanted.push(e)}},loadSheets:function(o){var l,e;var n=[];this.foundSheetNames=[];for(l=0,e=o.feed.entry.length;l<e;l++){this.foundSheetNames.push(o.feed.entry[l].title.$t);if(this.isWanted(o.feed.entry[l].content.$t)){var q=o.feed.entry[l].link.length-1;var m=o.feed.entry[l].link[q].href.split("/").pop();var p="/feeds/list/"+this.key+"/"+m+"/public/values?alt=";if(f||j){p+="json"}else{p+="json-in-script"}if(this.query){p+="&sq="+this.query}if(this.orderby){p+="&orderby=column:"+this.orderby.toLowerCase()}if(this.reverse){p+="&reverse=true"}n.push(p)}}this.sheetsToLoad=n.length;for(l=0,e=n.length;l<e;l++){this.requestData(n[l],this.loadSheet)}},sheets:function(e){if(typeof e==="undefined"){return this.models}else{if(typeof(this.models[e])==="undefined"){return}else{return this.models[e]}}},loadSheet:function(l){var e=new g.Model({data:l,parseNumbers:this.parseNumbers,postProcess:this.postProcess,tabletop:this});this.models[e.name]=e;if(k(this.model_names,e.name)===-1){this.model_names.push(e.name)}this.sheetsToLoad--;if(this.sheetsToLoad===0){this.doCallback()}},doCallback:function(){if(this.sheetsToLoad===0){this.callback.apply(this.callbackContext||this,[this.data(),this])}},log:function(e){if(this.debug){if(typeof console!=="undefined"&&typeof console.log!=="undefined"){Function.prototype.apply.apply(console.log,[console,arguments])}}}};g.Model=function(s){var n,m,l,r;this.column_names=[];this.name=s.data.feed.title.$t;this.elements=[];this.raw=s.data;if(typeof(s.data.feed.entry)==="undefined"){s.tabletop.log("Missing data for "+this.name+", make sure you didn't forget column headers");this.elements=[];return}for(var q in s.data.feed.entry[0]){if(/^gsx/.test(q)){this.column_names.push(q.replace("gsx$",""))}}for(n=0,l=s.data.feed.entry.length;n<l;n++){var e=s.data.feed.entry[n];var o={};for(var m=0,r=this.column_names.length;m<r;m++){var p=e["gsx$"+this.column_names[m]];if(typeof(p)!=="undefined"){if(s.parseNumbers&&p.$t!==""&&!isNaN(p.$t)){o[this.column_names[m]]=+p.$t}else{o[this.column_names[m]]=p.$t}}else{o[this.column_names[m]]=""}}if(o.rowNumber===undefined){o.rowNumber=n+1}if(s.postProcess){s.postProcess(o)}this.elements.push(o)}};g.Model.prototype={all:function(){return this.elements},toArray:function(){var p=[],n,l,m,e;for(n=0,m=this.elements.length;n<m;n++){var o=[];for(l=0,e=this.column_names.length;l<e;l++){o.push(this.elements[n][this.column_names[l]])}p.push(o)}return p}};if(f){module.exports=g}else{b.Tabletop=g}})(this);