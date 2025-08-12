// popup.js

/**
 * 存储获取到的所有链接
 */
let allLinks = [];

/**
 * 初始化函数，设置事件监听器
 */
function init() {
  const getLinksBtn = document.getElementById('getLinksBtn');
  const refreshLinksBtn = document.getElementById('refreshLinksBtn');
  const statusDiv = document.getElementById('status');
  const sameDomainCheckbox = document.getElementById('sameDomainCheckbox');
  const filterInput = document.getElementById('filterInput');
  const currentDomainSpan = document.getElementById('currentDomain');

  // 显示当前域名
  async function displayCurrentDomain() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        const currentDomain = new URL(tab.url).hostname;
        currentDomainSpan.textContent = currentDomain;
      } else {
        currentDomainSpan.textContent = '无法获取域名';
      }
    } catch (error) {
      console.error('获取域名失败:', error);
      currentDomainSpan.textContent = '获取域名失败';
    }
  }

  // 页面加载时显示当前域名
  displayCurrentDomain();

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

      // 存储获取到的链接
      allLinks = links || [];

      // 过滤链接
      const filteredLinks = filterLinks(allLinks, tab.url);

      if (allLinks.length > 0) {
        statusDiv.innerHTML = `当前页面有 <b> ${allLinks.length} </b> 个链接，过滤后有 <b> ${filteredLinks.length} </b> 个`;
      } else {
        statusDiv.textContent = '当前页面未找到链接';
      }
    } catch (error) {
      console.error('获取链接失败:', error);
      statusDiv.textContent = '获取链接数量失败';
    }
  }

  /**
   * 根据条件过滤链接
   * @param {string[]} links - 要过滤的链接数组
   * @param {string} currentUrl - 当前页面URL
   * @returns {string[]} 过滤后的链接数组
   */
  function filterLinks(links, currentUrl) {
    if (!links || links.length === 0) return [];

    const currentDomain = new URL(currentUrl).hostname;
    const filterText = filterInput.value.toLowerCase();
    const sameDomainOnly = sameDomainCheckbox.checked;

    return links.filter(link => {
      // 检查是否为本域名
      const linkDomain = new URL(link).hostname;
      const isSameDomain = linkDomain === currentDomain;

      // 如果只允许本域名且当前链接不是本域名，则过滤掉
      if (sameDomainOnly && !isSameDomain) {
        return false;
      }

      // 检查是否匹配筛选文本
      return filterText === '' || link.toLowerCase().includes(filterText);
    });
  }

  // 重新获取链接按钮点击事件
  refreshLinksBtn.addEventListener('click', async () => {
    await displayCurrentDomain();
    displayLinkCount();
  });

  // 筛选条件变化事件
  sameDomainCheckbox.addEventListener('change', async () => {
    if (allLinks.length > 0) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        const filteredLinks = filterLinks(allLinks, tab.url);
        statusDiv.innerHTML = `当前页面有 <b> ${allLinks.length} </b> 个链接，过滤后有 <b> ${filteredLinks.length} </b> 个`;
      }
    }
  });

  filterInput.addEventListener('input', async () => {
    if (allLinks.length > 0) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        const filteredLinks = filterLinks(allLinks, tab.url);
        statusDiv.innerHTML = `当前页面有 <b> ${allLinks.length} </b> 个链接，过滤后有 <b> ${filteredLinks.length} </b> 个`;
      }
    }
  });

  // 调用函数显示链接数量
  displayLinkCount();

  // 批量打开按钮点击事件
  getLinksBtn.addEventListener('click', async () => {
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        statusDiv.textContent = '无法获取当前标签页';
        return;
      }

      if (allLinks.length === 0) {
        statusDiv.textContent = '正在获取链接...';
        // 如果没有链接，先获取链接
        allLinks = await chrome.tabs.sendMessage(tab.id, { action: 'getLinks' }) || [];
      }

      // 使用已过滤的链接
      const filteredLinks = filterLinks(allLinks, tab.url);

      if (filteredLinks && filteredLinks.length > 0) {
        statusDiv.textContent = `正在打开 ${filteredLinks.length} 个链接...`;

        // 向background.js发送消息，创建新窗口并打开链接
        chrome.runtime.sendMessage({
          action: 'openLinksInNewWindow',
          links: filteredLinks
        });
      } else {
        statusDiv.textContent = '没有符合条件的链接';
      }
    } catch (error) {
      console.error('获取链接失败:', error);
      statusDiv.textContent = '获取链接失败，请重试';
    }
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);