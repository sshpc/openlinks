// popup.js

/**
 * 初始化函数，设置事件监听器
 */
function init() {
  const getLinksBtn = document.getElementById('getLinksBtn');
  const statusDiv = document.getElementById('status');

  // 页面加载完成后自动获取链接数量
  async function displayLinkCount() {
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        statusDiv.textContent = '无法获取当前标签页';
        return;
      }

      statusDiv.textContent = '正在获取链接数量...';

      // 向content.js发送消息，请求获取链接
      const links = await chrome.tabs.sendMessage(tab.id, { action: 'getLinks' });

      if (links && links.length > 0) {
        statusDiv.innerHTML = `当前页面有 <b> ${links.length} </b> 个链接`;

      } else {
        statusDiv.textContent = '当前页面未找到链接';
      }
    } catch (error) {
      console.error('获取链接失败:', error);
      statusDiv.textContent = '获取链接数量失败';
    }
  }

  // 调用函数显示链接数量
  displayLinkCount();

  getLinksBtn.addEventListener('click', async () => {
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        statusDiv.textContent = '无法获取当前标签页';
        return;
      }

      statusDiv.textContent = '正在获取链接...';

      // 向content.js发送消息，请求获取链接
      const links = await chrome.tabs.sendMessage(tab.id, { action: 'getLinks' });

      if (links && links.length > 0) {
        statusDiv.textContent = `找到 ${links.length} 个链接，正在打开...`;

        // 向background.js发送消息，创建新窗口并打开链接
        chrome.runtime.sendMessage({
          action: 'openLinksInNewWindow',
          links: links
        });
      } else {
        statusDiv.textContent = '未找到链接';
      }
    } catch (error) {
      console.error('获取链接失败:', error);
      statusDiv.textContent = '获取链接失败，请重试';
    }
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);