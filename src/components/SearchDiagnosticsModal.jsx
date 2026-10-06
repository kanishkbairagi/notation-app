export function SearchDiagnosticsModal({ diagnostics, query, onClose }) {
  if (!diagnostics) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm text-gray-100 truncate">IR Engine Inspector</h3>
              <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">Okapi BM25 Ranking & Inverted Index</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-sm p-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 text-xs overflow-y-auto">
          {/* Query & Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="p-2.5 sm:p-3 bg-gray-800/60 rounded-xl border border-gray-700/60">
              <div className="text-gray-400 text-[10px] uppercase font-mono">Execution Time</div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-1">
                {diagnostics.executionTimeMs} ms
              </div>
            </div>
            <div className="p-2.5 sm:p-3 bg-gray-800/60 rounded-xl border border-gray-700/60">
              <div className="text-gray-400 text-[10px] uppercase font-mono">Indexed Documents</div>
              <div className="text-base sm:text-lg font-bold font-mono text-blue-400 mt-1">
                {diagnostics.totalDocs} pages
              </div>
            </div>
            <div className="p-2.5 sm:p-3 bg-gray-800/60 rounded-xl border border-gray-700/60">
              <div className="text-gray-400 text-[10px] uppercase font-mono">Avg Doc Length</div>
              <div className="text-base sm:text-lg font-bold font-mono text-purple-400 mt-1">
                {diagnostics.avgdl} tokens
              </div>
            </div>
          </div>

          {/* Tokenization Pipeline */}
          <div className="p-2.5 sm:p-3 bg-gray-800/40 rounded-xl border border-gray-700">
            <div className="text-gray-400 text-[10px] sm:text-[11px] font-medium mb-1.5 flex justify-between">
              <span>Tokenization & Stopwords:</span>
              <span className="font-mono text-indigo-400">{diagnostics.tokens.length} tokens</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {diagnostics.tokens.length > 0 ? (
                diagnostics.tokens.map((token, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono text-[10px] sm:text-[11px]"
                  >
                    "{token}"
                  </span>
                ))
              ) : (
                <span className="text-gray-500 italic text-[11px]">No non-stopwords in query</span>
              )}
            </div>
          </div>

          {/* BM25 Algorithm Mathematical Model */}
          <div className="p-2.5 sm:p-3 bg-gray-950 rounded-xl border border-gray-800 font-mono text-[10px] sm:text-[11px] text-gray-300">
            <div className="text-indigo-400 font-semibold mb-1">Ranking Formula:</div>
            <div className="text-gray-400 leading-relaxed overflow-x-auto whitespace-pre pb-1">
              Score(D, Q) = Σ IDF(qi) • [f(qi, D) • (k1 + 1)] / [f(qi, D) + k1 • (1 - b + b • |D| / avgdl)]
            </div>
            <div className="mt-1 text-[10px] text-gray-500">
              Parameters: k1 = 1.2 (saturation), b = 0.75 (length normalization)
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-950 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  )
}
