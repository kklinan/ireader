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
  'start': '▶️开始播放',
  'pause': '⏸️暂停播放',
  'resume': '⏯️继续播放',
  'stop': '⏹️退出播放'
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
      chrome.tabs.sendMessage(tab.id, {action: "get_conent"}, function(response) {
        speak(response.content)
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
    speak(data.msg)
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

// 播放语音
function speak(msg) {
  // chrome.tts.remote = true
  chrome.storage.sync.get("lang", ({ lang }) => {
    speak_lang = lang.value
  });

  chrome.tts.speak(msg, {
    'lang': speak_lang,
    'rate': 1.0,  
    // 'enqueue': true,
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
      }

      if (event.type == 'stop') {
        chrome.action.setBadgeText({text: ''});
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