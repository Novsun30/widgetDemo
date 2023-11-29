// 存儲已加載的腳本 URL
const loadedScripts = [];
const widgetContainers = [];

// 比分卡 data-props 參數
const widgetDataProps = {
  optimized_mode: true,
  type: 'cricketExchange', // 變更比分卡類型，scoreboard:板球 soccer:足球 others:其他球種
  event_type_id: '4', // 球種資料id，板球: 4、足球: 1、網球: 2
  count: '10', // 要顯示的比分卡張數
  width: '',
  secondary_background_color: '',
  text_primary_color: '',
  text_secondary_color: '',
  secondary_color: '',
  border_color: '',
  quick_link_border_color: '',
  lang: '',
  team_logo_size: '',
  text_ratio: '',
};

// 獲取 widget 腳本
async function loadWidgetScript() {
  if (!loadedScripts.includes('widget')) {
    const script = document.createElement('script');
    script.src = 'https://storage.googleapis.com/oddsbeta-web-stage/widgetsV2/main.js';
    script.async = true;
    document.body.appendChild(script);
    loadedScripts.push('widget');
    return new Promise((resolve) => {
      script.onload = resolve;
    });
  }
  return Promise.resolve();
}

async function createWidgets() {
  // 創建比分卡
  const widgetContainer = document.createElement('div');
  widgetContainer.className = 'himalaya-dashboard';
  widgetContainer.setAttribute(
    'data-props',
    JSON.stringify({
      ...widgetDataProps,
    }),
  );
  document.getElementById('scorecard').appendChild(widgetContainer);
  widgetContainers.push(widgetContainer);
  // 引入比分卡 widget
  await loadWidgetScript();
}

// 在用戶嘗試離開頁面之前執行清理工作
window.addEventListener('beforeunload', () => {
  // 移除小部件容器
  widgetContainers.forEach((container) => container.remove());

  // 移除小部件腳本元素
  loadedScripts.forEach((scriptName) => {
    const scriptElement = document.querySelector(`script[src*="${scriptName}"]`);
    if (scriptElement) {
      document.body.removeChild(scriptElement);
    }
  });
});

// 執行創建小部件的函數
createWidgets();
