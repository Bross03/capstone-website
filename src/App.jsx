import { useEffect, useState } from 'react'
import './App.css'

const teamMembers = ['Jordan Wang', 'Emily Saint', 'Alisson Thompson', 'Grant Eisler', 'Pedro Brossel']
const noteCategories = ['Admin Work', 'Mechanical Design', 'Electrical', 'Software & Controls', 'Research & Testing', 'Other']
const STORAGE_KEY = 'design-log-entries-v1'

const defaultEntries = [
	{
		id: 1,
		member: 'Jordan Wang',
		date: '2026-09-08',
		category: 'Mechanical Design',
		note: '**Design review:** we narrowed the concept to a cleaner bracket system and improved the overall geometry for manufacturability.\n\n- Revisited the front frame layout\n- Confirmed material constraints\n- Next step: create a refined prototype sketch',
	},
	{
		id: 2,
		member: 'Emily Saint',
		date: '2026-09-12',
		category: 'Research & Testing',
		note: 'User observations suggest the interface needs clearer labels and a faster path to the key controls.\n\n> Main takeaway: reduce friction before the first major task.',
	},
	{
		id: 3,
		member: 'Grant Eisler',
		date: '2026-09-18',
		category: 'Electrical',
		note: 'Reviewed the wiring plan and validated the sensor mapping for the updated test rig.\n\n1. Confirm the power budget\n2. Bench-test the communication bus\n3. Record any voltage drops',
	},
]

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
	const [entries, setEntries] = useState(() => {
		const savedEntries = localStorage.getItem(STORAGE_KEY)

		if (!savedEntries) {
			return defaultEntries
		}

		try {
			const parsedEntries = JSON.parse(savedEntries)
			return Array.isArray(parsedEntries) && parsedEntries.length > 0
				? parsedEntries.map((entry) => ({
						...entry,
						category: noteCategories.includes(entry.category) ? entry.category : 'Other',
				  }))
				: defaultEntries
		} catch {
			return defaultEntries
		}
	})

	const [formData, setFormData] = useState({
		member: teamMembers[0],
		category: noteCategories[0],
		date: new Date().toISOString().slice(0, 10),
		note: '',
	})

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
	}, [entries])

	const handleChange = (event) => {
		const { name, value } = event.target
		setFormData((current) => ({ ...current, [name]: value }))
	}

	const handleSubmit = (event) => {
		event.preventDefault()

		const trimmedNote = formData.note.trim()

		if (!trimmedNote) {
			return
		}

		const newEntry = {
			id: Date.now(),
			member: formData.member,
			category: formData.category,
			date: formData.date,
			note: trimmedNote,
		}

		setEntries((current) => [newEntry, ...current])
		setFormData((current) => ({
			...current,
			note: '',
			date: new Date().toISOString().slice(0, 10),
		}))
	}

	return (
		<div className="page-shell">
			<header className="header">
				<div>
					<p className="eyebrow">MTE 481 • Fall 2026</p>
					<h1>Design Log</h1>
				</div>

				<div className="header-meta" aria-label="Design log summary">
					<span>{entries.length} entries</span>
					<span>Team notes</span>
				</div>
			</header>

			<main className="layout">
				<section className="panel form-panel" aria-labelledby="new-note-heading">
					<h2 id="new-note-heading">Add a new note</h2>

					<form onSubmit={handleSubmit} className="log-form">
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
								placeholder="Use markdown here: **bold**, *italic*, list items, or [links](https://example.com)"
								value={formData.note}
								onChange={handleChange}
							/>
						</div>

						<p className="helper-text">Markdown is supported in note entries.</p>

						<button type="submit">Save note</button>
					</form>
				</section>

				<section className="panel entries-panel" aria-labelledby="recent-entries-heading">
					<h2 id="recent-entries-heading">Recent entries</h2>

					{entries.length === 0 ? (
						<p className="empty-state">No design log entries yet.</p>
					) : (
						<ul className="entry-list">
							{entries.map((entry) => (
								<li key={entry.id} className="entry-card">
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
					)}
				</section>
			</main>
		</div>
	)
}

export default App
