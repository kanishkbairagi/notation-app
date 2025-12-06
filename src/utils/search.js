// Strip HTML tags from content for searching
function stripHtml(html) {
  if (!html) return ''
  // Remove HTML tags and decode HTML entities
  return html
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function smartSearch(query, pages) {
  if (!query || !query.trim()) {
    return pages
  }

  const lowerQuery = query.toLowerCase().trim()
  const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 0)

  if (queryWords.length === 0) {
    return pages
  }

  return pages
    .map(page => {
      const title = (page.title || '').toLowerCase()
      const content = (page.blocks || [])
        .map(block => {
          if (!block || !block.content) return ''
          // Strip HTML tags for text search
          return stripHtml(block.content).toLowerCase()
        })
        .join(' ')
      
      let score = 0

      // Exact title match
      if (title === lowerQuery) {
        score += 100
      } else if (title.includes(lowerQuery)) {
        score += 50
      }

      // Title word matches
      queryWords.forEach(word => {
        if (title.includes(word)) {
          score += 20
        }
      })

      // Content matches
      queryWords.forEach(word => {
        const contentMatches = (content.match(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
        score += contentMatches * 5
      })

      // Pinned pages get bonus
      if (page.pinned) {
        score += 10
      }

      // Recent pages get small bonus
      const daysSinceUpdate = (Date.now() - new Date(page.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceUpdate < 7) {
        score += 5
      }

      return { page, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.page)
}

