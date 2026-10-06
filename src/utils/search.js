/**
 * Information Retrieval (IR) & Search Engine Subsystem
 * Implements:
 * 1. Trie Data Structure for O(L) Prefix Matching & Autocomplete
 * 2. Inverted Index with Postings Lists
 * 3. Okapi BM25 Probabilistic Ranking Algorithm
 * 4. Microsecond Query Performance Profiling
 */

const STOP_WORDS = new Set([
  'a', 'about', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to',
  'was', 'were', 'will', 'with'
])

export function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Tokenizes and filters stop words
 */
export function tokenize(text) {
  if (!text) return []
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token))
}

/**
 * Trie Node for Prefix Search
 */
class TrieNode {
  constructor() {
    parent: null
    this.children = new Map()
    this.isEndOfWord = false
    this.frequency = 0
  }
}

/**
 * Prefix Trie Data Structure
 * Insert Complexity: O(L) where L = word length
 * Prefix Search Complexity: O(L + K) where K = number of matched terms
 */
export class PrefixTrie {
  constructor() {
    this.root = new TrieNode()
  }

  insert(word) {
    if (!word) return
    let current = this.root
    for (const char of word) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode())
      }
      current = current.children.get(char)
    }
    current.isEndOfWord = true
    current.frequency += 1
  }

  getCompletions(prefix, maxResults = 5) {
    if (!prefix) return []
    let current = this.root
    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) {
        return []
      }
      current = current.children.get(char)
    }

    const results = []
    const dfs = (node, path) => {
      if (results.length >= maxResults) return
      if (node.isEndOfWord) {
        results.push(prefix + path)
      }
      for (const [char, childNode] of node.children.entries()) {
        dfs(childNode, path + char)
      }
    }

    dfs(current, '')
    return results
  }
}

/**
 * Inverted Index Structure
 * Maps Term -> Postings List: Array<{ docId: string, termFreq: number }>
 */
export class InvertedIndex {
  constructor() {
    this.index = new Map() // term -> Map<docId, tf>
    this.docLengths = new Map() // docId -> totalTokens
    this.docCount = 0
    this.avgDocLength = 0
    this.trie = new PrefixTrie()
  }

  build(pages) {
    this.index.clear()
    this.docLengths.clear()
    this.trie = new PrefixTrie()
    this.docCount = pages.length

    let totalLength = 0

    pages.forEach(page => {
      const docId = page.id
      const titleTokens = tokenize(page.title || '')
      const contentTokens = (page.blocks || [])
        .flatMap(b => tokenize(stripHtml(b.content || '')))

      // Title tokens are given 3x weight by duplicating in token stream
      const allTokens = [...titleTokens, ...titleTokens, ...titleTokens, ...contentTokens]
      const length = allTokens.length
      this.docLengths.set(docId, length)
      totalLength += length

      const tfMap = new Map()
      allTokens.forEach(token => {
        tfMap.set(token, (tfMap.get(token) || 0) + 1)
        this.trie.insert(token)
      })

      tfMap.forEach((tf, term) => {
        if (!this.index.has(term)) {
          this.index.set(term, new Map())
        }
        this.index.get(term).set(docId, tf)
      })
    })

    this.avgDocLength = this.docCount > 0 ? totalLength / this.docCount : 0
  }

