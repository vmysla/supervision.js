
var re = /([a-z0-9]+)?(\:(?:button|image|submit|reset|checkbox|text|password))?(\[.*\])?([^:]+)?(\:.*)?/i;

function domMarkup(selector, noncilcular){

  var tags = selector.split(/\s*>\s*/);
  var dom, 
      last_selector = 'document', 
      last = noncilcular ? 'document' : document;

  for(var i=0;i<tags.length;i++){

    var parts = tags[i].match(re);
    if(!parts) throw "Error parsing "+tags[i];
    
    var tag         = parts[1], 
        type        = parts[2]
        attributes  = parts[3], 
        classes     = parts[4], 
        pseudo      = parts[5];

    var elm = { 
           tagName    : tag, 
           nodeName   : tag,
           type       : type ? type.substring(1, type.length) : window.undef,
           attributes : attributes? attributes.substring(1,attributes.length-1).split(',') : [],
           innerText  : '',
           className  : classes ? classes : '',
           pseudo     : pseudo ? pseudo.substring(1,pseudo.length).split(':') : [],
        }

   for(var j=elm.attributes.length;j--;){
     var attr = elm.attributes[j].split('=');
     elm[ attr[0] ] = attr[1] || '';
     elm[ attr[0] ] = elm[ attr[0] ].replace('`',',');
   }

   for(var j=elm.pseudo.length;j--;){
     var attr = elm.pseudo[j].replace(/[")]/ig,'').split('(');
     if(attr[0]=='contains') elm.innerText = attr[1];

   }
   // cleanup temporary data
   delete elm.attributes;
   delete elm.pseudo;
   // replace ref. nodes with strings for JSON.stringify
   elm.parentNode = noncilcular ? last_selector : last;
   elm.children = [];
   // update tree   
   if(!dom){ dom = elm } else { last.children.push(elm); }
   last = elm;
   last_selector = tags[i];
   //console.log(i, tags[i], parts, elm, dom || 'dom', last || 'last');
  }
  this.node = dom;
}
domMarkup.node = function(selector, noncilcular){
  return domMarkup(selector, noncilcular).node;
}

module.exports = domMarkup;