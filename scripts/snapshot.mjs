/**
 * Archive one month of uptime figures, and rewrite the README around them.
 *
 * Source: https://www.hiddenhosts.com/data/uptime.json, which is the same
 * aggregate the site's own /uptime page prints. Nothing is computed here; this
 * script only picks a month out of that answer, writes it down under a name
 * that will not change, and regenerates the tables between the markers.
 *
 * Environment:
 *   SITE_URL  base URL to read from (default https://www.hiddenhosts.com)
 *   MONTH     YYYY-MM to archive (default: the month that has just ended, and
 *             the current one when that month is not in the data yet)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE_URL = process.env.SITE_URL || 'https://www.hiddenhosts.com'

/** Display names, so the tables read like the site rather than like slugs. */
const GAME_NAMES = {
	lineage: '天堂',
	'ragnarok-online': 'RO 仙境傳說',
	maplestory: '楓之谷',
	tera: 'Tera',
	rohan: '洛汗',
	stoneage: '石器時代',
	tlbb: '天龍八部',
	vindictus: '瑪奇英雄傳',
	wow: '魔獸世界',
	zhuxian: '誅仙',
	other: '其他',
}

/** The month before this one, in UTC. */
function previousMonth() {
	const now = new Date()
	const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
	return d.toISOString().slice(0, 7)
}

const pct = (r) => (r === null || r === undefined ? '–' : `${(r * 100).toFixed(1)}%`)
const num = (n) => (n === null || n === undefined ? '–' : n.toLocaleString('en-US'))
const monthLabel = (m) => `${m.slice(0, 4)} 年 ${Number(m.slice(5, 7))} 月`
const gameName = (slug) => GAME_NAMES[slug] ?? slug
const share = (part, whole) => (whole > 0 ? part / whole : null)

const EN_MONTHS = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
]
const enMonthLabel = (m) => `${EN_MONTHS[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`

function replaceBetween(text, marker, body) {
	const start = `<!-- ${marker}_START -->`
	const end = `<!-- ${marker}_END -->`
	const from = text.indexOf(start)
	const to = text.indexOf(end)
	if (from === -1 || to === -1) throw new Error(`Markers for ${marker} not found in README.md`)
	return text.slice(0, from + start.length) + '\n' + body + '\n' + text.slice(to)
}

function latestSection(m) {
	const rows = [
		['追蹤站點', num(m.listings)],
		['連得上', `${num(m.alive)}（${pct(m.aliveRate)}）`],
		['當月換過網址', `${num(m.urlChanged)}（${pct(m.urlChangedRate)}）`],
		['當月被標記失效', `${num(m.wentDead)} 次`],
		['當月恢復', `${num(m.recovered)} 次`],
		['連續存活中位數', m.medianAliveDays === null ? '–' : `${m.medianAliveDays} 天`],
		['已觀測', `${m.observedDays} 天`],
	]

	const games = Object.entries(m.byCategory ?? {})
		.sort((a, b) => b[1].listings - a[1].listings)
		.map(([slug, c]) => {
			const name = gameName(slug)
			// Only games with a board of their own get a link; 其他 has no page
			// worth sending anybody to.
			const cell = slug === 'other' ? name : `[${name}](${SITE_URL}/c/${slug})`
			return `| ${cell} | ${num(c.listings)} | ${num(c.alive)}（${pct(share(c.alive, c.listings))}） |`
		})

	return [
		'',
		`## ${monthLabel(m.month)}`,
		'',
		'| | |',
		'|---|---|',
		...rows.map(([k, v]) => `| ${k} | ${v} |`),
		'',
		'### 各遊戲',
		'',
		'| 遊戲 | 站點數 | 連得上 |',
		'|---|---|---|',
		...games,
	].join('\n')
}

/** The trend table, which is the part that cannot be copied from anywhere. */
function monthsSection(months) {
	if (months.length < 2) return ''
	const rows = [...months]
		.reverse()
		.map(
			(m) =>
				`| ${monthLabel(m.month)} | ${num(m.listings)} | ${pct(m.aliveRate)} | ${pct(m.urlChangedRate)} | ${num(m.wentDead)} | ${num(m.recovered)} |`,
		)
	return [
		'',
		'## 逐月',
		'',
		'| 月份 | 站點 | 存活率 | 換網址 | 失效 | 恢復 |',
		'|---|---|---|---|---|---|',
		...rows,
	].join('\n')
}

function enSummary(m) {
	const median = m.medianAliveDays === null ? 'not yet measurable' : `${m.medianAliveDays} days`
	return `As of **${enMonthLabel(m.month)}**: ${num(m.listings)} servers tracked, ${num(m.alive)} reachable (${pct(m.aliveRate)}), median uninterrupted uptime ${median}. ${m.urlChanged} changed domain during the month (${pct(m.urlChangedRate)}), over ${m.observedDays} observed days.`
}

async function main() {
	const url = `${SITE_URL}/data/uptime.json`
	console.log(`Fetching ${url}`)
	const response = await fetch(url)
	if (!response.ok) throw new Error(`${url} responded with ${response.status}`)
	const stats = await response.json()

	const wanted = process.env.MONTH || previousMonth()
	// The month that has just ended is the one worth archiving, but early in the
	// life of this record it may not exist yet. Falling back to the newest month
	// present keeps the first runs useful instead of failing on an empty answer.
	const month =
		stats.months.find((m) => m.month === wanted) ?? stats.months[stats.months.length - 1]
	if (!month) throw new Error('No months in the source data')

	// A month we only watched part of has to say so inside the file, not only in
	// the README: the JSON is the citable artefact, and its event counters read
	// as "none happened" when what they mean is "we were not watching yet".
	const daysInMonth = new Date(
		Date.UTC(Number(month.month.slice(0, 4)), Number(month.month.slice(5, 7)), 0),
	).getUTCDate()
	const note =
		month.observedDays < daysInMonth
			? `Partial month: ${month.observedDays} of ${daysInMonth} days observed. The event counters (wentDead, recovered, urlChanged) cover only those days, so a zero means "not observed" rather than "did not happen".`
			: undefined

	const file = join(ROOT, 'data', `${month.month}.json`)
	mkdirSync(dirname(file), { recursive: true })
	writeFileSync(
		file,
		`${JSON.stringify(
			{
				...month,
				capturedAt: new Date().toISOString().slice(0, 10),
				...(note ? { note } : {}),
				source: `${SITE_URL}/uptime`,
				method: `${SITE_URL}/methodology`,
				license: 'CC BY 4.0',
			},
			null,
			2,
		)}\n`,
		'utf-8',
	)
	console.log(`Wrote data/${month.month}.json`)

	const readmePath = join(ROOT, 'README.md')
	let readme = readFileSync(readmePath, 'utf-8')
	readme = replaceBetween(readme, 'LATEST', latestSection(month))
	readme = replaceBetween(readme, 'MONTHS', monthsSection(stats.months))
	readme = replaceBetween(readme, 'EN_SUMMARY', enSummary(month))
	writeFileSync(readmePath, readme, 'utf-8')
	console.log('Updated README.md')
}

main().catch((error) => {
	console.error(error.message)
	process.exit(1)
})
