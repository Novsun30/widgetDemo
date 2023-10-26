// 存儲已加載的腳本 URL
const loadedScripts = [];
const widgetContainers = [];
const widgetDataProps = {
  // 修改 type 的值變更比分卡類型
  // scoreboard:板球 soccer:足球 others:其他球種
  type: 'scoreboard',
  width: '238px',
  secondary_background_color: '#1A1A1A',
  text_primary_color: '#FFFFFF',
  quick_link_border_color: '#989898',
  lang: 'en',
  team_logo_size: '29px',
  text_ratio: '1',
};

// 通過 API 獲取 eid 和 odds
async function fetchEidsAndOddsFromAPI() {
  try {
    const response = await fetch(
      // 修改此處 event_type_id 的值來變更球種，預設為4
      // 修改 count 值以設定多少張卡片，預設為6
      'https://quote-cdn.uni247.xyz/api/quote/vsb/overall-matches/light/v1/?event_type_id=4&count=10',
      {
        method: 'GET',
        headers: {
          // 添加自定義標頭
          Authorization: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODg1YWI5NDQtNzhmMS00NmZkLTgzNTItNDc1MTJlM2VhOTY3IiwicGxheWVyX2lkIjoiaW5kaWFfMy4wX2Zvcl9kaXNwbGF5IiwibWVyY2hhbnRfY29kZSI6ImJhY2tvZmZpY2UtZDllMzIiLCJpc3N1ZWRfYXQiOiIyMDIyLTEwLTI4VDA4OjA5OjUzLjU0ODE0ODcyNloiLCJleHBpcmVzX2F0IjoiMjEyMi0xMC0yOFQwMDowMDowMC4wMDAwMDE2ODdaIn0.WEL6t_UEf8KglL-p_OLQe5xsHhDgaDelQMYZniCkcGk',
          // 適當設置其他標頭
          'Content-Type': 'application/json',
        },
      },
    );
    const data = await response.json();
    return data.data.map((d) => ({ eid: d.event_id, odds: d.m }));
  } catch (error) {
    console.error('Error fetching eids:', error);
    return null;
  }
}

// 獲取 widget 腳本
async function loadWidgetScript() {
  if (!loadedScripts.includes('widget')) {
    const script = document.createElement('script');
    script.src = 'https://storage.googleapis.com/oddsbeta-web-stage/widgetsV2/main.js';
    script.async = true;
    script.id = 'widgetScript';
    document.body.appendChild(script);
    loadedScripts.push('widget');
    return new Promise((resolve) => {
      script.onload = resolve;
    });
  }
  return Promise.resolve();
}

// 創建小部件並將 eid 和 odds 應用於它
async function createWidgets() {
  // 取 eid 和 odds
  const eidAndOdds = await fetchEidsAndOddsFromAPI();
  if (!eidAndOdds.length) {
    console.error('Failed to fetch eids.');
    return;
  }
  // 創建比分卡
  eidAndOdds.forEach(async (data, index) => {
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'himalaya-dashboard';
    widgetContainer.setAttribute(
      'data-props',
      JSON.stringify({
        type: widgetDataProps.type,
        eid: data.eid,
        odds: data.odds,
        width: widgetDataProps.width,
        secondary_background_color: widgetDataProps.secondary_background_color,
        text_primary_color: widgetDataProps.text_primary_color,
        quick_link_border_color: widgetDataProps.quick_link_border_color,
        lang: widgetDataProps.lang,
        team_logo_size: widgetDataProps.team_logo_size,
        text_ratio: widgetDataProps.text_ratio,
      }),
    );
    widgetContainer.id = `widget${index}`;
    document.getElementById('scorecard').appendChild(widgetContainer);
    widgetContainers.push(widgetContainer);
  });
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

// 30 秒更新一次賠率資訊
setInterval(async () => {
  const scriptElem = document.getElementById('widgetScript');
  scriptElem.remove();
  const eidAndOdds = await fetchEidsAndOddsFromAPI();
  if (!eidAndOdds.length) {
    console.error('Failed to fetch eids.');
    return;
  }
  eidAndOdds.forEach((data, index) => {
    const widget = document.getElementById(`widget${index}`);
    widget.setAttribute(
      'data-props',
      JSON.stringify({
        type: widgetDataProps.type,
        eid: data.eid,
        odds: data.odds,
        width: widgetDataProps.width,
        secondary_background_color: widgetDataProps.secondary_background_color,
        text_primary_color: widgetDataProps.text_primary_color,
        quick_link_border_color: widgetDataProps.quick_link_border_color,
        lang: widgetDataProps.lang,
        team_logo_size: widgetDataProps.team_logo_size,
        text_ratio: widgetDataProps.text_ratio,
      }),
    );
  });
  const script = document.createElement('script');
  script.src = 'https://storage.googleapis.com/oddsbeta-web-stage/widgetsV2/main.js';
  script.async = true;
  script.id = 'widgetScript';
  document.body.appendChild(script);
}, 1000 * 30);

