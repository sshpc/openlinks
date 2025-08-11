// background.js

/**
 * 在新窗口中打开链接
 * @param {Array<string>} links - 要打开的链接数组
 */
function openLinksInNewWindow(links) {
  // 创建一个新窗口
  chrome.windows.create({
    url: links[0], // 第一个链接作为新窗口的第一个标签页
    type: 'normal'
  }, (window) => {
    // 打开剩余的链接作为新标签页
    for (let i = 1; i < links.length; i++) {
      chrome.tabs.create({
        url: links[i],
        windowId: window.id
      });
    }
  });
}

/**
 * 监听来自popup.js的消息
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openLinksInNewWindow') {
    // 打开链接
    openLinksInNewWindow(request.links);
    sendResponse({ success: true });
  }
  return true;
});