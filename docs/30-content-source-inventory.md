# 既有內容來源盤點

`node scripts/audit-content-sources.mjs` 唯讀檢查既有 `content/puzzles/{en,zh-Hant,es-419}` JSON 的引用完整度、日期、三語 family 覆蓋及來源集合差異；不讀候選 draft、不 seed 或變更正式 D1。

以 TypeScript AST 靜態讀取 editorial curated catalog、補充引用與各語系段落數，不執行模組或輸出內容。報告只含 family ID、計數、狀態與缺口；不列引用 URL、文案、作者或 credential。遇到結構改變／重複 family locale／無法解析時失敗且只輸出通用錯誤，不把不完整讀取寫成零問題。

GitHub 的 Content source inventory workflow 在相關 PR／main 更新時產出 14 天 artifact。它不使用 Cloudflare、正式資料庫或外站請求。正式 CI 仍驗證內容、型別、完整測試、build、答案不外洩與 Functions 編譯。

## 如何解讀

- `citationCompleteness` 只代表引用 metadata 的完整度；`familiesWithGaps` 與 `rows` 讓後續逐 family 修補不必再全量盤點。
- 同一 family 的三語來源不同只標記需審閱，不自行用另一語系覆寫。HTTPS metadata 有效不代表網站可讀、事實正確或允許重製。
- `rightsClearance`、`copyRightsClearance` 與 `independentPlaytest` 固定為 `not_assessed`；此盤點不出具權利許可或獨立盲測證明。文章段落計數不是文案原創性驗證。
- 舊內容來源權利需要逐項可追溯的原創／授權／許可／適用性證據，未憑引用存在、公開可讀或作者自評自動結案。補充引用尚不含 retrievedAt 的狀況也不能當完整權利紀錄。
- 下一批候選仍受既有 draft／作者審閱／獨立盲測門檻；本工具不改變其狀態，也不啟用廣告。

## 2026-10-29 實際盤點

PR #32 的 [完整目錄唯讀 inventory](https://github.com/frobel0520/tensift/actions/runs/40838749430) 與完整 CI 通過；main 的 [後續 inventory](https://github.com/frobel0520/tensift/actions/runs/40838894698) 也成功。共 255 份 JSON／85 個 family、315 筆符合 metadata 格式的引用；沒有缺語系、缺 sources 或不合格式的 citation。editorial 共三個 curated family／九個 locale entry、五筆合格式補充引用，以及三語共 117 個段落。

仍有三個 family 的三語來源集合不同：`animal-covering-001`、`school-office-use-001`、`sports-equipment-001`。逐一讀回九份來源後，三語 itemId／groupId／分組相同；差異集中於英語與另兩語的 Britannica 引用路徑，不能僅憑分組相同就把引用互抄。已嘗試官方頁面讀取與搜尋，但未取得可讀內容；不判為 404，也不判為有效、已授權或已修復。此三項保留來源核對。

這是引用結構與一致性盤點，不是逐項事實審查或權利結案；`rightsClearance`、`independentPlaytest` 仍為 `not_assessed`。未變更題目、候選狀態、正式資料或廣告。
