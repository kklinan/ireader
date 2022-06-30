let color = '#696969';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  chrome.storage.sync.set({ lang: {value: 'zh-CN', index: 16}});
  // console.log('颜色已设置 %cgreen', `color: ${color}`);
});

let start = 'start'; // 开始播放
let add = 'add'; // 加入播放
let cancel = 'stop'; // 停止播放
let pause = 'pause'; // 暂停播放
let resume = 'resume'; // 继续播放
let speak_lang = 'zh-CN'


const contextMenus = {
  'start': chrome.i18n.getMessage("contextmenu_start"),
  'pause': chrome.i18n.getMessage("contextmenu_pause"),
  'resume': chrome.i18n.getMessage("contextmenu_resume"),
  'stop': chrome.i18n.getMessage("contextmenu_stop"),
};

chrome.runtime.onInstalled.addListener(() => {
  for (let [tld, locale] of Object.entries(contextMenus)) {
    chrome.contextMenus.create({
      id: tld,
      title: locale,
      type: 'normal',
      // contexts: ['all'],
      contexts: ['selection'],
    });
  }
});

chrome.contextMenus.onClicked.addListener(
  function(data, tab) {
    if (data.menuItemId == start) {
      chrome.tabs.sendMessage(tab.id, {action: "get_content"}, function(response) {
        chrome.tts.stop()
        speak_enqueue(response.content)
      });
    }

    if (data.menuItemId == pause) {
      chrome.tts.pause()
    }

    if (data.menuItemId == resume) {
      chrome.tts.resume()
    }

    if (data.menuItemId == cancel) {
      chrome.tts.stop()
    }
  },
)

chrome.runtime.onMessage.addListener(async (data) => {
  // console.log("msg:", data);

  // if (data.action == 'content') {
  //   content = data.msg.replace(/<\/?.+?>/g, "");
  //   console.log(content)
  // }

  if (data.action == start) {
    chrome.tts.stop()
    speak_enqueue(data.msg)
  }

  if (data.action == cancel) {
    chrome.tts.stop()
  }

  if (data.action == pause) {
    chrome.tts.pause()
  }

  if (data.action == resume) {
    chrome.tts.resume()
  }

})

// speak_enqueue 以队列形式播放语音
function speak_enqueue(msg) {
  var step = 10000;
  var text_list = [];
  for (var i=0,len=msg.length;i<len;i+=step) {
    text_list.push(msg.slice(i,i+step));
  }

  for (var i = 0; i < text_list.length; i++) {
    if (i == 0) {
      speak(text_list[0], false)
    } else {
      chrome.storage.local.set({ list: text_list, curr_index: 0 });
    }
  }
}

// 播放语音
function speak(msg, enqueue) {
  // chrome.tts.remote = true
  chrome.storage.sync.get("lang", ({ lang }) => {
    speak_lang = lang.value
  });

  chrome.tts.speak(msg, {
    'lang': speak_lang,
    'rate': 1.0,  
    // 'enqueue': enqueue,
    onEvent: function(event) {
      // console.log("事件类型：",event.type)

      if (event.type == 'start') {
        chrome.action.setBadgeText({text: 'ON'});
      }

      if (event.type == 'resume') {
        chrome.action.setBadgeText({text: 'ON'});
      }

      if (event.type == 'end') {
        chrome.action.setBadgeText({text: ''});

        chrome.storage.local.get("list", ({ list }) => {
          chrome.storage.local.get("curr_index", ({ curr_index }) => {

            next_index = curr_index+1
            if (next_index >= list.length) {
              chrome.storage.local.remove('list')
              return
            }

            speak(list[next_index], false)
            chrome.storage.local.set({ curr_index: next_index });
          });
        });
      }

      if (event.type == 'stop') {
        chrome.action.setBadgeText({text: ''});
        chrome.storage.local.remove('list')
      }

      if (event.type == 'interrupted') {
        chrome.action.setBadgeText({text: ''});
      }

      if (event.type == 'pause') {
        chrome.action.setBadgeText({text: 'Pause'});
      }
    }
 });
}