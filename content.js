// content.js

/**
 * 收集页面上所有的链接（包括相对路径）并去重
 * @returns {Array<string>} 去重后的链接数组
 */
function collectLinks() {
  const linksSet = new Set();
  // 获取所有a标签
  const anchorTags = document.querySelectorAll('a');

  // 遍历所有a标签，收集href属性
  anchorTags.forEach(tag => {
    const href = tag.getAttribute('href');
    // 确保链接不为空
    if (href && href.trim() !== '') {
      let fullUrl = href;
      // 如果是相对路径，则构建完整URL
      if (!href.startsWith('http://') && !href.startsWith('https://')) {
        // 获取当前页面的origin
        const origin = window.location.origin;
        // 处理不同类型的相对路径
        if (href.startsWith('/')) {
          // 根相对路径
          fullUrl = origin + href;
        } else if (href.startsWith('#')) {
          // 锚点链接，添加当前页面URL
          fullUrl = window.location.href.split('#')[0] + href;
        } else if (href.startsWith('?')) {
          // 查询参数链接，添加当前页面URL
          fullUrl = window.location.origin + window.location.pathname + href;
        } else {
          // 相对路径
          const pathname = window.location.pathname;
          const directory = pathname.substring(0, pathname.lastIndexOf('/') + 1);
          fullUrl = origin + directory + href;
        }
      }
      // 添加到Set中自动去重
      linksSet.add(fullUrl);
    }
  });

  // 将Set转换为数组并返回
  return Array.from(linksSet);
}

/**
 * 监听来自popup.js的消息
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getLinks') {
    // 收集链接并发送回popup.js
    const links = collectLinks();
    sendResponse(links);
  }
  // 保持消息通道开放，直到sendResponse被调用
  return true;
});