// 存儲已加載的腳本 URL
const loadedScripts = [];
const widgetContainers = [];

// 通過 API 獲取 eids
async function fetchEidsFromAPI() {
	try {
		const response = await fetch(
		// 修改此處event type id的值來變更球種(預設為4)
		// 修改count值以設定多少張卡片(預設為6)
		"https://quote-cdn.uni247.xyz/api/quote/vsb/overall-matches/light/v1/?event_type_id=2&count=5",
		{
			method: "GET",
			headers: {
				// 添加自定義標頭
				Authorization: "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODg1YWI5NDQtNzhmMS00NmZkLTgzNTItNDc1MTJlM2VhOTY3IiwicGxheWVyX2lkIjoiaW5kaWFfMy4wX2Zvcl9kaXNwbGF5IiwibWVyY2hhbnRfY29kZSI6ImJhY2tvZmZpY2UtZDllMzIiLCJpc3N1ZWRfYXQiOiIyMDIyLTEwLTI4VDA4OjA5OjUzLjU0ODE0ODcyNloiLCJleHBpcmVzX2F0IjoiMjEyMi0xMC0yOFQwMDowMDowMC4wMDAwMDE2ODdaIn0.WEL6t_UEf8KglL-p_OLQe5xsHhDgaDelQMYZniCkcGk",
				// 適當設置其他標頭
				"Content-Type": "application/json",
			},
		}
		);
		const data = await response.json();
		return data.data.map((d) => d.event_id);
	} catch (error) {
		console.error("Error fetching eids:", error);
		return null;
	}
}

// 獲取 widget 腳本
async function loadWidgetScript() {
	if (!loadedScripts.includes('widget')) {
		const script = document.createElement("script");
		script.src = "https://storage.googleapis.com/oddsbeta-web-stage/widgetsV2/main.js";
		script.async = true;
		document.body.appendChild(script);
		loadedScripts.push('widget');
		return new Promise((resolve) => {
			script.onload = resolve;
		});
	} else {
		return Promise.resolve();
	}
}

// 創建小部件並將 eids 應用於它
async function createWidgets() {
	// 取 eids
	const eids = await fetchEidsFromAPI();
	if (!eids.length) {
		console.error("Failed to fetch eids.");
		return;
	}
	// 創建比分卡
	eids.forEach(async (eid) => {
		const widgetContainer = document.createElement("div");
		widgetContainer.className = "himalaya-dashboard";
		widgetContainer.setAttribute(
			"data-props",
			JSON.stringify({
				// 修改type的值變更比分卡類型
				// scoreboard:板球 soccer:足球 others:其他球種
				type: "others",
				eid: eid,
				width: "238px",
				secondary_background_color: "#1A1A1A",
				text_primary_color: "#FFFFFF",
				quick_link_border_color: "#989898",
				lang: "en",
			})
		);
		document.getElementById("scorecard").appendChild(widgetContainer);
		widgetContainers.push(widgetContainer);
	});
	// 引入比分卡 widget
	await loadWidgetScript();
}

// 在用戶嘗試離開頁面之前執行清理工作
window.addEventListener("beforeunload", () => {
	// 移除小部件容器
	widgetContainers.forEach(container => container.remove());

	// 移除小部件腳本元素
	loadedScripts.forEach(scriptName => {
		const scriptElement = document.querySelector(`script[src*="${scriptName}"]`);
		if (scriptElement) {
			document.body.removeChild(scriptElement);
		}
	});
});

// 執行創建小部件的函數
createWidgets();
