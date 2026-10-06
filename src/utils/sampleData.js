// Benchmark Computer Science Knowledge Base for Academic Portfolio Demonstration
export const INITIAL_CS_PAGES = [
  {
    id: 'cs-distributed-systems',
    title: 'Distributed Systems & Consensus',
    pinned: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    blocks: [
      {
        id: 'b1',
        type: 'text',
        content: '<div><strong>Distributed Systems Overview</strong></div><div>In large-scale distributed architectures, maintaining state consistency across partitioned networks requires consensus algorithms such as <em>Raft</em> and <em>Paxos</em>.</div><div>Refer to fundamental tradeoffs detailed in [[CAP Theorem]] and network topologies in [[Graph Theory & Network Centrality]].</div>'
      },
      {
        id: 'b2',
        type: 'text',
        content: '<div><strong>Consensus Invariants:</strong></div><div>• <em>Leader Election</em>: Randomized election timers prevent split-vote scenarios.</div><div>• <em>Log Replication</em>: Replicated state machines achieve linearizable reads/writes across quorums.</div><div>• Integrates with storage layers explored in [[Database Storage Engines: LSM-Trees]].</div>'
      }
    ]
  },
  {
    id: 'cs-cap-theorem',
    title: 'CAP Theorem',
    pinned: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    blocks: [
      {
        id: 'b3',
        type: 'text',
        content: '<div><strong>Brewer\'s Conjecture & Formal Proof</strong></div><div>In an asynchronous network subject to partitions (P), a distributed data store can guarantee at most two of the following properties simultaneously:</div><div>1. <strong>Consistency (Linearizability)</strong></div><div>2. <strong>Availability (Every non-failing node returns a non-error response)</strong></div><div>3. <strong>Partition Tolerance (System functions despite arbitrary dropped messages)</strong></div>'
      },
      {
        id: 'b4',
        type: 'text',
        content: '<div>Directly governs distributed consensus protocols evaluated in [[Distributed Systems & Consensus]] and storage tradeoff mechanisms in [[Database Storage Engines: LSM-Trees]].</div>'
      }
    ]
  },
  {
    id: 'cs-graph-theory',
    title: 'Graph Theory & Network Centrality',
    pinned: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    blocks: [
      {
        id: 'b5',
        type: 'text',
        content: '<div><strong>Topological Analysis & Centrality Metrics</strong></div><div>Knowledge bases and citation graphs can be formalized as directed graphs G = (V, E).</div><div>• <strong>Degree Centrality</strong>: C_D(v) = deg(v) / (|V| - 1) measuring local interconnectivity.</div><div>• <strong>Connected Components</strong>: Computed via Breadth-First Search (BFS) in O(|V| + |E|) time complexity.</div>'
      },
      {
        id: 'b6',
        type: 'text',
        content: '<div>This graph engine visualizes node relationships in real-time. Nodes link to [[Information Retrieval: Okapi BM25]] and [[Data Structures: Inverted Index]].</div>'
      }
    ]
  },
  {
    id: 'cs-ir-bm25',
    title: 'Information Retrieval: Okapi BM25',
    pinned: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    blocks: [
      {
        id: 'b7',
        type: 'text',
        content: '<div><strong>Probabilistic Relevance Framework</strong></div><div>Okapi BM25 is a non-linear ranking function that optimizes term frequency saturation and document length normalization:</div><div><strong>BM25(D, Q) = Σ IDF(t) • [f(t, D) • (k1 + 1)] / [f(t, D) + k1 • (1 - b + b • |D| / avgdl)]</strong></div>'
      },
      {
        id: 'b8',
        type: 'text',
        content: '<div>Evaluated against the posting lists produced by [[Data Structures: Inverted Index]]. Correlates with topological query paths in [[Graph Theory & Network Centrality]].</div>'
      }
    ]
  },
  {
    id: 'cs-inverted-index',
    title: 'Data Structures: Inverted Index',
    pinned: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    blocks: [
      {
        id: 'b9',
        type: 'text',
        content: '<div><strong>Inverted Index & Prefix Trie Architecture</strong></div><div>Postings map term tokens to document occurrences: <em>Map&lt;Token, List&lt;Posting&gt;&gt;</em>.</div><div>• Allows O(1) term lookup with posting list intersections in O(m + n).</div><div>• Integrated with a Trie data structure supporting prefix autocompletion in O(L) where L is query length.</div>'
      },
      {
        id: 'b10',
        type: 'text',
        content: '<div>Primary indexing engine powering [[Information Retrieval: Okapi BM25]] and compared against disk block indexing in [[Database Storage Engines: LSM-Trees]].</div>'
      }
    ]
  },
  {
    id: 'cs-storage-engines',
    title: 'Database Storage Engines: LSM-Trees',
    pinned: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [
      {
        id: 'b11',
        type: 'text',
        content: '<div><strong>Log-Structured Merge-Trees vs B-Trees</strong></div><div>LSM-Trees optimize write throughput by converting random I/O writes into sequential append-only writes via:</div><div>1. <strong>MemTable</strong>: In-memory skip list or Red-Black Tree.</div><div>2. <strong>Write-Ahead Log (WAL)</strong>: Crash recovery persistence.</div><div>3. <strong>SSTables</strong>: Sorted String Tables compacted in leveled tiers.</div>'
      },
      {
        id: 'b12',
        type: 'text',
        content: '<div>Underpins distributed storage systems in [[Distributed Systems & Consensus]] governed by the [[CAP Theorem]].</div>'
      }
    ]
  }
]
