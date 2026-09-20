import { useMemo, useState } from 'react'
import designLogData from './data/design-log.json'
import './App.css'

const teamMembers = ['Jordan Wang', 'Emily Saint', 'Alisson Thompson', 'Grant Eisler', 'Pedro Brossel']
const noteCategories = ['Admin Work', 'Mechanical Design', 'Electrical', 'Software & Controls', 'Research & Testing', 'Other']

const initialEntries = designLogData.entries || []

function escapeHtml(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

function formatInlineMarkdown(value) {
	let result = escapeHtml(value)

	result = result.replace(/`([^`]+)`/g, '<code>$1</code>')
	result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
	result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>')
	result = result.replace(/\_([^_]+)\_/g, '<em>$1</em>')
	result = result.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')

	return result
}

function renderMarkdown(markdown) {
	if (!markdown || !markdown.trim()) {
		return '<p class="empty-state">No notes available.</p>'
	}

	const blocks = markdown.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean)

	const renderedBlocks = blocks.map((block) => {
		if (/^#{1,6}\s+/.test(block)) {
			const match = block.match(/^(#{1,6})\s+(.*)$/)
			const level = match[1].length
			const text = formatInlineMarkdown(match[2])
			return `<h${level}>${text}</h${level}>`
		}

		const listLines = block.split('\n')
		const isUnorderedList = listLines.every((line) => /^[-*]\s+/.test(line.trim()))
		const isOrderedList = listLines.every((line) => /^\d+\.\s+/.test(line.trim()))

		if (isUnorderedList) {
			const listItems = listLines
				.map((line) => `<li>${formatInlineMarkdown(line.trim().replace(/^[-*]\s+/, ''))}</li>`)
				.join('')
			return `<ul>${listItems}</ul>`
		}

		if (isOrderedList) {
			const listItems = listLines
				.map((line) => `<li>${formatInlineMarkdown(line.trim().replace(/^\d+\.\s+/, ''))}</li>`)
				.join('')
			return `<ol>${listItems}</ol>`
		}

		if (/^>/.test(block)) {
			const quote = block
				.split('\n')
				.map((line) => line.replace(/^>\s?/, '').trim())
				.filter(Boolean)
				.map((line) => `<blockquote>${formatInlineMarkdown(line)}</blockquote>`)
				.join('')
			return quote
		}

		return `<p>${formatInlineMarkdown(block)}</p>`
	})

	return renderedBlocks.join('')
}

function formatDate(dateString) {
	if (!dateString) return 'No date'

	const date = new Date(`${dateString}T12:00:00`)

	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date)
}

function App() {
	const [entries] = useState(initialEntries)
	const [formData, setFormData] = useState({
		member: teamMembers[0],
		category: noteCategories[0],
		date: new Date().toISOString().slice(0, 10),
		note: '',
	})
	const [copied, setCopied] = useState(false)

	const jsonPreview = useMemo(() => {
		const entry = {
			member: formData.member,
			date: formData.date,
			category: formData.category,
			note: formData.note.trim(),
		}

		return JSON.stringify(entry, null, 2)
	}, [formData])

	const handleChange = (event) => {
		const { name, value } = event.target
		setFormData((current) => ({ ...current, [name]: value }))
	}

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(jsonPreview)
			setCopied(true)
		} catch (error) {
			console.error('Clipboard copy failed:', error)
		}
	}

	return (
		<div className="page-shell">
			<header className="header">
				<div className="title-block">
					<div className="brand-mark" aria-hidden="true">MTE</div>
					<div>
						<p className="eyebrow">MTE 481 • Fall 2026</p>
						<h1>Design Log</h1>
					</div>
				</div>

				<div className="header-meta" aria-label="Design log summary">
					<span>{entries.length} entries</span>
					<span>Commit-based notes</span>
				</div>
			</header>

			<main className="layout">
				<section className="panel form-panel" aria-labelledby="new-note-heading">
					<h2 id="new-note-heading">Generate JSON</h2>

					<div className="log-form">
						<div className="field-group">
							<label htmlFor="member">Team member</label>
							<select id="member" name="member" value={formData.member} onChange={handleChange}>
								{teamMembers.map((member) => (
									<option key={member} value={member}>
										{member}
									</option>
								))}
							</select>
						</div>

						<div className="field-group">
							<label htmlFor="category">Note classification</label>
							<select id="category" name="category" value={formData.category} onChange={handleChange}>
								{noteCategories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						</div>

						<div className="field-group">
							<label htmlFor="date">Date</label>
							<input
								id="date"
								name="date"
								type="date"
								value={formData.date}
								onChange={handleChange}
							/>
						</div>

						<div className="field-group">
							<label htmlFor="note">Meeting notes</label>
							<textarea
								id="note"
								name="note"
								rows="8"
								placeholder="Use markdown here: **bold**, *italic*, lists, or [links](https://example.com)"
								value={formData.note}
								onChange={handleChange}
							/>
						</div>

						<div className="json-generator-actions">
							<p className="helper-text">Generated JSON for repo update.</p>
							<button type="button" className="copy-button" onClick={handleCopy}>
								{copied ? 'Copied!' : 'Copy JSON'}
							</button>
						</div>

						<div className="json-preview-box">
							<label htmlFor="json-preview">JSON preview</label>
							<textarea
								id="json-preview"
								className="json-output"
								readOnly
								value={jsonPreview}
								aria-label="JSON output for commit-based entry"
							/>
						</div>
					</div>
				</section>

				<section className="panel entries-panel" aria-labelledby="recent-entries-heading">
					<div className="section-header-row">
						<h2 id="recent-entries-heading">Recent entries</h2>
					</div>

					<ul className="entry-list">
						{entries.map((entry) => (
							<li key={`${entry.member}-${entry.date}-${entry.category}`} className="entry-card">
								<div className="entry-topline">
									<span className="member-badge">{entry.member}</span>
									<span className="category-badge">{entry.category}</span>
									<time dateTime={entry.date}>{formatDate(entry.date)}</time>
								</div>

								<div
									className="markdown-content"
									dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.note) }}
								/>
							</li>
						))}
					</ul>
				</section>
			</main>
		</div>
	)
}

export default App
