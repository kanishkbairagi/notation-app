# Notation Knowledge Graph & Modular Block-Tree Workspace

> An algorithmic knowledge management system and modular editor featuring an **HTML5 Canvas Force-Directed Knowledge Graph**, **Okapi BM25 Information Retrieval Engine**, **Prefix Trie Autocompletion**, and **Hierarchical Document AST Serialization**.

---

## 🔬 Core Computer Science & Systems Architecture

Unlike conventional note-taking clones, **Notation** is engineered around formal computer science paradigms in **Graph Theory**, **Information Retrieval (IR)**, and **Abstract Syntax Tree (AST) Document Modeling**.

### 1. Topological Knowledge Graph & Centrality Engine ($G = (V, E)$)
- **Force-Directed Physics Simulation**: Implemented directly on HTML5 Canvas using an iterative n-body relaxation model:
  $$\vec{F}_{\text{repulsive}} = \frac{k_r}{\|\vec{r}\|^2} \hat{r} \quad (\text{Coulomb-inspired}), \quad \vec{F}_{\text{attractive}} = k_s (\|\vec{r}\| - l_0) \hat{r} \quad (\text{Hooke-inspired})$$
- **Degree Centrality Analysis**: Dynamically computes normalized centrality scores to identify primary hub notes in the knowledge corpus:
  $$C_D(v) = \frac{\text{deg}(v)}{|V| - 1}$$
- **Connected Components**: Partitions unlinked subgraphs into isolated components via Breadth-First Search (BFS) in $\mathcal{O}(|V| + |E|)$ time.
- **Shortest Path Traversal**: Interactive graph pathfinding between arbitrary note nodes using BFS with parent-pointer backtracking in $\mathcal{O}(|V| + |E|)$.
- **Bidirectional Reference Traversal**: Extracts `[[Note Title]]` wikilinks and semantic mentions to resolve incoming and outgoing edge lists.

### 2. Information Retrieval & Okapi BM25 Ranking Engine
- **Inverted Index Data Structure**: Maps normalized term tokens to posting lists containing document IDs and term frequencies ($tf_{t, d}$).
- **Prefix Trie**: Implements an n-ary Trie data structure for fast prefix autocomplete queries with $\mathcal{O}(L)$ lookup complexity (where $L$ is query string length).
- **Okapi BM25 Ranking Model**: Evaluates document relevance using non-linear term frequency saturation and document length penalization:
  $$\text{Score}(D, Q) = \sum_{t \in Q} \text{IDF}(t) \cdot \frac{f(t, D) \cdot (k_1 + 1)}{f(t, D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$
  *Parameters*: $k_1 = 1.2$ (term frequency saturation), $b = 0.75$ (document length normalization).
- **Microsecond Query Diagnostics**: Built-in inspector profiling query tokenization, postings list traversals, and execution latency.

### 3. Hierarchical Document Tree & AST Serialization
- **Block-Based Data Modeling**: Notes are modeled as ordered sequences of typed block nodes.
- **Document AST Exporter**: Generates structured Abstract Syntax Tree representations supporting tree diffing, serialization, and external interchange.

---

## 📊 Algorithmic Complexity

| Component / Subsystem | Operation | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- |
| **Prefix Trie** | Word Insertion | $\mathcal{O}(L)$ | $\mathcal{O}(\Sigma \cdot L)$ |
| **Prefix Trie** | Autocomplete Search | $\mathcal{O}(L + K)$ | $\mathcal{O}(1)$ auxiliary |
| **Inverted Index** | Postings Generation | $\mathcal{O}(N \cdot |D|)$ | $\mathcal{O}(|V_{\text{terms}}| + P)$ |
| **BM25 Engine** | Query Scoring | $\mathcal{O}(\|Q\| \cdot \text{avg}(\text{postings}))$ | $\mathcal{O}(N_{\text{matched}})$ |
| **Graph Traversal** | BFS Shortest Path | $\mathcal{O}(\|V\| + \|E\|)$ | $\mathcal{O}(\|V\|)$ |
| **Graph Centrality** | Degree Centrality | $\mathcal{O}(\|V\| + \|E\|)$ | $\mathcal{O}(\|V\|)$ |

---

## 🛠️ Tech Stack & Implementation Details

- **Frontend Core**: React 18, HTML5 Canvas API (Physics Simulation Loop)
- **Data Structures**: N-ary Prefix Trie, Adjacency List Graph, Inverted Index Maps
- **State & Storage**: Client-side localStorage persistence with custom debounce synchronization
- **Drag & Drop**: React DnD (HTML5 Backend)
- **Styling**: Tailwind CSS (Dark/Light mode support)
- **Build & Bundle**: Vite

---

## 🚀 Getting Started

### Prerequisites
Node.js (>= 18.x) and npm.

### Installation
```bash
git clone https://github.com/kanishkbairagi/notation-app.git
cd notation-app
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