  /**
   * Okapi BM25 Ranking Score:
   * Score(D, Q) = Σ IDF(qi) * [f(qi, D) * (k1 + 1)] / [f(qi, D) + k1 * (1 - b + b * (|D| / avgdl))]
   */
  searchBM25(query, k1 = 1.2, b = 0.75) {
    const startTime = performance.now()
    const queryTokens = tokenize(query)

    if (queryTokens.length === 0) {
      return {
        results: [],
        diagnostics: {
          executionTimeMs: 0,
          tokens: [],
          totalDocs: this.docCount,
          avgdl: this.avgDocLength
        }
      }
    }

    const docScores = new Map() // docId -> totalScore
    const matchedTermMap = new Map() // docId -> Set<term>

    queryTokens.forEach(token => {
      const postings = this.index.get(token)
      if (!postings) return

      // Number of documents containing term: n(qi)
      const docFreq = postings.size
      // Inverse Document Frequency with smoothing
      const idf = Math.log(1 + (this.docCount - docFreq + 0.5) / (docFreq + 0.5))

      postings.forEach((tf, docId) => {
        const docLen = this.docLengths.get(docId) || this.avgDocLength
        const lenNorm = 1 - b + b * (docLen / (this.avgDocLength || 1))
        const tfComponent = (tf * (k1 + 1)) / (tf + k1 * lenNorm)
        const score = idf * tfComponent

        docScores.set(docId, (docScores.get(docId) || 0) + score)

        if (!matchedTermMap.has(docId)) {
          matchedTermMap.set(docId, new Set())
        }
        matchedTermMap.get(docId).add(token)
      })
    })

    const endTime = performance.now()
    const executionTimeMs = Number((endTime - startTime).toFixed(3))

    const sortedResults = Array.from(docScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([docId, score]) => ({
        docId,
        score: Number(score.toFixed(3)),
        matchedTerms: Array.from(matchedTermMap.get(docId) || [])
      }))

    return {
      results: sortedResults,
      diagnostics: {
        executionTimeMs,
        tokens: queryTokens,
        totalDocs: this.docCount,
        avgdl: Number(this.avgDocLength.toFixed(1)),
        postingsQueried: queryTokens.reduce((acc, t) => acc + (this.index.get(t)?.size || 0), 0)
      }
    }
  }
}

// Global cached index instance for performance
let cachedIndex = null
let lastPagesHash = ''

function getOrCreateIndex(pages) {
  const currentHash = pages.map(p => `${p.id}:${p.updatedAt}`).join('|')
  if (!cachedIndex || lastPagesHash !== currentHash) {
    cachedIndex = new InvertedIndex()
    cachedIndex.build(pages)
    lastPagesHash = currentHash
  }
  return cachedIndex
}

/**
 * Enhanced smartSearch returning sorted pages
 */
export function smartSearch(query, pages) {
  if (!query || !query.trim()) return pages
  const index = getOrCreateIndex(pages)
  const { results } = index.searchBM25(query)

  if (results.length === 0) {
    // Fallback simple title containment for partial words
    const lower = query.toLowerCase().trim()
    return pages.filter(p => (p.title || '').toLowerCase().includes(lower))
  }

  const pageMap = new Map(pages.map(p => [p.id, p]))
  return results
    .map(r => pageMap.get(r.docId))
    .filter(Boolean)
}

/**
 * Advanced search with full Information Retrieval diagnostic metadata
 */
export function searchWithDiagnostics(query, pages) {
  if (!query || !query.trim()) {
    return {
      pages,
      diagnostics: null
    }
  }

  const index = getOrCreateIndex(pages)
  const { results, diagnostics } = index.searchBM25(query)
  const pageMap = new Map(pages.map(p => [p.id, p]))

  let matchedPages = results
    .map(r => {
      const page = pageMap.get(r.docId)
      if (!page) return null
      return {
        ...page,
        _irScore: r.score,
        _matchedTerms: r.matchedTerms
      }
    })
    .filter(Boolean)

  if (matchedPages.length === 0) {
    // Substring fallback
    const lower = query.toLowerCase().trim()
    matchedPages = pages.filter(p => (p.title || '').toLowerCase().includes(lower))
  }

  return {
    pages: matchedPages,
    diagnostics
  }
}

/**
 * Autocomplete prefix helper using Prefix Trie
 */
export function getAutocompleteSuggestions(prefix, pages) {
  if (!prefix || prefix.trim().length < 2) return []
  const index = getOrCreateIndex(pages)
  return index.trie.getCompletions(prefix.trim(), 4)
}
