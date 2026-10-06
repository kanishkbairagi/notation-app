/**
 * Graph Theory & Network Analysis Engine
 * Models pages as directed graph G = (V, E)
 * Computes Degree Centrality, Connected Components (BFS), and Shortest Paths (BFS)
 */

// Helper to strip HTML tags from block content
function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Parses bidirectional [[Page Title]] wikilinks and exact title mentions from blocks
 */
export function extractWikiLinks(text) {
  if (!text) return []
  const matches = []
  const regex = /\[\[(.*?)\]\]/g
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match[1] && match[1].trim()) {
      matches.push(match[1].trim().toLowerCase())
    }
  }
  return matches
}

/**
 * Builds the graph representation G = (V, E)
 * Time Complexity: O(|V| * |B| + |E|) where B is blocks per page
 */
export function buildGraph(pages) {
  if (!pages || pages.length === 0) {
    return {
      nodes: [],
      edges: [],
      adjacencyList: new Map(),
      metrics: { nodeCount: 0, edgeCount: 0, density: 0, avgDegree: 0, componentsCount: 0 }
    }
  }

  // Map lowercase title to page id for fast link resolution: O(1)
  const titleToPageMap = new Map()
  pages.forEach(page => {
    if (page.title) {
      titleToPageMap.set(page.title.trim().toLowerCase(), page.id)
    }
  })

  const nodes = pages.map(page => ({
    id: page.id,
    title: page.title || 'Untitled',
    inDegree: 0,
    outDegree: 0,
    degreeCentrality: 0,
    componentId: 0,
    pinned: !!page.pinned,
    updatedAt: page.updatedAt
  }))

  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const edgeSet = new Set()
  const edges = []
  const adjacencyList = new Map()

  nodes.forEach(n => adjacencyList.set(n.id, new Set()))

  // Extract edges
  pages.forEach(page => {
    const sourceId = page.id
    const combinedContent = (page.blocks || [])
      .map(b => stripHtml(b.content || ''))
      .join(' ')

    const explicitLinks = extractWikiLinks(combinedContent)

    // Also look for other page titles directly in text
    pages.forEach(targetPage => {
      if (targetPage.id === sourceId) return
      const targetTitleLower = (targetPage.title || '').trim().toLowerCase()
      if (!targetTitleLower || targetTitleLower === 'untitled') return

      const isWikiLinked = explicitLinks.includes(targetTitleLower)
      const isMentioned = combinedContent.toLowerCase().includes(targetTitleLower)

      if (isWikiLinked || isMentioned) {
        const edgeKey = `${sourceId}->${targetPage.id}`
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey)
          edges.push({
            id: edgeKey,
            source: sourceId,
            target: targetPage.id,
            type: isWikiLinked ? 'wikilink' : 'mention'
          })

          adjacencyList.get(sourceId).add(targetPage.id)
          
          const srcNode = nodeMap.get(sourceId)
          const tgtNode = nodeMap.get(targetPage.id)
          if (srcNode) srcNode.outDegree += 1
          if (tgtNode) tgtNode.inDegree += 1
        }
      }
    })
  })

  // Calculate Degree Centrality: C_D(v) = deg(v) / (|V| - 1)
  const n = nodes.length
  nodes.forEach(node => {
    const totalDegree = node.inDegree + node.outDegree
    node.degreeCentrality = n > 1 ? Number((totalDegree / (n - 1)).toFixed(3)) : 0
  })

  // Connected Components via Breadth-First Search (BFS): O(|V| + |E|)
  const visited = new Set()
  let componentCounter = 0

  // Undirected view for connected components
  const undirectedAdj = new Map()
  nodes.forEach(node => undirectedAdj.set(node.id, new Set()))
  edges.forEach(edge => {
    undirectedAdj.get(edge.source)?.add(edge.target)
    undirectedAdj.get(edge.target)?.add(edge.source)
  })

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      componentCounter += 1
      const queue = [node.id]
      visited.add(node.id)

      while (queue.length > 0) {
        const currentId = queue.shift()
        const currNode = nodeMap.get(currentId)
        if (currNode) currNode.componentId = componentCounter

        const neighbors = undirectedAdj.get(currentId) || []
        neighbors.forEach(neighborId => {
          if (!visited.has(neighborId)) {
            visited.add(neighborId)
            queue.push(neighborId)
          }
        })
      }
    }
  })

  // Graph Density: D = 2|E| / (|V|*(|V|-1)) for undirected, |E| / (|V|*(|V|-1)) for directed
  const possibleEdges = n * (n - 1)
  const density = possibleEdges > 0 ? Number((edges.length / possibleEdges).toFixed(3)) : 0
  const avgDegree = n > 0 ? Number(((edges.length * 2) / n).toFixed(2)) : 0

  return {
    nodes,
    edges,
    adjacencyList,
    metrics: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      density,
      avgDegree,
      componentsCount: componentCounter
    }
  }
}

/**
 * BFS Shortest Path Algorithm between two notes
 * Time Complexity: O(|V| + |E|)
 * Returns path array of node IDs: [startId, ..., endId] or null if unreachable
 */
export function findShortestPath(adjacencyList, startId, endId) {
  if (!startId || !endId || startId === endId) return [startId]
  if (!adjacencyList.has(startId) || !adjacencyList.has(endId)) return null

  // Treat as undirected for navigation path exploration
  const queue = [startId]
  const visited = new Set([startId])
  const parentMap = new Map()

  while (queue.length > 0) {
    const current = queue.shift()
    if (current === endId) {
      // Reconstruct path
      const path = []
      let step = endId
      while (step) {
        path.unshift(step)
        step = parentMap.get(step)
      }
      return path
    }

    const neighbors = adjacencyList.get(current) || []
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        parentMap.set(neighbor, current)
        queue.push(neighbor)
      }
    })
  }

  return null
}
