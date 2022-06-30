chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.action === "get_content") {
      // 首先获取选中内容
      var enqueue = false;
      var content = get_selected_content();
      if (content.replace(/(^s*)|(s*$)/g, "").length == 0) {
        // 若无选中内容，则获取正文内容
        content = get_body_content($('body').html());
      } 
      sendResponse({ content: content});
    }
  }
);

// 获取选择的文本
function get_selected_content() {
  if (window.getSelection) {
    return window.getSelection().toString();
  } else if (document.getSelection) {
    return document.getSelection();
  } else if (document.selection) {
    return document.selection.createRange().text;
  }
}

function get_body_content(body) {
  let none_html = remove_html(body);
  let lines = text_to_lines(none_html);
  let content = lines_to_text(lines);
  return content;
};

function remove_html(html) {
  let regEx_script = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/g;
  let regEx_style = /<stype\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/stype>/g;
  let regEx_html = /<(?:.|\s)*?>/g;

  html = html.replace(regEx_script, "");
  html = html.replace(regEx_style, "");
  html = html.replace(regEx_html, "");
  html = html.replace("((\r\n)|\n)[\\s\t ]*(\\1)+", "$1").replace("^((\r\n)|\n)", "");
  html = html.replace("    +| +|　+", "");
  return html.trim();
};

function text_to_lines(text) {
  let BLOCKS = 0;
  let MIN_LENGTH = 3;
  let groupMap = new Array();
  let br = text.split('\n');
  let line = null,
    blocksLine = "";
  let theCount = 0,
    groupCount = 0,
    count = 0;

  for (let i = 0; i < br.length; i++) {
    line = br[i];
    if (line != '') {
      if (line.length > MIN_LENGTH) {
        if (theCount <= BLOCKS) {
          blocksLine += line.trim();
          theCount++;
        } else {
          if (blocksLine != undefined) {
            groupMap[groupCount] = blocksLine;
            groupCount++;
            blocksLine = line.trim();
            theCount = 1;
          }
        }
        count++;
      }
    }
  }

  if (theCount != 0 && blocksLine != undefined) {
    groupMap[groupCount + 1] = blocksLine;
  }
  return groupMap;
};

function lines_to_text(map) {
  let CHANGE_RATE = 0.9;
  let sets = map;
  let contentBlock = [];
  let currentBlock = map.length;
  let lastBlock = 0;
  for (let i = 0; i < sets.length; i++) {
    if (sets[i] != undefined) {
      lastBlock = currentBlock;
      currentBlock = sets[i].length;
      let between = Math.abs(currentBlock - lastBlock) / Math.max(currentBlock, lastBlock);
      if (between >= CHANGE_RATE) {
        contentBlock.push(i);
      }
    }
  }

  let matchNode = contentBlock.length;
  let lastContent = 0;
  let context = null;
  if (matchNode > 2) {
    for (let i = 1; i < matchNode; i++) {
      let result = "";
      for (let j = contentBlock[i - 1]; j < contentBlock[i]; j++) {
        result += map[j];
      }
      if (result.length > lastContent) {
        lastContent = result.length;
        context += result;
      }
    }
  }
  return context;
};