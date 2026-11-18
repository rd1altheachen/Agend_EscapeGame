---
name: browser-automation
description: 使用 Playwright 處理需要 JavaScript 渲染、互動操作或截圖驗證的網頁；靜態頁面或穩定 API 優先採用較直接的方法。
used_by: [escape-pm-t1501884597280178317, escape-dev-t1501884852977401876]
---

# Browser Automation

使用時機：頁面必須經 JavaScript 渲染，或任務需要點擊、輸入、捲動、截圖或視覺比較。靜態內容與可直接呼叫的 API 不需要瀏覽器自動化。

## 執行原則
- 優先使用語意定位、穩定屬性與條件等待；避免依賴易變的 class 或固定索引。
- 只收集完成任務所需的頁面資料。核對目標內容和操作結果，再回報證據與限制。
- 遵守網站條款、存取權限與合理速率；不得繞過登入、CAPTCHA、反自動化或其他存取控制。遇到挑戰時停止並請使用者處理。
- Cookie、storage state 與登入資料是憑證。只有任務確有需要且位置安全時才保存，不將其輸出或分享。
- 完成後關閉瀏覽器及 context；長任務留意資源使用。
