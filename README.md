# 台灣遊戲伺服器存活統計

台灣的遊戲私服會消失，也會換網址，但沒有人在記錄它多常發生。這個 repo 記錄。

資料來自 [HiddenHosts](https://www.hiddenhosts.com) 對榜上每個遊戲伺服器網站
**每 6 小時一次**的連線檢查，按月彙總後存成帶日期的快照，累積不刪。
量的是**網址還答不答得出來**，不是伺服器好不好玩，也不是它合不合法。

判定規則：<https://www.hiddenhosts.com/methodology>

---

<!-- LATEST_START -->

## 2026 年 9 月

| | |
|---|---|
| 追蹤站點 | 568 |
| 連得上 | 559（98.4%） |
| 當月換過網址 | 0（0.0%） |
| 當月被標記失效 | 0 次 |
| 當月恢復 | 0 次 |
| 連續存活中位數 | 7 天 |
| 已觀測 | 1 天 |

### 各遊戲

| 遊戲 | 站點數 | 連得上 |
|---|---|---|
| [天堂](https://www.hiddenhosts.com/c/lineage) | 479 | 472（98.5%） |
| [RO 仙境傳說](https://www.hiddenhosts.com/c/ragnarok-online) | 67 | 65（97.0%） |
| [楓之谷](https://www.hiddenhosts.com/c/maplestory) | 16 | 16（100.0%） |
| [Tera](https://www.hiddenhosts.com/c/tera) | 5 | 5（100.0%） |
| 其他 | 1 | 1（100.0%） |
<!-- LATEST_END -->

<!-- MONTHS_START -->

<!-- MONTHS_END -->

---

## 這些數字的邊界

寫在前面，不寫在腳註：一個被引用的數字要禁得起回查。

- **紀錄從 2026-09-14 開始。** 這是第一份快照，所以「當月失效」「當月恢復」「當月換網址」
  都是 0。那是「還沒有記錄到」，不是「沒有發生」。從下個月起這三個數字才有意義。
- **只涵蓋 HiddenHosts 榜上的站點**，不是台灣所有的遊戲伺服器。天堂佔了 84%，
  那反映的是這個榜的來源，不是市場比例。
- **「連續存活中位數」從開始記錄那天起算**，不是從開服那天。紀錄還短的時候這個數字
  被上限壓著，只能拿來比較月份之間的變化，不能當成伺服器壽命。
- **「失效」與「恢復」算次數不算站數**：同一個站一個月裡死兩次算兩次。
  「換網址」算站數，同月換兩次算一次。
- **當月的數字是還沒過完的月份**，比較時看「已觀測天數」。

## 檔案

```
data/YYYY-MM.json     每月一份，累積不刪
```

每月 1 日自動抓 <https://www.hiddenhosts.com/data/uptime.json> 產生上個月那份，
並更新這份 README 的表格。手動觸發：Actions → Monthly snapshot → Run workflow。

## 授權與引用

資料採 [CC BY 4.0](LICENSE)。引用時標明 HiddenHosts 並連回
<https://www.hiddenhosts.com/uptime> 即可，不需要另外詢問。

建議的引用格式：

> HiddenHosts，《台灣遊戲伺服器存活統計》，2026 年 9 月。https://www.hiddenhosts.com/uptime

---

## In English

**Monthly uptime data for Taiwanese game servers.**

Private game servers in Taiwan disappear and change domains constantly, and
nobody was measuring how often. This repository does.

Every server website listed on [HiddenHosts](https://www.hiddenhosts.com) is
checked over HTTP **every 6 hours**. The results are aggregated per month and
archived here as dated snapshots. What is measured is whether an address still
answers, not the quality of the server behind it, and not its legality.

<!-- EN_SUMMARY_START -->
As of **September 2026**: 568 servers tracked, 559 reachable (98.4%), median uninterrupted uptime 7 days. 0 changed domain during the month (0.0%), over 1 observed days.
<!-- EN_SUMMARY_END -->

Method: <https://www.hiddenhosts.com/methodology> ·
Live figures: <https://www.hiddenhosts.com/uptime> ·
Machine-readable: <https://www.hiddenhosts.com/data/uptime.json>

Data licensed [CC BY 4.0](LICENSE). Attribution to HiddenHosts with a link back
is all that is required.
