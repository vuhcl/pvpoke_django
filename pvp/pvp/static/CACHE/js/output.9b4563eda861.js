(function(root,factory){if(typeof define==='function'&&define.amd){define([],factory);}else{root.htmx=root.htmx||factory();}}(typeof self!=='undefined'?self:this,function(){return(function(){'use strict';var htmx={onLoad:onLoadHelper,process:processNode,on:addEventListenerImpl,off:removeEventListenerImpl,trigger:triggerEvent,ajax:ajaxHelper,find:find,findAll:findAll,closest:closest,values:function(elt,type){var inputValues=getInputValues(elt,type||"post");return inputValues.values;},remove:removeElement,addClass:addClassToElement,removeClass:removeClassFromElement,toggleClass:toggleClassOnElement,takeClass:takeClassForElement,defineExtension:defineExtension,removeExtension:removeExtension,logAll:logAll,logger:null,config:{historyEnabled:true,historyCacheSize:10,refreshOnHistoryMiss:false,defaultSwapStyle:'innerHTML',defaultSwapDelay:0,defaultSettleDelay:20,includeIndicatorStyles:true,indicatorClass:'htmx-indicator',requestClass:'htmx-request',addedClass:'htmx-added',settlingClass:'htmx-settling',swappingClass:'htmx-swapping',allowEval:true,inlineScriptNonce:'',attributesToSettle:["class","style","width","height"],withCredentials:false,timeout:0,wsReconnectDelay:'full-jitter',disableSelector:"[hx-disable], [data-hx-disable]",useTemplateFragments:false,scrollBehavior:'smooth',defaultFocusScroll:false,},parseInterval:parseInterval,_:internalEval,createEventSource:function(url){return new EventSource(url,{withCredentials:true})},createWebSocket:function(url){return new WebSocket(url,[]);},version:"1.8.1"};var internalAPI={addTriggerHandler:addTriggerHandler,bodyContains:bodyContains,canAccessLocalStorage:canAccessLocalStorage,filterValues:filterValues,hasAttribute:hasAttribute,getAttributeValue:getAttributeValue,getClosestMatch:getClosestMatch,getExpressionVars:getExpressionVars,getHeaders:getHeaders,getInputValues:getInputValues,getInternalData:getInternalData,getSwapSpecification:getSwapSpecification,getTriggerSpecs:getTriggerSpecs,getTarget:getTarget,makeFragment:makeFragment,mergeObjects:mergeObjects,makeSettleInfo:makeSettleInfo,oobSwap:oobSwap,selectAndSwap:selectAndSwap,settleImmediately:settleImmediately,shouldCancel:shouldCancel,triggerEvent:triggerEvent,triggerErrorEvent:triggerErrorEvent,withExtensions:withExtensions,}
var VERBS=['get','post','put','delete','patch'];var VERB_SELECTOR=VERBS.map(function(verb){return"[hx-"+verb+"], [data-hx-"+verb+"]"}).join(", ");function parseInterval(str){if(str==undefined){return undefined}
if(str.slice(-2)=="ms"){return parseFloat(str.slice(0,-2))||undefined}
if(str.slice(-1)=="s"){return(parseFloat(str.slice(0,-1))*1000)||undefined}
if(str.slice(-1)=="m"){return(parseFloat(str.slice(0,-1))*1000*60)||undefined}
return parseFloat(str)||undefined}
function getRawAttribute(elt,name){return elt.getAttribute&&elt.getAttribute(name);}
function hasAttribute(elt,qualifiedName){return elt.hasAttribute&&(elt.hasAttribute(qualifiedName)||elt.hasAttribute("data-"+qualifiedName));}
function getAttributeValue(elt,qualifiedName){return getRawAttribute(elt,qualifiedName)||getRawAttribute(elt,"data-"+qualifiedName);}
function parentElt(elt){return elt.parentElement;}
function getDocument(){return document;}
function getClosestMatch(elt,condition){while(elt&&!condition(elt)){elt=parentElt(elt);}
return elt?elt:null;}
function getAttributeValueWithDisinheritance(initialElement,ancestor,attributeName){var attributeValue=getAttributeValue(ancestor,attributeName);var disinherit=getAttributeValue(ancestor,"hx-disinherit");if(initialElement!==ancestor&&disinherit&&(disinherit==="*"||disinherit.split(" ").indexOf(attributeName)>=0)){return"unset";}else{return attributeValue}}
function getClosestAttributeValue(elt,attributeName){var closestAttr=null;getClosestMatch(elt,function(e){return closestAttr=getAttributeValueWithDisinheritance(elt,e,attributeName);});if(closestAttr!=="unset"){return closestAttr;}}
function matches(elt,selector){var matchesFunction=elt.matches||elt.matchesSelector||elt.msMatchesSelector||elt.mozMatchesSelector||elt.webkitMatchesSelector||elt.oMatchesSelector;return matchesFunction&&matchesFunction.call(elt,selector);}
function getStartTag(str){var tagMatcher=/<([a-z][^\/\0>\x20\t\r\n\f]*)/i
var match=tagMatcher.exec(str);if(match){return match[1].toLowerCase();}else{return"";}}
function parseHTML(resp,depth){var parser=new DOMParser();var responseDoc=parser.parseFromString(resp,"text/html");var responseNode=responseDoc.body;while(depth>0){depth--;responseNode=responseNode.firstChild;}
if(responseNode==null){responseNode=getDocument().createDocumentFragment();}
return responseNode;}
function makeFragment(resp){if(htmx.config.useTemplateFragments){var documentFragment=parseHTML("<body><template>"+resp+"</template></body>",0);return documentFragment.querySelector('template').content;}else{var startTag=getStartTag(resp);switch(startTag){case"thead":case"tbody":case"tfoot":case"colgroup":case"caption":return parseHTML("<table>"+resp+"</table>",1);case"col":return parseHTML("<table><colgroup>"+resp+"</colgroup></table>",2);case"tr":return parseHTML("<table><tbody>"+resp+"</tbody></table>",2);case"td":case"th":return parseHTML("<table><tbody><tr>"+resp+"</tr></tbody></table>",3);case"script":return parseHTML("<div>"+resp+"</div>",1);default:return parseHTML(resp,0);}}}
function maybeCall(func){if(func){func();}}
function isType(o,type){return Object.prototype.toString.call(o)==="[object "+type+"]";}
function isFunction(o){return isType(o,"Function");}
function isRawObject(o){return isType(o,"Object");}
function getInternalData(elt){var dataProp='htmx-internal-data';var data=elt[dataProp];if(!data){data=elt[dataProp]={};}
return data;}
function toArray(arr){var returnArr=[];if(arr){for(var i=0;i<arr.length;i++){returnArr.push(arr[i]);}}
return returnArr}
function forEach(arr,func){if(arr){for(var i=0;i<arr.length;i++){func(arr[i]);}}}
function isScrolledIntoView(el){var rect=el.getBoundingClientRect();var elemTop=rect.top;var elemBottom=rect.bottom;return elemTop<window.innerHeight&&elemBottom>=0;}
function bodyContains(elt){if(elt.getRootNode()instanceof ShadowRoot){return getDocument().body.contains(elt.getRootNode().host);}else{return getDocument().body.contains(elt);}}
function splitOnWhitespace(trigger){return trigger.trim().split(/\s+/);}
function mergeObjects(obj1,obj2){for(var key in obj2){if(obj2.hasOwnProperty(key)){obj1[key]=obj2[key];}}
return obj1;}
function parseJSON(jString){try{return JSON.parse(jString);}catch(error){logError(error);return null;}}
function canAccessLocalStorage(){var test='htmx:localStorageTest';try{localStorage.setItem(test,test);localStorage.removeItem(test);return true;}catch(e){return false;}}
function internalEval(str){return maybeEval(getDocument().body,function(){return eval(str);});}
function onLoadHelper(callback){var value=htmx.on("htmx:load",function(evt){callback(evt.detail.elt);});return value;}
function logAll(){htmx.logger=function(elt,event,data){if(console){console.log(event,elt,data);}}}
function find(eltOrSelector,selector){if(selector){return eltOrSelector.querySelector(selector);}else{return find(getDocument(),eltOrSelector);}}
function findAll(eltOrSelector,selector){if(selector){return eltOrSelector.querySelectorAll(selector);}else{return findAll(getDocument(),eltOrSelector);}}
function removeElement(elt,delay){elt=resolveTarget(elt);if(delay){setTimeout(function(){removeElement(elt);},delay)}else{elt.parentElement.removeChild(elt);}}
function addClassToElement(elt,clazz,delay){elt=resolveTarget(elt);if(delay){setTimeout(function(){addClassToElement(elt,clazz);},delay)}else{elt.classList&&elt.classList.add(clazz);}}
function removeClassFromElement(elt,clazz,delay){elt=resolveTarget(elt);if(delay){setTimeout(function(){removeClassFromElement(elt,clazz);},delay)}else{if(elt.classList){elt.classList.remove(clazz);if(elt.classList.length===0){elt.removeAttribute("class");}}}}
function toggleClassOnElement(elt,clazz){elt=resolveTarget(elt);elt.classList.toggle(clazz);}
function takeClassForElement(elt,clazz){elt=resolveTarget(elt);forEach(elt.parentElement.children,function(child){removeClassFromElement(child,clazz);})
addClassToElement(elt,clazz);}
function closest(elt,selector){elt=resolveTarget(elt);if(elt.closest){return elt.closest(selector);}else{do{if(elt==null||matches(elt,selector)){return elt;}}
while(elt=elt&&parentElt(elt));}}
function querySelectorAllExt(elt,selector){if(selector.indexOf("closest ")===0){return[closest(elt,selector.substr(8))];}else if(selector.indexOf("find ")===0){return[find(elt,selector.substr(5))];}else if(selector.indexOf("next ")===0){return[scanForwardQuery(elt,selector.substr(5))];}else if(selector.indexOf("previous ")===0){return[scanBackwardsQuery(elt,selector.substr(9))];}else if(selector==='document'){return[document];}else if(selector==='window'){return[window];}else{return getDocument().querySelectorAll(selector);}}
var scanForwardQuery=function(start,match){var results=getDocument().querySelectorAll(match);for(var i=0;i<results.length;i++){var elt=results[i];if(elt.compareDocumentPosition(start)===Node.DOCUMENT_POSITION_PRECEDING){return elt;}}}
var scanBackwardsQuery=function(start,match){var results=getDocument().querySelectorAll(match);for(var i=results.length-1;i>=0;i--){var elt=results[i];if(elt.compareDocumentPosition(start)===Node.DOCUMENT_POSITION_FOLLOWING){return elt;}}}
function querySelectorExt(eltOrSelector,selector){if(selector){return querySelectorAllExt(eltOrSelector,selector)[0];}else{return querySelectorAllExt(getDocument().body,eltOrSelector)[0];}}
function resolveTarget(arg2){if(isType(arg2,'String')){return find(arg2);}else{return arg2;}}
function processEventArgs(arg1,arg2,arg3){if(isFunction(arg2)){return{target:getDocument().body,event:arg1,listener:arg2}}else{return{target:resolveTarget(arg1),event:arg2,listener:arg3}}}
function addEventListenerImpl(arg1,arg2,arg3){ready(function(){var eventArgs=processEventArgs(arg1,arg2,arg3);eventArgs.target.addEventListener(eventArgs.event,eventArgs.listener);})
var b=isFunction(arg2);return b?arg2:arg3;}
function removeEventListenerImpl(arg1,arg2,arg3){ready(function(){var eventArgs=processEventArgs(arg1,arg2,arg3);eventArgs.target.removeEventListener(eventArgs.event,eventArgs.listener);})
return isFunction(arg2)?arg2:arg3;}
var DUMMY_ELT=getDocument().createElement("output");function findAttributeTargets(elt,attrName){var attrTarget=getClosestAttributeValue(elt,attrName);if(attrTarget){if(attrTarget==="this"){return[findThisElement(elt,attrName)];}else{var result=querySelectorAllExt(elt,attrTarget);if(result.length===0){logError('The selector "'+attrTarget+'" on '+attrName+" returned no matches!");return[DUMMY_ELT]}else{return result;}}}}
function findThisElement(elt,attribute){return getClosestMatch(elt,function(elt){return getAttributeValue(elt,attribute)!=null;})}
function getTarget(elt){var targetStr=getClosestAttributeValue(elt,"hx-target");if(targetStr){if(targetStr==="this"){return findThisElement(elt,'hx-target');}else{return querySelectorExt(elt,targetStr)}}else{var data=getInternalData(elt);if(data.boosted){return getDocument().body;}else{return elt;}}}
function shouldSettleAttribute(name){var attributesToSettle=htmx.config.attributesToSettle;for(var i=0;i<attributesToSettle.length;i++){if(name===attributesToSettle[i]){return true;}}
return false;}
function cloneAttributes(mergeTo,mergeFrom){forEach(mergeTo.attributes,function(attr){if(!mergeFrom.hasAttribute(attr.name)&&shouldSettleAttribute(attr.name)){mergeTo.removeAttribute(attr.name)}});forEach(mergeFrom.attributes,function(attr){if(shouldSettleAttribute(attr.name)){mergeTo.setAttribute(attr.name,attr.value);}});}
function isInlineSwap(swapStyle,target){var extensions=getExtensions(target);for(var i=0;i<extensions.length;i++){var extension=extensions[i];try{if(extension.isInlineSwap(swapStyle)){return true;}}catch(e){logError(e);}}
return swapStyle==="outerHTML";}
function oobSwap(oobValue,oobElement,settleInfo){var selector="#"+oobElement.id;var swapStyle="outerHTML";if(oobValue==="true"){}else if(oobValue.indexOf(":")>0){swapStyle=oobValue.substr(0,oobValue.indexOf(":"));selector=oobValue.substr(oobValue.indexOf(":")+1,oobValue.length);}else{swapStyle=oobValue;}
var targets=getDocument().querySelectorAll(selector);if(targets){forEach(targets,function(target){var fragment;var oobElementClone=oobElement.cloneNode(true);fragment=getDocument().createDocumentFragment();fragment.appendChild(oobElementClone);if(!isInlineSwap(swapStyle,target)){fragment=oobElementClone;}
var beforeSwapDetails={shouldSwap:true,target:target,fragment:fragment};if(!triggerEvent(target,'htmx:oobBeforeSwap',beforeSwapDetails))return;target=beforeSwapDetails.target;if(beforeSwapDetails['shouldSwap']){swap(swapStyle,target,target,fragment,settleInfo);}
forEach(settleInfo.elts,function(elt){triggerEvent(elt,'htmx:oobAfterSwap',beforeSwapDetails);});});oobElement.parentNode.removeChild(oobElement);}else{oobElement.parentNode.removeChild(oobElement);triggerErrorEvent(getDocument().body,"htmx:oobErrorNoTarget",{content:oobElement});}
return oobValue;}
function handleOutOfBandSwaps(elt,fragment,settleInfo){var oobSelects=getClosestAttributeValue(elt,"hx-select-oob");if(oobSelects){var oobSelectValues=oobSelects.split(",");for(let i=0;i<oobSelectValues.length;i++){var oobSelectValue=oobSelectValues[i].split(":",2);var id=oobSelectValue[0];if(id.indexOf("#")===0){id=id.substring(1);}
var oobValue=oobSelectValue[1]||"true";var oobElement=fragment.querySelector("#"+id);if(oobElement){oobSwap(oobValue,oobElement,settleInfo);}}}
forEach(findAll(fragment,'[hx-swap-oob], [data-hx-swap-oob]'),function(oobElement){var oobValue=getAttributeValue(oobElement,"hx-swap-oob");if(oobValue!=null){oobSwap(oobValue,oobElement,settleInfo);}});}
function handlePreservedElements(fragment){forEach(findAll(fragment,'[hx-preserve], [data-hx-preserve]'),function(preservedElt){var id=getAttributeValue(preservedElt,"id");var oldElt=getDocument().getElementById(id);if(oldElt!=null){preservedElt.parentNode.replaceChild(oldElt,preservedElt);}});}
function handleAttributes(parentNode,fragment,settleInfo){forEach(fragment.querySelectorAll("[id]"),function(newNode){if(newNode.id&&newNode.id.length>0){var oldNode=parentNode.querySelector(newNode.tagName+"[id='"+newNode.id+"']");if(oldNode&&oldNode!==parentNode){var newAttributes=newNode.cloneNode();cloneAttributes(newNode,oldNode);settleInfo.tasks.push(function(){cloneAttributes(newNode,newAttributes);});}}});}
function makeAjaxLoadTask(child){return function(){removeClassFromElement(child,htmx.config.addedClass);processNode(child);processScripts(child);processFocus(child)
triggerEvent(child,'htmx:load');};}
function processFocus(child){var autofocus="[autofocus]";var autoFocusedElt=matches(child,autofocus)?child:child.querySelector(autofocus)
if(autoFocusedElt!=null){autoFocusedElt.focus();}}
function insertNodesBefore(parentNode,insertBefore,fragment,settleInfo){handleAttributes(parentNode,fragment,settleInfo);while(fragment.childNodes.length>0){var child=fragment.firstChild;addClassToElement(child,htmx.config.addedClass);parentNode.insertBefore(child,insertBefore);if(child.nodeType!==Node.TEXT_NODE&&child.nodeType!==Node.COMMENT_NODE){settleInfo.tasks.push(makeAjaxLoadTask(child));}}}
function stringHash(string,hash){var char=0;while(char<string.length){hash=(hash<<5)-hash+string.charCodeAt(char++)|0;}
return hash;}
function attributeHash(elt){var hash=0;for(var i=0;i<elt.attributes.length;i++){var attribute=elt.attributes[i];if(attribute.value){hash=stringHash(attribute.name,hash);hash=stringHash(attribute.value,hash);}}
return hash;}
function deInitNode(element){var internalData=getInternalData(element);if(internalData.webSocket){internalData.webSocket.close();}
if(internalData.sseEventSource){internalData.sseEventSource.close();}
if(internalData.listenerInfos){forEach(internalData.listenerInfos,function(info){if(info.on){info.on.removeEventListener(info.trigger,info.listener);}});}}
function cleanUpElement(element){triggerEvent(element,"htmx:beforeCleanupElement")
deInitNode(element);if(element.children){forEach(element.children,function(child){cleanUpElement(child)});}}
function swapOuterHTML(target,fragment,settleInfo){if(target.tagName==="BODY"){return swapInnerHTML(target,fragment,settleInfo);}else{var newElt
var eltBeforeNewContent=target.previousSibling;insertNodesBefore(parentElt(target),target,fragment,settleInfo);if(eltBeforeNewContent==null){newElt=parentElt(target).firstChild;}else{newElt=eltBeforeNewContent.nextSibling;}
getInternalData(target).replacedWith=newElt;settleInfo.elts=[]
while(newElt&&newElt!==target){if(newElt.nodeType===Node.ELEMENT_NODE){settleInfo.elts.push(newElt);}
newElt=newElt.nextElementSibling;}
cleanUpElement(target);parentElt(target).removeChild(target);}}
function swapAfterBegin(target,fragment,settleInfo){return insertNodesBefore(target,target.firstChild,fragment,settleInfo);}
function swapBeforeBegin(target,fragment,settleInfo){return insertNodesBefore(parentElt(target),target,fragment,settleInfo);}
function swapBeforeEnd(target,fragment,settleInfo){return insertNodesBefore(target,null,fragment,settleInfo);}
function swapAfterEnd(target,fragment,settleInfo){return insertNodesBefore(parentElt(target),target.nextSibling,fragment,settleInfo);}
function swapDelete(target,fragment,settleInfo){cleanUpElement(target);return parentElt(target).removeChild(target);}
function swapInnerHTML(target,fragment,settleInfo){var firstChild=target.firstChild;insertNodesBefore(target,firstChild,fragment,settleInfo);if(firstChild){while(firstChild.nextSibling){cleanUpElement(firstChild.nextSibling)
target.removeChild(firstChild.nextSibling);}
cleanUpElement(firstChild)
target.removeChild(firstChild);}}
function maybeSelectFromResponse(elt,fragment){var selector=getClosestAttributeValue(elt,"hx-select");if(selector){var newFragment=getDocument().createDocumentFragment();forEach(fragment.querySelectorAll(selector),function(node){newFragment.appendChild(node);});fragment=newFragment;}
return fragment;}
function swap(swapStyle,elt,target,fragment,settleInfo){switch(swapStyle){case"none":return;case"outerHTML":swapOuterHTML(target,fragment,settleInfo);return;case"afterbegin":swapAfterBegin(target,fragment,settleInfo);return;case"beforebegin":swapBeforeBegin(target,fragment,settleInfo);return;case"beforeend":swapBeforeEnd(target,fragment,settleInfo);return;case"afterend":swapAfterEnd(target,fragment,settleInfo);return;case"delete":swapDelete(target,fragment,settleInfo);return;default:var extensions=getExtensions(elt);for(var i=0;i<extensions.length;i++){var ext=extensions[i];try{var newElements=ext.handleSwap(swapStyle,target,fragment,settleInfo);if(newElements){if(typeof newElements.length!=='undefined'){for(var j=0;j<newElements.length;j++){var child=newElements[j];if(child.nodeType!==Node.TEXT_NODE&&child.nodeType!==Node.COMMENT_NODE){settleInfo.tasks.push(makeAjaxLoadTask(child));}}}
return;}}catch(e){logError(e);}}
if(swapStyle==="innerHTML"){swapInnerHTML(target,fragment,settleInfo);}else{swap(htmx.config.defaultSwapStyle,elt,target,fragment,settleInfo);}}}
function findTitle(content){if(content.indexOf('<title')>-1){var contentWithSvgsRemoved=content.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,'');var result=contentWithSvgsRemoved.match(/<title(\s[^>]*>|>)([\s\S]*?)<\/title>/im);if(result){return result[2];}}}
function selectAndSwap(swapStyle,target,elt,responseText,settleInfo){settleInfo.title=findTitle(responseText);var fragment=makeFragment(responseText);if(fragment){handleOutOfBandSwaps(elt,fragment,settleInfo);fragment=maybeSelectFromResponse(elt,fragment);handlePreservedElements(fragment);return swap(swapStyle,elt,target,fragment,settleInfo);}}
function handleTrigger(xhr,header,elt){var triggerBody=xhr.getResponseHeader(header);if(triggerBody.indexOf("{")===0){var triggers=parseJSON(triggerBody);for(var eventName in triggers){if(triggers.hasOwnProperty(eventName)){var detail=triggers[eventName];if(!isRawObject(detail)){detail={"value":detail}}
triggerEvent(elt,eventName,detail);}}}else{triggerEvent(elt,triggerBody,[]);}}
var WHITESPACE=/\s/;var WHITESPACE_OR_COMMA=/[\s,]/;var SYMBOL_START=/[_$a-zA-Z]/;var SYMBOL_CONT=/[_$a-zA-Z0-9]/;var STRINGISH_START=['"',"'","/"];var NOT_WHITESPACE=/[^\s]/;function tokenizeString(str){var tokens=[];var position=0;while(position<str.length){if(SYMBOL_START.exec(str.charAt(position))){var startPosition=position;while(SYMBOL_CONT.exec(str.charAt(position+1))){position++;}
tokens.push(str.substr(startPosition,position-startPosition+1));}else if(STRINGISH_START.indexOf(str.charAt(position))!==-1){var startChar=str.charAt(position);var startPosition=position;position++;while(position<str.length&&str.charAt(position)!==startChar){if(str.charAt(position)==="\\"){position++;}
position++;}
tokens.push(str.substr(startPosition,position-startPosition+1));}else{var symbol=str.charAt(position);tokens.push(symbol);}
position++;}
return tokens;}
function isPossibleRelativeReference(token,last,paramName){return SYMBOL_START.exec(token.charAt(0))&&token!=="true"&&token!=="false"&&token!=="this"&&token!==paramName&&last!==".";}
function maybeGenerateConditional(elt,tokens,paramName){if(tokens[0]==='['){tokens.shift();var bracketCount=1;var conditionalSource=" return (function("+paramName+"){ return (";var last=null;while(tokens.length>0){var token=tokens[0];if(token==="]"){bracketCount--;if(bracketCount===0){if(last===null){conditionalSource=conditionalSource+"true";}
tokens.shift();conditionalSource+=")})";try{var conditionFunction=maybeEval(elt,function(){return Function(conditionalSource)();},function(){return true})
conditionFunction.source=conditionalSource;return conditionFunction;}catch(e){triggerErrorEvent(getDocument().body,"htmx:syntax:error",{error:e,source:conditionalSource})
return null;}}}else if(token==="["){bracketCount++;}
if(isPossibleRelativeReference(token,last,paramName)){conditionalSource+="(("+paramName+"."+token+") ? ("+paramName+"."+token+") : (window."+token+"))";}else{conditionalSource=conditionalSource+token;}
last=tokens.shift();}}}
function consumeUntil(tokens,match){var result="";while(tokens.length>0&&!tokens[0].match(match)){result+=tokens.shift();}
return result;}
var INPUT_SELECTOR='input, textarea, select';function getTriggerSpecs(elt){var explicitTrigger=getAttributeValue(elt,'hx-trigger');var triggerSpecs=[];if(explicitTrigger){var tokens=tokenizeString(explicitTrigger);do{consumeUntil(tokens,NOT_WHITESPACE);var initialLength=tokens.length;var trigger=consumeUntil(tokens,/[,\[\s]/);if(trigger!==""){if(trigger==="every"){var every={trigger:'every'};consumeUntil(tokens,NOT_WHITESPACE);every.pollInterval=parseInterval(consumeUntil(tokens,/[,\[\s]/));consumeUntil(tokens,NOT_WHITESPACE);var eventFilter=maybeGenerateConditional(elt,tokens,"event");if(eventFilter){every.eventFilter=eventFilter;}
triggerSpecs.push(every);}else if(trigger.indexOf("sse:")===0){triggerSpecs.push({trigger:'sse',sseEvent:trigger.substr(4)});}else{var triggerSpec={trigger:trigger};var eventFilter=maybeGenerateConditional(elt,tokens,"event");if(eventFilter){triggerSpec.eventFilter=eventFilter;}
while(tokens.length>0&&tokens[0]!==","){consumeUntil(tokens,NOT_WHITESPACE)
var token=tokens.shift();if(token==="changed"){triggerSpec.changed=true;}else if(token==="once"){triggerSpec.once=true;}else if(token==="consume"){triggerSpec.consume=true;}else if(token==="delay"&&tokens[0]===":"){tokens.shift();triggerSpec.delay=parseInterval(consumeUntil(tokens,WHITESPACE_OR_COMMA));}else if(token==="from"&&tokens[0]===":"){tokens.shift();var from_arg=consumeUntil(tokens,WHITESPACE_OR_COMMA);if(from_arg==="closest"||from_arg==="find"||from_arg==="next"||from_arg==="previous"){tokens.shift();from_arg+=" "+
consumeUntil(tokens,WHITESPACE_OR_COMMA);}
triggerSpec.from=from_arg;}else if(token==="target"&&tokens[0]===":"){tokens.shift();triggerSpec.target=consumeUntil(tokens,WHITESPACE_OR_COMMA);}else if(token==="throttle"&&tokens[0]===":"){tokens.shift();triggerSpec.throttle=parseInterval(consumeUntil(tokens,WHITESPACE_OR_COMMA));}else if(token==="queue"&&tokens[0]===":"){tokens.shift();triggerSpec.queue=consumeUntil(tokens,WHITESPACE_OR_COMMA);}else if((token==="root"||token==="threshold")&&tokens[0]===":"){tokens.shift();triggerSpec[token]=consumeUntil(tokens,WHITESPACE_OR_COMMA);}else{triggerErrorEvent(elt,"htmx:syntax:error",{token:tokens.shift()});}}
triggerSpecs.push(triggerSpec);}}
if(tokens.length===initialLength){triggerErrorEvent(elt,"htmx:syntax:error",{token:tokens.shift()});}
consumeUntil(tokens,NOT_WHITESPACE);}while(tokens[0]===","&&tokens.shift())}
if(triggerSpecs.length>0){return triggerSpecs;}else if(matches(elt,'form')){return[{trigger:'submit'}];}else if(matches(elt,'input[type="button"]')){return[{trigger:'click'}];}else if(matches(elt,INPUT_SELECTOR)){return[{trigger:'change'}];}else{return[{trigger:'click'}];}}
function cancelPolling(elt){getInternalData(elt).cancelled=true;}
function processPolling(elt,handler,spec){var nodeData=getInternalData(elt);nodeData.timeout=setTimeout(function(){if(bodyContains(elt)&&nodeData.cancelled!==true){if(!maybeFilterEvent(spec,makeEvent('hx:poll:trigger',{triggerSpec:spec,target:elt}))){handler(elt);}
processPolling(elt,handler,spec);}},spec.pollInterval);}
function isLocalLink(elt){return location.hostname===elt.hostname&&getRawAttribute(elt,'href')&&getRawAttribute(elt,'href').indexOf("#")!==0;}
function boostElement(elt,nodeData,triggerSpecs){if((elt.tagName==="A"&&isLocalLink(elt)&&(elt.target===""||elt.target==="_self"))||elt.tagName==="FORM"){nodeData.boosted=true;var verb,path;if(elt.tagName==="A"){verb="get";path=getRawAttribute(elt,'href');}else{var rawAttribute=getRawAttribute(elt,"method");verb=rawAttribute?rawAttribute.toLowerCase():"get";if(verb==="get"){}
path=getRawAttribute(elt,'action');}
triggerSpecs.forEach(function(triggerSpec){addEventListener(elt,function(evt){issueAjaxRequest(verb,path,elt,evt)},nodeData,triggerSpec,true);});}}
function shouldCancel(evt,elt){if(evt.type==="submit"||evt.type==="click"){if(elt.tagName==="FORM"){return true;}
if(matches(elt,'input[type="submit"], button')&&closest(elt,'form')!==null){return true;}
if(elt.tagName==="A"&&elt.href&&(elt.getAttribute('href')==='#'||elt.getAttribute('href').indexOf("#")!==0)){return true;}}
return false;}
function ignoreBoostedAnchorCtrlClick(elt,evt){return getInternalData(elt).boosted&&elt.tagName==="A"&&evt.type==="click"&&(evt.ctrlKey||evt.metaKey);}
function maybeFilterEvent(triggerSpec,evt){var eventFilter=triggerSpec.eventFilter;if(eventFilter){try{return eventFilter(evt)!==true;}catch(e){triggerErrorEvent(getDocument().body,"htmx:eventFilter:error",{error:e,source:eventFilter.source});return true;}}
return false;}
function addEventListener(elt,handler,nodeData,triggerSpec,explicitCancel){var eltsToListenOn;if(triggerSpec.from){eltsToListenOn=querySelectorAllExt(elt,triggerSpec.from);}else{eltsToListenOn=[elt];}
forEach(eltsToListenOn,function(eltToListenOn){var eventListener=function(evt){if(!bodyContains(elt)){eltToListenOn.removeEventListener(triggerSpec.trigger,eventListener);return;}
if(ignoreBoostedAnchorCtrlClick(elt,evt)){return;}
if(explicitCancel||shouldCancel(evt,elt)){evt.preventDefault();}
if(maybeFilterEvent(triggerSpec,evt)){return;}
var eventData=getInternalData(evt);eventData.triggerSpec=triggerSpec;if(eventData.handledFor==null){eventData.handledFor=[];}
var elementData=getInternalData(elt);if(eventData.handledFor.indexOf(elt)<0){eventData.handledFor.push(elt);if(triggerSpec.consume){evt.stopPropagation();}
if(triggerSpec.target&&evt.target){if(!matches(evt.target,triggerSpec.target)){return;}}
if(triggerSpec.once){if(elementData.triggeredOnce){return;}else{elementData.triggeredOnce=true;}}
if(triggerSpec.changed){if(elementData.lastValue===elt.value){return;}else{elementData.lastValue=elt.value;}}
if(elementData.delayed){clearTimeout(elementData.delayed);}
if(elementData.throttle){return;}
if(triggerSpec.throttle){if(!elementData.throttle){handler(elt,evt);elementData.throttle=setTimeout(function(){elementData.throttle=null;},triggerSpec.throttle);}}else if(triggerSpec.delay){elementData.delayed=setTimeout(function(){handler(elt,evt)},triggerSpec.delay);}else{handler(elt,evt);}}};if(nodeData.listenerInfos==null){nodeData.listenerInfos=[];}
nodeData.listenerInfos.push({trigger:triggerSpec.trigger,listener:eventListener,on:eltToListenOn})
eltToListenOn.addEventListener(triggerSpec.trigger,eventListener);})}
var windowIsScrolling=false
var scrollHandler=null;function initScrollHandler(){if(!scrollHandler){scrollHandler=function(){windowIsScrolling=true};window.addEventListener("scroll",scrollHandler)
setInterval(function(){if(windowIsScrolling){windowIsScrolling=false;forEach(getDocument().querySelectorAll("[hx-trigger='revealed'],[data-hx-trigger='revealed']"),function(elt){maybeReveal(elt);})}},200);}}
function maybeReveal(elt){if(!hasAttribute(elt,'data-hx-revealed')&&isScrolledIntoView(elt)){elt.setAttribute('data-hx-revealed','true');var nodeData=getInternalData(elt);if(nodeData.initHash===attributeHash(elt)){triggerEvent(elt,'revealed');}else{elt.addEventListener("htmx:afterProcessNode",function(evt){triggerEvent(elt,'revealed')},{once:true});}}}
function processWebSocketInfo(elt,nodeData,info){var values=splitOnWhitespace(info);for(var i=0;i<values.length;i++){var value=values[i].split(/:(.+)/);if(value[0]==="connect"){ensureWebSocket(elt,value[1],0);}
if(value[0]==="send"){processWebSocketSend(elt);}}}
function ensureWebSocket(elt,wssSource,retryCount){if(!bodyContains(elt)){return;}
if(wssSource.indexOf("/")==0){var base_part=location.hostname+(location.port?':'+location.port:'');if(location.protocol=='https:'){wssSource="wss://"+base_part+wssSource;}else if(location.protocol=='http:'){wssSource="ws://"+base_part+wssSource;}}
var socket=htmx.createWebSocket(wssSource);socket.onerror=function(e){triggerErrorEvent(elt,"htmx:wsError",{error:e,socket:socket});maybeCloseWebSocketSource(elt);};socket.onclose=function(e){if([1006,1012,1013].indexOf(e.code)>=0){var delay=getWebSocketReconnectDelay(retryCount);setTimeout(function(){ensureWebSocket(elt,wssSource,retryCount+1);},delay);}};socket.onopen=function(e){retryCount=0;}
getInternalData(elt).webSocket=socket;socket.addEventListener('message',function(event){if(maybeCloseWebSocketSource(elt)){return;}
var response=event.data;withExtensions(elt,function(extension){response=extension.transformResponse(response,null,elt);});var settleInfo=makeSettleInfo(elt);var fragment=makeFragment(response);var children=toArray(fragment.children);for(var i=0;i<children.length;i++){var child=children[i];oobSwap(getAttributeValue(child,"hx-swap-oob")||"true",child,settleInfo);}
settleImmediately(settleInfo.tasks);});}
function maybeCloseWebSocketSource(elt){if(!bodyContains(elt)){getInternalData(elt).webSocket.close();return true;}}
function processWebSocketSend(elt){var webSocketSourceElt=getClosestMatch(elt,function(parent){return getInternalData(parent).webSocket!=null;});if(webSocketSourceElt){elt.addEventListener(getTriggerSpecs(elt)[0].trigger,function(evt){var webSocket=getInternalData(webSocketSourceElt).webSocket;var headers=getHeaders(elt,webSocketSourceElt);var results=getInputValues(elt,'post');var errors=results.errors;var rawParameters=results.values;var expressionVars=getExpressionVars(elt);var allParameters=mergeObjects(rawParameters,expressionVars);var filteredParameters=filterValues(allParameters,elt);filteredParameters['HEADERS']=headers;if(errors&&errors.length>0){triggerEvent(elt,'htmx:validation:halted',errors);return;}
webSocket.send(JSON.stringify(filteredParameters));if(shouldCancel(evt,elt)){evt.preventDefault();}});}else{triggerErrorEvent(elt,"htmx:noWebSocketSourceError");}}
function getWebSocketReconnectDelay(retryCount){var delay=htmx.config.wsReconnectDelay;if(typeof delay==='function'){return delay(retryCount);}
if(delay==='full-jitter'){var exp=Math.min(retryCount,6);var maxDelay=1000*Math.pow(2,exp);return maxDelay*Math.random();}
logError('htmx.config.wsReconnectDelay must either be a function or the string "full-jitter"');}
function processSSEInfo(elt,nodeData,info){var values=splitOnWhitespace(info);for(var i=0;i<values.length;i++){var value=values[i].split(/:(.+)/);if(value[0]==="connect"){processSSESource(elt,value[1]);}
if((value[0]==="swap")){processSSESwap(elt,value[1])}}}
function processSSESource(elt,sseSrc){var source=htmx.createEventSource(sseSrc);source.onerror=function(e){triggerErrorEvent(elt,"htmx:sseError",{error:e,source:source});maybeCloseSSESource(elt);};getInternalData(elt).sseEventSource=source;}
function processSSESwap(elt,sseEventName){var sseSourceElt=getClosestMatch(elt,hasEventSource);if(sseSourceElt){var sseEventSource=getInternalData(sseSourceElt).sseEventSource;var sseListener=function(event){if(maybeCloseSSESource(sseSourceElt)){sseEventSource.removeEventListener(sseEventName,sseListener);return;}
var response=event.data;withExtensions(elt,function(extension){response=extension.transformResponse(response,null,elt);});var swapSpec=getSwapSpecification(elt)
var target=getTarget(elt)
var settleInfo=makeSettleInfo(elt);selectAndSwap(swapSpec.swapStyle,elt,target,response,settleInfo)
settleImmediately(settleInfo.tasks)
triggerEvent(elt,"htmx:sseMessage",event)};getInternalData(elt).sseListener=sseListener;sseEventSource.addEventListener(sseEventName,sseListener);}else{triggerErrorEvent(elt,"htmx:noSSESourceError");}}
function processSSETrigger(elt,handler,sseEventName){var sseSourceElt=getClosestMatch(elt,hasEventSource);if(sseSourceElt){var sseEventSource=getInternalData(sseSourceElt).sseEventSource;var sseListener=function(){if(!maybeCloseSSESource(sseSourceElt)){if(bodyContains(elt)){handler(elt);}else{sseEventSource.removeEventListener(sseEventName,sseListener);}}};getInternalData(elt).sseListener=sseListener;sseEventSource.addEventListener(sseEventName,sseListener);}else{triggerErrorEvent(elt,"htmx:noSSESourceError");}}
function maybeCloseSSESource(elt){if(!bodyContains(elt)){getInternalData(elt).sseEventSource.close();return true;}}
function hasEventSource(node){return getInternalData(node).sseEventSource!=null;}
function loadImmediately(elt,handler,nodeData,delay){var load=function(){if(!nodeData.loaded){nodeData.loaded=true;handler(elt);}}
if(delay){setTimeout(load,delay);}else{load();}}
function processVerbs(elt,nodeData,triggerSpecs){var explicitAction=false;forEach(VERBS,function(verb){if(hasAttribute(elt,'hx-'+verb)){var path=getAttributeValue(elt,'hx-'+verb);explicitAction=true;nodeData.path=path;nodeData.verb=verb;triggerSpecs.forEach(function(triggerSpec){addTriggerHandler(elt,triggerSpec,nodeData,function(elt,evt){issueAjaxRequest(verb,path,elt,evt)})});}});return explicitAction;}
function addTriggerHandler(elt,triggerSpec,nodeData,handler){if(triggerSpec.sseEvent){processSSETrigger(elt,handler,triggerSpec.sseEvent);}else if(triggerSpec.trigger==="revealed"){initScrollHandler();addEventListener(elt,handler,nodeData,triggerSpec);maybeReveal(elt);}else if(triggerSpec.trigger==="intersect"){var observerOptions={};if(triggerSpec.root){observerOptions.root=querySelectorExt(elt,triggerSpec.root)}
if(triggerSpec.threshold){observerOptions.threshold=parseFloat(triggerSpec.threshold);}
var observer=new IntersectionObserver(function(entries){for(var i=0;i<entries.length;i++){var entry=entries[i];if(entry.isIntersecting){triggerEvent(elt,"intersect");break;}}},observerOptions);observer.observe(elt);addEventListener(elt,handler,nodeData,triggerSpec);}else if(triggerSpec.trigger==="load"){if(!maybeFilterEvent(triggerSpec,makeEvent("load",{elt:elt}))){loadImmediately(elt,handler,nodeData,triggerSpec.delay);}}else if(triggerSpec.pollInterval){nodeData.polling=true;processPolling(elt,handler,triggerSpec);}else{addEventListener(elt,handler,nodeData,triggerSpec);}}
function evalScript(script){if(script.type==="text/javascript"||script.type==="module"||script.type===""){var newScript=getDocument().createElement("script");forEach(script.attributes,function(attr){newScript.setAttribute(attr.name,attr.value);});newScript.textContent=script.textContent;newScript.async=false;if(htmx.config.inlineScriptNonce){newScript.nonce=htmx.config.inlineScriptNonce;}
var parent=script.parentElement;try{parent.insertBefore(newScript,script);}catch(e){logError(e);}finally{parent.removeChild(script);}}}
function processScripts(elt){if(matches(elt,"script")){evalScript(elt);}
forEach(findAll(elt,"script"),function(script){evalScript(script);});}
function hasChanceOfBeingBoosted(){return document.querySelector("[hx-boost], [data-hx-boost]");}
function findElementsToProcess(elt){if(elt.querySelectorAll){var boostedElts=hasChanceOfBeingBoosted()?", a, form":"";var results=elt.querySelectorAll(VERB_SELECTOR+boostedElts+", [hx-sse], [data-hx-sse], [hx-ws],"+" [data-hx-ws], [hx-ext], [data-hx-ext]");return results;}else{return[];}}
function initButtonTracking(form){var maybeSetLastButtonClicked=function(evt){if(matches(evt.target,"button, input[type='submit']")){var internalData=getInternalData(form);internalData.lastButtonClicked=evt.target;}};form.addEventListener('click',maybeSetLastButtonClicked)
form.addEventListener('focusin',maybeSetLastButtonClicked)
form.addEventListener('focusout',function(evt){var internalData=getInternalData(form);internalData.lastButtonClicked=null;})}
function initNode(elt){if(elt.closest&&elt.closest(htmx.config.disableSelector)){return;}
var nodeData=getInternalData(elt);if(nodeData.initHash!==attributeHash(elt)){nodeData.initHash=attributeHash(elt);deInitNode(elt);triggerEvent(elt,"htmx:beforeProcessNode")
if(elt.value){nodeData.lastValue=elt.value;}
var triggerSpecs=getTriggerSpecs(elt);var explicitAction=processVerbs(elt,nodeData,triggerSpecs);if(!explicitAction&&getClosestAttributeValue(elt,"hx-boost")==="true"){boostElement(elt,nodeData,triggerSpecs);}
if(elt.tagName==="FORM"){initButtonTracking(elt);}
var sseInfo=getAttributeValue(elt,'hx-sse');if(sseInfo){processSSEInfo(elt,nodeData,sseInfo);}
var wsInfo=getAttributeValue(elt,'hx-ws');if(wsInfo){processWebSocketInfo(elt,nodeData,wsInfo);}
triggerEvent(elt,"htmx:afterProcessNode");}}
function processNode(elt){elt=resolveTarget(elt);initNode(elt);forEach(findElementsToProcess(elt),function(child){initNode(child)});}
function kebabEventName(str){return str.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();}
function makeEvent(eventName,detail){var evt;if(window.CustomEvent&&typeof window.CustomEvent==='function'){evt=new CustomEvent(eventName,{bubbles:true,cancelable:true,detail:detail});}else{evt=getDocument().createEvent('CustomEvent');evt.initCustomEvent(eventName,true,true,detail);}
return evt;}
function triggerErrorEvent(elt,eventName,detail){triggerEvent(elt,eventName,mergeObjects({error:eventName},detail));}
function ignoreEventForLogging(eventName){return eventName==="htmx:afterProcessNode"}
function withExtensions(elt,toDo){forEach(getExtensions(elt),function(extension){try{toDo(extension);}catch(e){logError(e);}});}
function logError(msg){if(console.error){console.error(msg);}else if(console.log){console.log("ERROR: ",msg);}}
function triggerEvent(elt,eventName,detail){elt=resolveTarget(elt);if(detail==null){detail={};}
detail["elt"]=elt;var event=makeEvent(eventName,detail);if(htmx.logger&&!ignoreEventForLogging(eventName)){htmx.logger(elt,eventName,detail);}
if(detail.error){logError(detail.error);triggerEvent(elt,"htmx:error",{errorInfo:detail})}
var eventResult=elt.dispatchEvent(event);var kebabName=kebabEventName(eventName);if(eventResult&&kebabName!==eventName){var kebabedEvent=makeEvent(kebabName,event.detail);eventResult=eventResult&&elt.dispatchEvent(kebabedEvent)}
withExtensions(elt,function(extension){eventResult=eventResult&&(extension.onEvent(eventName,event)!==false)});return eventResult;}
var currentPathForHistory=location.pathname+location.search;function getHistoryElement(){var historyElt=getDocument().querySelector('[hx-history-elt],[data-hx-history-elt]');return historyElt||getDocument().body;}
function saveToHistoryCache(url,content,title,scroll){if(!canAccessLocalStorage()){return;}
var historyCache=parseJSON(localStorage.getItem("htmx-history-cache"))||[];for(var i=0;i<historyCache.length;i++){if(historyCache[i].url===url){historyCache.splice(i,1);break;}}
historyCache.push({url:url,content:content,title:title,scroll:scroll})
while(historyCache.length>htmx.config.historyCacheSize){historyCache.shift();}
while(historyCache.length>0){try{localStorage.setItem("htmx-history-cache",JSON.stringify(historyCache));break;}catch(e){triggerErrorEvent(getDocument().body,"htmx:historyCacheError",{cause:e,cache:historyCache})
historyCache.shift();}}}
function getCachedHistory(url){if(!canAccessLocalStorage()){return null;}
var historyCache=parseJSON(localStorage.getItem("htmx-history-cache"))||[];for(var i=0;i<historyCache.length;i++){if(historyCache[i].url===url){return historyCache[i];}}
return null;}
function cleanInnerHtmlForHistory(elt){var className=htmx.config.requestClass;var clone=elt.cloneNode(true);forEach(findAll(clone,"."+className),function(child){removeClassFromElement(child,className);});return clone.innerHTML;}
function saveCurrentPageToHistory(){var elt=getHistoryElement();var path=currentPathForHistory||location.pathname+location.search;triggerEvent(getDocument().body,"htmx:beforeHistorySave",{path:path,historyElt:elt});if(htmx.config.historyEnabled)history.replaceState({htmx:true},getDocument().title,window.location.href);saveToHistoryCache(path,cleanInnerHtmlForHistory(elt),getDocument().title,window.scrollY);}
function pushUrlIntoHistory(path){if(htmx.config.historyEnabled)history.pushState({htmx:true},"",path);currentPathForHistory=path;}
function replaceUrlInHistory(path){if(htmx.config.historyEnabled)history.replaceState({htmx:true},"",path);currentPathForHistory=path;}
function settleImmediately(tasks){forEach(tasks,function(task){task.call();});}
function loadHistoryFromServer(path){var request=new XMLHttpRequest();var details={path:path,xhr:request};triggerEvent(getDocument().body,"htmx:historyCacheMiss",details);request.open('GET',path,true);request.setRequestHeader("HX-History-Restore-Request","true");request.onload=function(){if(this.status>=200&&this.status<400){triggerEvent(getDocument().body,"htmx:historyCacheMissLoad",details);var fragment=makeFragment(this.response);fragment=fragment.querySelector('[hx-history-elt],[data-hx-history-elt]')||fragment;var historyElement=getHistoryElement();var settleInfo=makeSettleInfo(historyElement);var title=findTitle(this.response);if(title){var titleElt=find("title");if(titleElt){titleElt.innerHTML=title;}else{window.document.title=title;}}
swapInnerHTML(historyElement,fragment,settleInfo)
settleImmediately(settleInfo.tasks);currentPathForHistory=path;triggerEvent(getDocument().body,"htmx:historyRestore",{path:path});}else{triggerErrorEvent(getDocument().body,"htmx:historyCacheMissLoadError",details);}};request.send();}
function restoreHistory(path){saveCurrentPageToHistory();path=path||location.pathname+location.search;var cached=getCachedHistory(path);if(cached){var fragment=makeFragment(cached.content);var historyElement=getHistoryElement();var settleInfo=makeSettleInfo(historyElement);swapInnerHTML(historyElement,fragment,settleInfo)
settleImmediately(settleInfo.tasks);document.title=cached.title;window.scrollTo(0,cached.scroll);currentPathForHistory=path;triggerEvent(getDocument().body,"htmx:historyRestore",{path:path});}else{if(htmx.config.refreshOnHistoryMiss){window.location.reload(true);}else{loadHistoryFromServer(path);}}}
function addRequestIndicatorClasses(elt){var indicators=findAttributeTargets(elt,'hx-indicator');if(indicators==null){indicators=[elt];}
forEach(indicators,function(ic){var internalData=getInternalData(ic);internalData.requestCount=(internalData.requestCount||0)+1;ic.classList["add"].call(ic.classList,htmx.config.requestClass);});return indicators;}
function removeRequestIndicatorClasses(indicators){forEach(indicators,function(ic){var internalData=getInternalData(ic);internalData.requestCount=(internalData.requestCount||0)-1;if(internalData.requestCount===0){ic.classList["remove"].call(ic.classList,htmx.config.requestClass);}});}
function haveSeenNode(processed,elt){for(var i=0;i<processed.length;i++){var node=processed[i];if(node.isSameNode(elt)){return true;}}
return false;}
function shouldInclude(elt){if(elt.name===""||elt.name==null||elt.disabled){return false;}
if(elt.type==="button"||elt.type==="submit"||elt.tagName==="image"||elt.tagName==="reset"||elt.tagName==="file"){return false;}
if(elt.type==="checkbox"||elt.type==="radio"){return elt.checked;}
return true;}
function processInputValue(processed,values,errors,elt,validate){if(elt==null||haveSeenNode(processed,elt)){return;}else{processed.push(elt);}
if(shouldInclude(elt)){var name=getRawAttribute(elt,"name");var value=elt.value;if(elt.multiple){value=toArray(elt.querySelectorAll("option:checked")).map(function(e){return e.value});}
if(elt.files){value=toArray(elt.files);}
if(name!=null&&value!=null){var current=values[name];if(current){if(Array.isArray(current)){if(Array.isArray(value)){values[name]=current.concat(value);}else{current.push(value);}}else{if(Array.isArray(value)){values[name]=[current].concat(value);}else{values[name]=[current,value];}}}else{values[name]=value;}}
if(validate){validateElement(elt,errors);}}
if(matches(elt,'form')){var inputs=elt.elements;forEach(inputs,function(input){processInputValue(processed,values,errors,input,validate);});}}
function validateElement(element,errors){if(element.willValidate){triggerEvent(element,"htmx:validation:validate")
if(!element.checkValidity()){errors.push({elt:element,message:element.validationMessage,validity:element.validity});triggerEvent(element,"htmx:validation:failed",{message:element.validationMessage,validity:element.validity})}}}
function getInputValues(elt,verb){var processed=[];var values={};var formValues={};var errors=[];var internalData=getInternalData(elt);var validate=(matches(elt,'form')&&elt.noValidate!==true)||getAttributeValue(elt,"hx-validate")==="true";if(internalData.lastButtonClicked){validate=validate&&internalData.lastButtonClicked.formNoValidate!==true;}
if(verb!=='get'){processInputValue(processed,formValues,errors,closest(elt,'form'),validate);}
processInputValue(processed,values,errors,elt,validate);if(internalData.lastButtonClicked){var name=getRawAttribute(internalData.lastButtonClicked,"name");if(name){values[name]=internalData.lastButtonClicked.value;}}
var includes=findAttributeTargets(elt,"hx-include");forEach(includes,function(node){processInputValue(processed,values,errors,node,validate);if(!matches(node,'form')){forEach(node.querySelectorAll(INPUT_SELECTOR),function(descendant){processInputValue(processed,values,errors,descendant,validate);})}});values=mergeObjects(values,formValues);return{errors:errors,values:values};}
function appendParam(returnStr,name,realValue){if(returnStr!==""){returnStr+="&";}
if(String(realValue)==="[object Object]"){realValue=JSON.stringify(realValue);}
var s=encodeURIComponent(realValue);returnStr+=encodeURIComponent(name)+"="+s;return returnStr;}
function urlEncode(values){var returnStr="";for(var name in values){if(values.hasOwnProperty(name)){var value=values[name];if(Array.isArray(value)){forEach(value,function(v){returnStr=appendParam(returnStr,name,v);});}else{returnStr=appendParam(returnStr,name,value);}}}
return returnStr;}
function makeFormData(values){var formData=new FormData();for(var name in values){if(values.hasOwnProperty(name)){var value=values[name];if(Array.isArray(value)){forEach(value,function(v){formData.append(name,v);});}else{formData.append(name,value);}}}
return formData;}
function getHeaders(elt,target,prompt){var headers={"HX-Request":"true","HX-Trigger":getRawAttribute(elt,"id"),"HX-Trigger-Name":getRawAttribute(elt,"name"),"HX-Target":getAttributeValue(target,"id"),"HX-Current-URL":getDocument().location.href,}
getValuesForElement(elt,"hx-headers",false,headers)
if(prompt!==undefined){headers["HX-Prompt"]=prompt;}
if(getInternalData(elt).boosted){headers["HX-Boosted"]="true";}
return headers;}
function filterValues(inputValues,elt){var paramsValue=getClosestAttributeValue(elt,"hx-params");if(paramsValue){if(paramsValue==="none"){return{};}else if(paramsValue==="*"){return inputValues;}else if(paramsValue.indexOf("not ")===0){forEach(paramsValue.substr(4).split(","),function(name){name=name.trim();delete inputValues[name];});return inputValues;}else{var newValues={}
forEach(paramsValue.split(","),function(name){name=name.trim();newValues[name]=inputValues[name];});return newValues;}}else{return inputValues;}}
function isAnchorLink(elt){return getRawAttribute(elt,'href')&&getRawAttribute(elt,'href').indexOf("#")>=0}
function getSwapSpecification(elt,swapInfoOverride){var swapInfo=swapInfoOverride?swapInfoOverride:getClosestAttributeValue(elt,"hx-swap");var swapSpec={"swapStyle":getInternalData(elt).boosted?'innerHTML':htmx.config.defaultSwapStyle,"swapDelay":htmx.config.defaultSwapDelay,"settleDelay":htmx.config.defaultSettleDelay}
if(getInternalData(elt).boosted&&!isAnchorLink(elt)){swapSpec["show"]="top"}
if(swapInfo){var split=splitOnWhitespace(swapInfo);if(split.length>0){swapSpec["swapStyle"]=split[0];for(var i=1;i<split.length;i++){var modifier=split[i];if(modifier.indexOf("swap:")===0){swapSpec["swapDelay"]=parseInterval(modifier.substr(5));}
if(modifier.indexOf("settle:")===0){swapSpec["settleDelay"]=parseInterval(modifier.substr(7));}
if(modifier.indexOf("scroll:")===0){var scrollSpec=modifier.substr(7);var splitSpec=scrollSpec.split(":");var scrollVal=splitSpec.pop();var selectorVal=splitSpec.length>0?splitSpec.join(":"):null;swapSpec["scroll"]=scrollVal;swapSpec["scrollTarget"]=selectorVal;}
if(modifier.indexOf("show:")===0){var showSpec=modifier.substr(5);var splitSpec=showSpec.split(":");var showVal=splitSpec.pop();var selectorVal=splitSpec.length>0?splitSpec.join(":"):null;swapSpec["show"]=showVal;swapSpec["showTarget"]=selectorVal;}
if(modifier.indexOf("focus-scroll:")===0){var focusScrollVal=modifier.substr("focus-scroll:".length);swapSpec["focusScroll"]=focusScrollVal=="true";}}}}
return swapSpec;}
function usesFormData(elt){return getClosestAttributeValue(elt,"hx-encoding")==="multipart/form-data"||(matches(elt,"form")&&getRawAttribute(elt,'enctype')==="multipart/form-data");}
function encodeParamsForBody(xhr,elt,filteredParameters){var encodedParameters=null;withExtensions(elt,function(extension){if(encodedParameters==null){encodedParameters=extension.encodeParameters(xhr,filteredParameters,elt);}});if(encodedParameters!=null){return encodedParameters;}else{if(usesFormData(elt)){return makeFormData(filteredParameters);}else{return urlEncode(filteredParameters);}}}
function makeSettleInfo(target){return{tasks:[],elts:[target]};}
function updateScrollState(content,swapSpec){var first=content[0];var last=content[content.length-1];if(swapSpec.scroll){var target=null;if(swapSpec.scrollTarget){target=querySelectorExt(first,swapSpec.scrollTarget);}
if(swapSpec.scroll==="top"&&(first||target)){target=target||first;target.scrollTop=0;}
if(swapSpec.scroll==="bottom"&&(last||target)){target=target||last;target.scrollTop=target.scrollHeight;}}
if(swapSpec.show){var target=null;if(swapSpec.showTarget){var targetStr=swapSpec.showTarget;if(swapSpec.showTarget==="window"){targetStr="body";}
target=querySelectorExt(first,targetStr);}
if(swapSpec.show==="top"&&(first||target)){target=target||first;target.scrollIntoView({block:'start',behavior:htmx.config.scrollBehavior});}
if(swapSpec.show==="bottom"&&(last||target)){target=target||last;target.scrollIntoView({block:'end',behavior:htmx.config.scrollBehavior});}}}
function getValuesForElement(elt,attr,evalAsDefault,values){if(values==null){values={};}
if(elt==null){return values;}
var attributeValue=getAttributeValue(elt,attr);if(attributeValue){var str=attributeValue.trim();var evaluateValue=evalAsDefault;if(str==="unset"){return null;}
if(str.indexOf("javascript:")===0){str=str.substr(11);evaluateValue=true;}else if(str.indexOf("js:")===0){str=str.substr(3);evaluateValue=true;}
if(str.indexOf('{')!==0){str="{"+str+"}";}
var varsValues;if(evaluateValue){varsValues=maybeEval(elt,function(){return Function("return ("+str+")")();},{});}else{varsValues=parseJSON(str);}
for(var key in varsValues){if(varsValues.hasOwnProperty(key)){if(values[key]==null){values[key]=varsValues[key];}}}}
return getValuesForElement(parentElt(elt),attr,evalAsDefault,values);}
function maybeEval(elt,toEval,defaultVal){if(htmx.config.allowEval){return toEval();}else{triggerErrorEvent(elt,'htmx:evalDisallowedError');return defaultVal;}}
function getHXVarsForElement(elt,expressionVars){return getValuesForElement(elt,"hx-vars",true,expressionVars);}
function getHXValsForElement(elt,expressionVars){return getValuesForElement(elt,"hx-vals",false,expressionVars);}
function getExpressionVars(elt){return mergeObjects(getHXVarsForElement(elt),getHXValsForElement(elt));}
function safelySetHeaderValue(xhr,header,headerValue){if(headerValue!==null){try{xhr.setRequestHeader(header,headerValue);}catch(e){xhr.setRequestHeader(header,encodeURIComponent(headerValue));xhr.setRequestHeader(header+"-URI-AutoEncoded","true");}}}
function getPathFromResponse(xhr){if(xhr.responseURL&&typeof(URL)!=="undefined"){try{var url=new URL(xhr.responseURL);return url.pathname+url.search;}catch(e){triggerErrorEvent(getDocument().body,"htmx:badResponseUrl",{url:xhr.responseURL});}}}
function hasHeader(xhr,regexp){return xhr.getAllResponseHeaders().match(regexp);}
function ajaxHelper(verb,path,context){verb=verb.toLowerCase();if(context){if(context instanceof Element||isType(context,'String')){return issueAjaxRequest(verb,path,null,null,{targetOverride:resolveTarget(context),returnPromise:true});}else{return issueAjaxRequest(verb,path,resolveTarget(context.source),context.event,{handler:context.handler,headers:context.headers,values:context.values,targetOverride:resolveTarget(context.target),swapOverride:context.swap,returnPromise:true});}}else{return issueAjaxRequest(verb,path,null,null,{returnPromise:true});}}
function hierarchyForElt(elt){var arr=[];while(elt){arr.push(elt);elt=elt.parentElement;}
return arr;}
function issueAjaxRequest(verb,path,elt,event,etc){var resolve=null;var reject=null;etc=etc!=null?etc:{};if(etc.returnPromise&&typeof Promise!=="undefined"){var promise=new Promise(function(_resolve,_reject){resolve=_resolve;reject=_reject;});}
if(elt==null){elt=getDocument().body;}
var responseHandler=etc.handler||handleAjaxResponse;if(!bodyContains(elt)){return;}
var target=etc.targetOverride||getTarget(elt);if(target==null||target==DUMMY_ELT){triggerErrorEvent(elt,'htmx:targetError',{target:getAttributeValue(elt,"hx-target")});return;}
var syncElt=elt;var eltData=getInternalData(elt);var syncStrategy=getClosestAttributeValue(elt,"hx-sync");var queueStrategy=null;var abortable=false;if(syncStrategy){var syncStrings=syncStrategy.split(":");var selector=syncStrings[0].trim();if(selector==="this"){syncElt=findThisElement(elt,'hx-sync');}else{syncElt=querySelectorExt(elt,selector);}
syncStrategy=(syncStrings[1]||'drop').trim();eltData=getInternalData(syncElt);if(syncStrategy==="drop"&&eltData.xhr&&eltData.abortable!==true){return;}else if(syncStrategy==="abort"){if(eltData.xhr){return;}else{abortable=true;}}else if(syncStrategy==="replace"){triggerEvent(syncElt,'htmx:abort');}else if(syncStrategy.indexOf("queue")===0){var queueStrArray=syncStrategy.split(" ");queueStrategy=(queueStrArray[1]||"last").trim();}}
if(eltData.xhr){if(eltData.abortable){triggerEvent(syncElt,'htmx:abort');}else{if(queueStrategy==null){if(event){var eventData=getInternalData(event);if(eventData&&eventData.triggerSpec&&eventData.triggerSpec.queue){queueStrategy=eventData.triggerSpec.queue;}}
if(queueStrategy==null){queueStrategy="last";}}
if(eltData.queuedRequests==null){eltData.queuedRequests=[];}
if(queueStrategy==="first"&&eltData.queuedRequests.length===0){eltData.queuedRequests.push(function(){issueAjaxRequest(verb,path,elt,event,etc)});}else if(queueStrategy==="all"){eltData.queuedRequests.push(function(){issueAjaxRequest(verb,path,elt,event,etc)});}else if(queueStrategy==="last"){eltData.queuedRequests=[];eltData.queuedRequests.push(function(){issueAjaxRequest(verb,path,elt,event,etc)});}
return;}}
var xhr=new XMLHttpRequest();eltData.xhr=xhr;eltData.abortable=abortable;var endRequestLock=function(){eltData.xhr=null;eltData.abortable=false;if(eltData.queuedRequests!=null&&eltData.queuedRequests.length>0){var queuedRequest=eltData.queuedRequests.shift();queuedRequest();}}
var promptQuestion=getClosestAttributeValue(elt,"hx-prompt");if(promptQuestion){var promptResponse=prompt(promptQuestion);if(promptResponse===null||!triggerEvent(elt,'htmx:prompt',{prompt:promptResponse,target:target})){maybeCall(resolve);endRequestLock();return promise;}}
var confirmQuestion=getClosestAttributeValue(elt,"hx-confirm");if(confirmQuestion){if(!confirm(confirmQuestion)){maybeCall(resolve);endRequestLock()
return promise;}}
var headers=getHeaders(elt,target,promptResponse);if(etc.headers){headers=mergeObjects(headers,etc.headers);}
var results=getInputValues(elt,verb);var errors=results.errors;var rawParameters=results.values;if(etc.values){rawParameters=mergeObjects(rawParameters,etc.values);}
var expressionVars=getExpressionVars(elt);var allParameters=mergeObjects(rawParameters,expressionVars);var filteredParameters=filterValues(allParameters,elt);if(verb!=='get'&&!usesFormData(elt)){headers['Content-Type']='application/x-www-form-urlencoded';}
if(path==null||path===""){path=getDocument().location.href;}
var requestAttrValues=getValuesForElement(elt,'hx-request');var requestConfig={parameters:filteredParameters,unfilteredParameters:allParameters,headers:headers,target:target,verb:verb,errors:errors,withCredentials:etc.credentials||requestAttrValues.credentials||htmx.config.withCredentials,timeout:etc.timeout||requestAttrValues.timeout||htmx.config.timeout,path:path,triggeringEvent:event};if(!triggerEvent(elt,'htmx:configRequest',requestConfig)){maybeCall(resolve);endRequestLock();return promise;}
path=requestConfig.path;verb=requestConfig.verb;headers=requestConfig.headers;filteredParameters=requestConfig.parameters;errors=requestConfig.errors;if(errors&&errors.length>0){triggerEvent(elt,'htmx:validation:halted',requestConfig)
maybeCall(resolve);endRequestLock();return promise;}
var splitPath=path.split("#");var pathNoAnchor=splitPath[0];var anchor=splitPath[1];var finalPathForGet=null;if(verb==='get'){finalPathForGet=pathNoAnchor;var values=Object.keys(filteredParameters).length!==0;if(values){if(finalPathForGet.indexOf("?")<0){finalPathForGet+="?";}else{finalPathForGet+="&";}
finalPathForGet+=urlEncode(filteredParameters);if(anchor){finalPathForGet+="#"+anchor;}}
xhr.open('GET',finalPathForGet,true);}else{xhr.open(verb.toUpperCase(),path,true);}
xhr.overrideMimeType("text/html");xhr.withCredentials=requestConfig.withCredentials;xhr.timeout=requestConfig.timeout;if(requestAttrValues.noHeaders){}else{for(var header in headers){if(headers.hasOwnProperty(header)){var headerValue=headers[header];safelySetHeaderValue(xhr,header,headerValue);}}}
var responseInfo={xhr:xhr,target:target,requestConfig:requestConfig,etc:etc,pathInfo:{requestPath:path,finalRequestPath:finalPathForGet||path,anchor:anchor}};xhr.onload=function(){try{var hierarchy=hierarchyForElt(elt);responseInfo.pathInfo.responsePath=getPathFromResponse(xhr);responseHandler(elt,responseInfo);removeRequestIndicatorClasses(indicators);triggerEvent(elt,'htmx:afterRequest',responseInfo);triggerEvent(elt,'htmx:afterOnLoad',responseInfo);if(!bodyContains(elt)){var secondaryTriggerElt=null;while(hierarchy.length>0&&secondaryTriggerElt==null){var parentEltInHierarchy=hierarchy.shift();if(bodyContains(parentEltInHierarchy)){secondaryTriggerElt=parentEltInHierarchy;}}
if(secondaryTriggerElt){triggerEvent(secondaryTriggerElt,'htmx:afterRequest',responseInfo);triggerEvent(secondaryTriggerElt,'htmx:afterOnLoad',responseInfo);}}
maybeCall(resolve);endRequestLock();}catch(e){triggerErrorEvent(elt,'htmx:onLoadError',mergeObjects({error:e},responseInfo));throw e;}}
xhr.onerror=function(){removeRequestIndicatorClasses(indicators);triggerErrorEvent(elt,'htmx:afterRequest',responseInfo);triggerErrorEvent(elt,'htmx:sendError',responseInfo);maybeCall(reject);endRequestLock();}
xhr.onabort=function(){removeRequestIndicatorClasses(indicators);triggerErrorEvent(elt,'htmx:afterRequest',responseInfo);triggerErrorEvent(elt,'htmx:sendAbort',responseInfo);maybeCall(reject);endRequestLock();}
xhr.ontimeout=function(){removeRequestIndicatorClasses(indicators);triggerErrorEvent(elt,'htmx:afterRequest',responseInfo);triggerErrorEvent(elt,'htmx:timeout',responseInfo);maybeCall(reject);endRequestLock();}
if(!triggerEvent(elt,'htmx:beforeRequest',responseInfo)){maybeCall(resolve);endRequestLock()
return promise}
var indicators=addRequestIndicatorClasses(elt);forEach(['loadstart','loadend','progress','abort'],function(eventName){forEach([xhr,xhr.upload],function(target){target.addEventListener(eventName,function(event){triggerEvent(elt,"htmx:xhr:"+eventName,{lengthComputable:event.lengthComputable,loaded:event.loaded,total:event.total});})});});triggerEvent(elt,'htmx:beforeSend',responseInfo);xhr.send(verb==='get'?null:encodeParamsForBody(xhr,elt,filteredParameters));return promise;}
function determineHistoryUpdates(elt,responseInfo){var xhr=responseInfo.xhr;var pathFromHeaders=null;var typeFromHeaders=null;if(hasHeader(xhr,/HX-Push:/i)){pathFromHeaders=xhr.getResponseHeader("HX-Push");typeFromHeaders="push";}else if(hasHeader(xhr,/HX-Push-Url:/i)){pathFromHeaders=xhr.getResponseHeader("HX-Push-Url");typeFromHeaders="push";}else if(hasHeader(xhr,/HX-Replace-Url:/i)){pathFromHeaders=xhr.getResponseHeader("HX-Replace-Url");typeFromHeaders="replace";}
if(pathFromHeaders){if(pathFromHeaders==="false"){return{}}else{return{type:typeFromHeaders,path:pathFromHeaders}}}
var requestPath=responseInfo.pathInfo.finalRequestPath;var responsePath=responseInfo.pathInfo.responsePath;var pushUrl=getClosestAttributeValue(elt,"hx-push-url");var replaceUrl=getClosestAttributeValue(elt,"hx-replace-url");var elementIsBoosted=getInternalData(elt).boosted;var saveType=null;var path=null;if(pushUrl){saveType="push";path=pushUrl;}else if(replaceUrl){saveType="replace";path=replaceUrl;}else if(elementIsBoosted){saveType="push";path=responsePath||requestPath;}
if(path){if(path==="false"){return{};}
if(path==="true"){path=responsePath||requestPath;}
if(responseInfo.pathInfo.anchor&&path.indexOf("#")===-1){path=path+"#"+responseInfo.pathInfo.anchor;}
return{type:saveType,path:path}}else{return{};}}
function handleAjaxResponse(elt,responseInfo){var xhr=responseInfo.xhr;var target=responseInfo.target;var etc=responseInfo.etc;if(!triggerEvent(elt,'htmx:beforeOnLoad',responseInfo))return;if(hasHeader(xhr,/HX-Trigger:/i)){handleTrigger(xhr,"HX-Trigger",elt);}
if(hasHeader(xhr,/HX-Location:/i)){saveCurrentPageToHistory();var redirectPath=xhr.getResponseHeader("HX-Location");var swapSpec;if(redirectPath.indexOf("{")===0){swapSpec=parseJSON(redirectPath);redirectPath=swapSpec['path'];delete swapSpec['path'];}
ajaxHelper('GET',redirectPath,swapSpec).then(()=>{pushUrlIntoHistory(redirectPath);});return;}
if(hasHeader(xhr,/HX-Redirect:/i)){location.href=xhr.getResponseHeader("HX-Redirect");return;}
if(hasHeader(xhr,/HX-Refresh:/i)){if("true"===xhr.getResponseHeader("HX-Refresh")){location.reload();return;}}
if(hasHeader(xhr,/HX-Retarget:/i)){responseInfo.target=getDocument().querySelector(xhr.getResponseHeader("HX-Retarget"));}
var historyUpdate=determineHistoryUpdates(elt,responseInfo);var shouldSwap=xhr.status>=200&&xhr.status<400&&xhr.status!==204;var serverResponse=xhr.response;var isError=xhr.status>=400;var beforeSwapDetails=mergeObjects({shouldSwap:shouldSwap,serverResponse:serverResponse,isError:isError},responseInfo);if(!triggerEvent(target,'htmx:beforeSwap',beforeSwapDetails))return;target=beforeSwapDetails.target;serverResponse=beforeSwapDetails.serverResponse;isError=beforeSwapDetails.isError;responseInfo.failed=isError;responseInfo.successful=!isError;if(beforeSwapDetails.shouldSwap){if(xhr.status===286){cancelPolling(elt);}
withExtensions(elt,function(extension){serverResponse=extension.transformResponse(serverResponse,xhr,elt);});if(historyUpdate.type){saveCurrentPageToHistory();}
var swapOverride=etc.swapOverride;if(hasHeader(xhr,/HX-Reswap:/i)){swapOverride=xhr.getResponseHeader("HX-Reswap");}
var swapSpec=getSwapSpecification(elt,swapOverride);target.classList.add(htmx.config.swappingClass);var doSwap=function(){try{var activeElt=document.activeElement;var selectionInfo={};try{selectionInfo={elt:activeElt,start:activeElt?activeElt.selectionStart:null,end:activeElt?activeElt.selectionEnd:null};}catch(e){}
var settleInfo=makeSettleInfo(target);selectAndSwap(swapSpec.swapStyle,target,elt,serverResponse,settleInfo);if(selectionInfo.elt&&!bodyContains(selectionInfo.elt)&&selectionInfo.elt.id){var newActiveElt=document.getElementById(selectionInfo.elt.id);var focusOptions={preventScroll:swapSpec.focusScroll!==undefined?!swapSpec.focusScroll:!htmx.config.defaultFocusScroll};if(newActiveElt){if(selectionInfo.start&&newActiveElt.setSelectionRange){newActiveElt.setSelectionRange(selectionInfo.start,selectionInfo.end);}
newActiveElt.focus(focusOptions);}}
target.classList.remove(htmx.config.swappingClass);forEach(settleInfo.elts,function(elt){if(elt.classList){elt.classList.add(htmx.config.settlingClass);}
triggerEvent(elt,'htmx:afterSwap',responseInfo);});if(hasHeader(xhr,/HX-Trigger-After-Swap:/i)){var finalElt=elt;if(!bodyContains(elt)){finalElt=getDocument().body;}
handleTrigger(xhr,"HX-Trigger-After-Swap",finalElt);}
var doSettle=function(){forEach(settleInfo.tasks,function(task){task.call();});forEach(settleInfo.elts,function(elt){if(elt.classList){elt.classList.remove(htmx.config.settlingClass);}
triggerEvent(elt,'htmx:afterSettle',responseInfo);});if(historyUpdate.type){if(historyUpdate.type==="push"){pushUrlIntoHistory(historyUpdate.path);triggerEvent(getDocument().body,'htmx:pushedIntoHistory',{path:historyUpdate.path});}else{replaceUrlInHistory(historyUpdate.path);triggerEvent(getDocument().body,'htmx:replacedInHistory',{path:historyUpdate.path});}}
if(responseInfo.pathInfo.anchor){var anchorTarget=find("#"+responseInfo.pathInfo.anchor);if(anchorTarget){anchorTarget.scrollIntoView({block:'start',behavior:"auto"});}}
if(settleInfo.title){var titleElt=find("title");if(titleElt){titleElt.innerHTML=settleInfo.title;}else{window.document.title=settleInfo.title;}}
updateScrollState(settleInfo.elts,swapSpec);if(hasHeader(xhr,/HX-Trigger-After-Settle:/i)){var finalElt=elt;if(!bodyContains(elt)){finalElt=getDocument().body;}
handleTrigger(xhr,"HX-Trigger-After-Settle",finalElt);}}
if(swapSpec.settleDelay>0){setTimeout(doSettle,swapSpec.settleDelay)}else{doSettle();}}catch(e){triggerErrorEvent(elt,'htmx:swapError',responseInfo);throw e;}};if(swapSpec.swapDelay>0){setTimeout(doSwap,swapSpec.swapDelay)}else{doSwap();}}
if(isError){triggerErrorEvent(elt,'htmx:responseError',mergeObjects({error:"Response Status Error Code "+xhr.status+" from "+responseInfo.pathInfo.path},responseInfo));}}
var extensions={};function extensionBase(){return{init:function(api){return null;},onEvent:function(name,evt){return true;},transformResponse:function(text,xhr,elt){return text;},isInlineSwap:function(swapStyle){return false;},handleSwap:function(swapStyle,target,fragment,settleInfo){return false;},encodeParameters:function(xhr,parameters,elt){return null;}}}
function defineExtension(name,extension){if(extension.init){extension.init(internalAPI)}
extensions[name]=mergeObjects(extensionBase(),extension);}
function removeExtension(name){delete extensions[name];}
function getExtensions(elt,extensionsToReturn,extensionsToIgnore){if(elt==undefined){return extensionsToReturn;}
if(extensionsToReturn==undefined){extensionsToReturn=[];}
if(extensionsToIgnore==undefined){extensionsToIgnore=[];}
var extensionsForElement=getAttributeValue(elt,"hx-ext");if(extensionsForElement){forEach(extensionsForElement.split(","),function(extensionName){extensionName=extensionName.replace(/ /g,'');if(extensionName.slice(0,7)=="ignore:"){extensionsToIgnore.push(extensionName.slice(7));return;}
if(extensionsToIgnore.indexOf(extensionName)<0){var extension=extensions[extensionName];if(extension&&extensionsToReturn.indexOf(extension)<0){extensionsToReturn.push(extension);}}});}
return getExtensions(parentElt(elt),extensionsToReturn,extensionsToIgnore);}
function ready(fn){if(getDocument().readyState!=='loading'){fn();}else{getDocument().addEventListener('DOMContentLoaded',fn);}}
function insertIndicatorStyles(){if(htmx.config.includeIndicatorStyles!==false){getDocument().head.insertAdjacentHTML("beforeend","<style>\
                      ."+htmx.config.indicatorClass+"{opacity:0;transition: opacity 200ms ease-in;}\
                      ."+htmx.config.requestClass+" ."+htmx.config.indicatorClass+"{opacity:1}\
                      ."+htmx.config.requestClass+"."+htmx.config.indicatorClass+"{opacity:1}\
                    </style>");}}
function getMetaConfig(){var element=getDocument().querySelector('meta[name="htmx-config"]');if(element){return parseJSON(element.content);}else{return null;}}
function mergeMetaConfig(){var metaConfig=getMetaConfig();if(metaConfig){htmx.config=mergeObjects(htmx.config,metaConfig)}}
ready(function(){mergeMetaConfig();insertIndicatorStyles();var body=getDocument().body;processNode(body);var restoredElts=getDocument().querySelectorAll("[hx-trigger='restored'],[data-hx-trigger='restored']");body.addEventListener("htmx:abort",function(evt){var target=evt.target;var internalData=getInternalData(target);if(internalData&&internalData.xhr){internalData.xhr.abort();}});window.onpopstate=function(event){if(event.state&&event.state.htmx){restoreHistory();forEach(restoredElts,function(elt){triggerEvent(elt,'htmx:restored',{'document':getDocument(),'triggerEvent':triggerEvent});});}};setTimeout(function(){triggerEvent(body,'htmx:load',{});},0);})
return htmx;})()}));;htmx.defineExtension('debug',{onEvent:function(name,evt){if(console.debug){console.debug(name,evt);}else if(console){console.log("DEBUG:",name,evt);}else{throw"NO CONSOLE SUPPORTED"}}});;