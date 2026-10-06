import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { buildGraph, findShortestPath } from '../utils/graph'

export function GraphView({ pages, onSelectPage, onClose }) {
  const canvasRef = useRef(null)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [hoveredNodeId, setHoveredNodeId] = useState(null)
  const [pathStartId, setPathStartId] = useState('')
  const [pathEndId, setPathEndId] = useState('')
  const [activePath, setActivePath] = useState(null)
  const [showMetricsPanel, setShowMetricsPanel] = useState(true)

  // Build the graph model from current pages
  const graphData = useMemo(() => buildGraph(pages), [pages])
  const { nodes: rawNodes, edges, adjacencyList, metrics } = graphData

  // State to hold dynamic node positions for physics simulation
  const simulationRef = useRef({
    nodes: [],
    draggingNode: null,
    dragOffset: { x: 0, y: 0 },
    animationFrameId: null,
  })

  // Initialize node physics positions
  useEffect(() => {
    const width = 800
    const height = 600
    const centerX = width / 2
    const centerY = height / 2

    const existingMap = new Map(simulationRef.current.nodes.map(n => [n.id, n]))

    simulationRef.current.nodes = rawNodes.map((n, i) => {
      const existing = existingMap.get(n.id)
      if (existing) {
        return {
          ...n,
          x: existing.x,
          y: existing.y,
          vx: existing.vx || 0,
          vy: existing.vy || 0,
          radius: 12 + n.degreeCentrality * 18
        }
      }
      // Circular initial distribution
      const angle = (i / Math.max(1, rawNodes.length)) * 2 * Math.PI
      const radius = 140 + Math.random() * 80
      return {
        ...n,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 12 + n.degreeCentrality * 18
      }
    })
  }, [rawNodes])

  // Run shortest path calculation when endpoints change
  const handleCalculatePath = useCallback(() => {
    if (!pathStartId || !pathEndId) {
      setActivePath(null)
      return
    }
    const path = findShortestPath(adjacencyList, pathStartId, pathEndId)
    setActivePath(path)
  }, [adjacencyList, pathStartId, pathEndId])

  // Physics animation loop on Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const kRepulsion = 2400
    const kSpring = 0.04
    const restLength = 130
    const damping = 0.84
    const centerGravity = 0.015

    let isRunning = true

    const updatePhysicsAndRender = () => {
      if (!isRunning) return

      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2

      const simNodes = simulationRef.current.nodes
      const nodeMap = new Map(simNodes.map(n => [n.id, n]))

      // 1. Repulsion forces: Coulomb's Law O(V^2)
      for (let i = 0; i < simNodes.length; i++) {
        for (let j = i + 1; j < simNodes.length; j++) {
          const n1 = simNodes[i]
          const n2 = simNodes[j]
          const dx = n2.x - n1.x
          const dy = n2.y - n1.y
          const distSq = dx * dx + dy * dy + 100
          const dist = Math.sqrt(distSq)
          const force = kRepulsion / distSq

          const fx = (dx / dist) * force
          const fy = (dy / dist) * force

          if (simulationRef.current.draggingNode !== n1) {
            n1.vx -= fx
            n1.vy -= fy
          }
          if (simulationRef.current.draggingNode !== n2) {
            n2.vx += fx
            n2.vy += fy
          }
        }
      }

      // 2. Attraction forces along edges: Hooke's Law O(E)
      edges.forEach(edge => {
        const src = nodeMap.get(edge.source)
        const tgt = nodeMap.get(edge.target)
        if (!src || !tgt) return

        const dx = tgt.x - src.x
        const dy = tgt.y - src.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const delta = dist - restLength
        const force = kSpring * delta

        const fx = (dx / dist) * force
        const fy = (dy / dist) * force

        if (simulationRef.current.draggingNode !== src) {
          src.vx += fx
          src.vy += fy
        }
        if (simulationRef.current.draggingNode !== tgt) {
          tgt.vx -= fx
          tgt.vy -= fy
        }
      })

      // 3. Center gravity and position integration
      simNodes.forEach(node => {
        if (simulationRef.current.draggingNode === node) return

        // Gravity toward center
        node.vx += (centerX - node.x) * centerGravity
        node.vy += (centerY - node.y) * centerGravity

        // Damping
        node.vx *= damping
        node.vy *= damping

        // Update positions
        node.x += node.vx
        node.y += node.vy

        // Keep within bounds
        const padding = node.radius + 10
        node.x = Math.max(padding, Math.min(width - padding, node.x))
        node.y = Math.max(padding, Math.min(height - padding, node.y))
      })

      // 4. Render canvas frame
      ctx.clearRect(0, 0, width, height)

      // Draw Edges
      edges.forEach(edge => {
        const src = nodeMap.get(edge.source)
        const tgt = nodeMap.get(edge.target)
        if (!src || !tgt) return

        const isPathEdge = activePath && activePath.some((id, idx) => {
          if (idx === activePath.length - 1) return false
          const next = activePath[idx + 1]
          return (edge.source === id && edge.target === next) || (edge.source === next && edge.target === id)
        })

        ctx.beginPath()
        ctx.moveTo(src.x, src.y)
        ctx.lineTo(tgt.x, tgt.y)

        if (isPathEdge) {
          ctx.strokeStyle = '#10B981' // Emerald highlight for BFS path
          ctx.lineWidth = 3.5
          ctx.setLineDash([])
        } else if (edge.source === hoveredNodeId || edge.target === hoveredNodeId) {
          ctx.strokeStyle = '#3B82F6' // Blue for connected edge on hover
          ctx.lineWidth = 2
          ctx.setLineDash([])
        } else {
          ctx.strokeStyle = '#4B5563' // Subtle gray
          ctx.lineWidth = 1.2
          ctx.setLineDash(edge.type === 'wikilink' ? [] : [4, 4])
        }
        ctx.stroke()
        ctx.setLineDash([])

        // Arrow head for directed wikilinks
        const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x)
        const arrowDist = tgt.radius + 6
        const arrowX = tgt.x - Math.cos(angle) * arrowDist
        const arrowY = tgt.y - Math.sin(angle) * arrowDist

        ctx.beginPath()
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(
          arrowX - 8 * Math.cos(angle - Math.PI / 6),
          arrowY - 8 * Math.sin(angle - Math.PI / 6)
        )
        ctx.lineTo(
          arrowX - 8 * Math.cos(angle + Math.PI / 6),
          arrowY - 8 * Math.sin(angle + Math.PI / 6)
        )
        ctx.fillStyle = isPathEdge ? '#10B981' : '#6B7280'
        ctx.fill()
      })

      // Draw Nodes
      simNodes.forEach(node => {
        const isSelected = selectedNodeId === node.id
        const isHovered = hoveredNodeId === node.id
        const isPathNode = activePath && activePath.includes(node.id)

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)

        // Palette by component
        const componentColors = [
          '#3B82F6', // Blue
          '#8B5CF6', // Purple
          '#EC4899', // Pink
          '#F59E0B', // Amber
          '#10B981', // Green
          '#06B6D4'  // Cyan
        ]
        const baseColor = componentColors[(node.componentId - 1) % componentColors.length] || '#3B82F6'

        ctx.fillStyle = isPathNode ? '#10B981' : isSelected ? '#6366F1' : baseColor
        ctx.fill()

        // Outer glow/ring
        if (isSelected || isHovered || isPathNode) {
          ctx.lineWidth = isPathNode ? 4 : 3
          ctx.strokeStyle = isPathNode ? '#34D399' : '#FFFFFF'
          ctx.stroke()
        } else {
          ctx.lineWidth = 1.5
          ctx.strokeStyle = '#1F2937'
          ctx.stroke()
        }

        // Label
        ctx.font = `${isHovered || isSelected ? 'bold 12px' : '11px'} Inter, system-ui, sans-serif`
        ctx.fillStyle = '#E5E7EB'
        ctx.textAlign = 'center'
        const displayTitle = node.title.length > 20 ? node.title.substring(0, 18) + '...' : node.title
        ctx.fillText(displayTitle, node.x, node.y + node.radius + 15)
      })

      simulationRef.current.animationFrameId = requestAnimationFrame(updatePhysicsAndRender)
    }

    simulationRef.current.animationFrameId = requestAnimationFrame(updatePhysicsAndRender)

    return () => {
      isRunning = false
      if (simulationRef.current.animationFrameId) {
        cancelAnimationFrame(simulationRef.current.animationFrameId)
      }
    }
  }, [edges, selectedNodeId, hoveredNodeId, activePath])

  // Mouse interaction handlers
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clickedNode = simulationRef.current.nodes.find(n => {
      const dx = n.x - x
      const dy = n.y - y
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 5
    })

    if (clickedNode) {
      simulationRef.current.draggingNode = clickedNode
      simulationRef.current.dragOffset = { x: clickedNode.x - x, y: clickedNode.y - y }
      setSelectedNodeId(clickedNode.id)
    } else {
      setSelectedNodeId(null)
    }
  }

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (simulationRef.current.draggingNode) {
      simulationRef.current.draggingNode.x = x + simulationRef.current.dragOffset.x
      simulationRef.current.draggingNode.y = y + simulationRef.current.dragOffset.y
      simulationRef.current.draggingNode.vx = 0
      simulationRef.current.draggingNode.vy = 0
      return
    }

    const hovered = simulationRef.current.nodes.find(n => {
      const dx = n.x - x
      const dy = n.y - y
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 5
    })

    setHoveredNodeId(hovered ? hovered.id : null)
    canvas.style.cursor = hovered ? 'pointer' : 'default'
  }

  const handleMouseUp = () => {
    simulationRef.current.draggingNode = null
  }

  const selectedNode = rawNodes.find(n => n.id === selectedNodeId)

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden relative">
      {/* Top Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              Knowledge Graph Visualizer
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Force-Directed Physics G=(V,E)
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Topological document relationship modeling • Centrality analysis • BFS Pathfinding
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMetricsPanel(!showMetricsPanel)}
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-medium transition-colors"
          >
            {showMetricsPanel ? 'Hide Graph Analytics' : 'Show Graph Analytics'}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Back to Editor
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Canvas Area */}
        <div className="flex-1 relative bg-gray-950 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={950}
            height={680}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full block"
          />

          {/* Interactive Guide Overlay */}
          <div className="absolute bottom-4 left-4 text-xs text-gray-400 bg-gray-900/80 backdrop-blur px-3 py-2 rounded-lg border border-gray-800 flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Drag nodes to test spring physics
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> BFS Shortest Path Traversal
            </span>
          </div>

          {/* Node Detail Floating Card */}
          {selectedNode && (
            <div className="absolute top-4 left-4 w-72 bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl p-4 shadow-2xl z-20 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-semibold">
                  Node Inspector
                </span>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="text-gray-400 hover:text-gray-200 text-xs"
                >
                  ✕
                </button>
              </div>
              <h3 className="font-bold text-gray-100 text-base mb-1 truncate">{selectedNode.title}</h3>
              <div className="text-xs text-gray-400 mb-3 space-y-1">
                <div className="flex justify-between">
                  <span>Degree Centrality C_D:</span>
                  <span className="font-mono text-indigo-300 font-semibold">{selectedNode.degreeCentrality}</span>
                </div>
                <div className="flex justify-between">
                  <span>In-Degree / Out-Degree:</span>
                  <span className="font-mono text-gray-200">{selectedNode.inDegree} in / {selectedNode.outDegree} out</span>
                </div>
                <div className="flex justify-between">
                  <span>Connected Component:</span>
                  <span className="font-mono text-gray-200">#{selectedNode.componentId}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onSelectPage(selectedNode.id)
                    onClose()
                  }}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
                >
                  Open Document →
                </button>
                <button
                  onClick={() => setPathStartId(selectedNode.id)}
                  className="px-2 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs border border-gray-600"
                  title="Set as Pathfinding Origin"
                >
                  Set Origin
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Analytics & Pathfinding Sidebar */}
        {showMetricsPanel && (
          <div className="w-80 border-l border-gray-800 bg-gray-900/90 backdrop-blur flex flex-col p-4 overflow-y-auto z-10">
            <h3 className="text-xs uppercase font-mono tracking-wider text-gray-400 font-semibold mb-3">
              Graph Theory Metrics O(|V| + |E|)
            </h3>

            {/* Metric Counters Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700/60">
                <div className="text-xs text-gray-400">Vertices |V|</div>
                <div className="text-xl font-bold font-mono text-blue-400">{metrics.nodeCount}</div>
              </div>
              <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700/60">
                <div className="text-xs text-gray-400">Edges |E|</div>
                <div className="text-xl font-bold font-mono text-indigo-400">{metrics.edgeCount}</div>
              </div>
              <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700/60">
                <div className="text-xs text-gray-400">Graph Density</div>
                <div className="text-xl font-bold font-mono text-pink-400">{metrics.density}</div>
              </div>
              <div className="p-3 bg-gray-800/60 rounded-lg border border-gray-700/60">
                <div className="text-xs text-gray-400">Components</div>
                <div className="text-xl font-bold font-mono text-emerald-400">{metrics.componentsCount}</div>
              </div>
            </div>

            {/* Pathfinding Section */}
            <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700 mb-4">
              <h4 className="text-xs font-semibold text-gray-200 mb-2 flex items-center justify-between">
                <span>BFS Shortest Path Finder</span>
                <span className="font-mono text-[10px] text-emerald-400">O(V + E)</span>
              </h4>
              <div className="space-y-2 mb-3">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Source Node:</label>
                  <select
                    value={pathStartId}
                    onChange={(e) => setPathStartId(e.target.value)}
                    className="w-full text-xs bg-gray-950 border border-gray-700 rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Origin Node...</option>
                    {rawNodes.map(n => (
                      <option key={n.id} value={n.id}>{n.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Target Node:</label>
                  <select
                    value={pathEndId}
                    onChange={(e) => setPathEndId(e.target.value)}
                    className="w-full text-xs bg-gray-950 border border-gray-700 rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Target Node...</option>
                    {rawNodes.map(n => (
                      <option key={n.id} value={n.id}>{n.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCalculatePath}
                  disabled={!pathStartId || !pathEndId}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs font-medium transition-colors"
                >
                  Run BFS Path Search
                </button>
                {activePath && (
                  <button
                    onClick={() => setActivePath(null)}
                    className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {activePath && (
                <div className="mt-3 p-2 bg-emerald-950/40 border border-emerald-500/30 rounded text-xs text-emerald-300">
                  <div className="font-semibold mb-1">Path Found ({activePath.length - 1} hops):</div>
                  <div className="space-y-1 font-mono text-[11px]">
                    {activePath.map((id, idx) => {
                      const node = rawNodes.find(n => n.id === id)
                      return (
                        <div key={id} className="flex items-center gap-1">
                          <span className="text-gray-400">{idx + 1}.</span>
                          <span className="truncate">{node?.title}</span>
                          {idx < activePath.length - 1 && <span className="text-emerald-400">→</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Centrality Leaderboard */}
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-gray-200 mb-2">
                Degree Centrality Leaderboard C_D(v)
              </h4>
              <div className="space-y-1 text-xs">
                {[...rawNodes]
                  .sort((a, b) => b.degreeCentrality - a.degreeCentrality)
                  .slice(0, 6)
                  .map((node, index) => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-2 rounded cursor-pointer flex items-center justify-between transition-colors ${
                        selectedNodeId === node.id
                          ? 'bg-indigo-900/50 text-indigo-200 border border-indigo-700/50'
                          : 'bg-gray-800/40 hover:bg-gray-800 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] text-gray-400 w-4">{index + 1}.</span>
                        <span className="truncate">{node.title}</span>
                      </div>
                      <span className="font-mono text-indigo-400 font-semibold ml-2">
                        {node.degreeCentrality}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
