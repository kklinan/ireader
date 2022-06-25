// 获取网页内容
function get_content()
{
    var content = document.getElementsByTagName('html')[0].outerHTML; 
    return content

    // 向 background 发送
    // chrome.runtime.sendMessage({msg: content, action: 'content'});
}

// 获取选择的文本
function getSelectedText() {
    if (window.getSelection) {
      return window.getSelection().toString();
    } else if (document.getSelection) {
      return document.getSelection();
    } else if (document.selection) {
      return document.selection.createRange().text;
    }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "get_conent")
        // 首先获取选中内容
        var content = getSelectedText()

        // if (content.replace(/(^s*)|(s*$)/g, "").length == 0) {
        //     // 若无选中内容，则获取正文内容
        //     content = get_content().substr(200,600)
        // }
        sendResponse({content: content});
  }
);