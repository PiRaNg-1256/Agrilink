'use client'
import { useState, useRef } from 'react'
import ProductForm from './ProductForm'
import { parseProductCSV, CSV_TEMPLATE } from '@/lib/utils/csvParser'
import { createProduct } from '@/lib/actions/products'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Upload, Download, CheckCircle, XCircle } from 'lucide-react'

export default function AddProductTabs() {
  const [tab, setTab] = useState<'single' | 'bulk'>('single')
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [results, setResults] = useState<{ name: string; ok: boolean }[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const parsed = parseProductCSV(text)
      setRows(parsed)
      setResults([])
    }
    reader.readAsText(file)
  }

  const handleUploadAll = async () => {
    if (rows.length === 0) return
    setProgress({ done: 0, total: rows.length })
    setResults([])
    const newResults: { name: string; ok: boolean }[] = []
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      try {
        const fd = new FormData()
        Object.entries(row).forEach(([k, v]) => fd.set(k, v))
        await createProduct(fd)
        newResults.push({ name: row.name || `Row ${i + 1}`, ok: true })
      } catch {
        newResults.push({ name: row.name || `Row ${i + 1}`, ok: false })
      }
      setProgress({ done: i + 1, total: rows.length })
      setResults([...newResults])
    }
    const ok = newResults.filter(r => r.ok).length
    toast.success(`${ok}/${rows.length} products uploaded!`)
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'agrilink-products-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex gap-2 mb-8">
        {[['single', 'Single Product'], ['bulk', 'Bulk Upload (CSV)']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val as any)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${tab === val ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'single' && <ProductForm />}

      {tab === 'bulk' && (
        <div className="max-w-2xl space-y-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
            <h3 className="text-white font-bold mb-2">Step 1: Download Template</h3>
            <p className="text-gray-500 text-sm mb-4">Fill in the CSV with your product details. Use one row per product.</p>
            <button onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white text-sm hover:bg-white/20 transition-colors">
              <Download className="w-4 h-4" /> Download CSV Template
            </button>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
            <h3 className="text-white font-bold mb-2">Step 2: Upload Your CSV</h3>
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile}
              className="block w-full text-sm text-gray-400 file:bg-green-500/20 file:text-green-400 file:border-0 file:rounded-lg file:px-4 file:py-2 file:mr-4 file:cursor-pointer hover:file:bg-green-500/30" />
          </div>

          {rows.length > 0 && (
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
              <h3 className="text-white font-bold mb-4">Step 3: Preview ({rows.length} products)</h3>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      {Object.keys(rows[0]).map(h => (
                        <th key={h} className="text-gray-500 pb-2 pr-4 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="text-gray-300 py-2 pr-4 truncate max-w-24">{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 5 && <p className="text-gray-600 text-xs mt-2">...and {rows.length - 5} more rows</p>}
              </div>

              {progress && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Uploading...</span>
                    <span>{progress.done}/{progress.total}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(progress.done / progress.total) * 100}%` }} />
                  </div>
                </div>
              )}

              {results.length > 0 && (
                <div className="space-y-1 mb-4 max-h-40 overflow-y-auto">
                  {results.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {r.ok
                        ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                        : <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      }
                      <span className={r.ok ? 'text-gray-300' : 'text-red-400'}>{r.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={handleUploadAll}
                disabled={!!progress && progress.done < progress.total}
                className="bg-green-500 hover:bg-green-400 text-black font-bold w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload All {rows.length} Products
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
