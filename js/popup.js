function setChildTextNode(elementId, text) {
  document.getElementById(elementId).innerText = text;
}

function init() {
  setChildTextNode('changeColor', chrome.i18n.getMessage("set_background"));
  setChildTextNode('start', chrome.i18n.getMessage("start"));
  setChildTextNode('stop', chrome.i18n.getMessage("stop"));
  setChildTextNode('pause', chrome.i18n.getMessage("pause"));
  setChildTextNode('resume', chrome.i18n.getMessage("resume"));
}

document.addEventListener('DOMContentLoaded', function() {
  init();
});

// Initialize butotn with users's prefered color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // chrome.action.setBadgeText({text: 'ON'});
  // chrome.action.setBadgeBackgroundColor({color: '#4688F1'})

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: setPageBackgroundColor,
  });
});

// The body of this function will be execuetd as a content script inside the
// current page
function setPageBackgroundColor() {
  chrome.storage.sync.get("color", ({ color }) => {
    document.body.style.backgroundColor = color;
  });
}

// 开始播放
let start = document.getElementById("start");
start.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // chrome.action.setBadgeText({text: 'ON'});

  // 向 content script 发送事件
  chrome.tabs.sendMessage(tab.id, {action: "get_content"}, function(response) {
    // 向 background 发送事件
    chrome.runtime.sendMessage({msg: response.content, action: 'start'});
  });

});

// 停止播放
let stop = document.getElementById("stop");
stop.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // chrome.action.setBadgeText({text: ''});
  chrome.runtime.sendMessage({msg: '', action: 'stop'});
});

// 暂停播放
let pause = document.getElementById("pause");
pause.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // chrome.action.setBadgeText({text: 'Pause'});
  chrome.runtime.sendMessage({msg: '', action: 'pause'});
});

// 继续播放
let resume = document.getElementById("resume");
resume.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // chrome.action.setBadgeText({text: 'ON'});
  chrome.runtime.sendMessage({msg: '', action: 'resume'});
});

// chrome.runtime.onMessage.addListener(async (msg, sender) => {
//   console.log(msg)
// })


let lang_select = document.getElementById("lang");
lang.addEventListener("change", async () => {
  var lang = lang_select.options[lang_select.selectedIndex].value;
  chrome.storage.sync.set({ lang: {value: lang, index: lang_select.selectedIndex} });
});
 
chrome.storage.sync.get("lang", ({ lang }) => {
  lang_select.options[lang.index].selected = true
});
