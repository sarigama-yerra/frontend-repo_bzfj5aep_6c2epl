import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, LineChart, Trash2 } from 'lucide-react'
import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [datasets, setDatasets] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', description: '', color: '#60a5fa' })
  const [point, setPoint] = useState({ label: '', value: '' })
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/datasets`)
        const data = await res.json()
        setDatasets(data)
        if (!activeId && data[0]) setActiveId(data[0].id)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [refresh])

  const activeDataset = useMemo(
    () => datasets.find((d) => d.id === activeId) || null,
    [datasets, activeId]
  )

  const [points, setPoints] = useState([])
  useEffect(() => {
    const loadPoints = async () => {
      if (!activeId) return
      try {
        const res = await fetch(`${API_BASE}/datasets/${activeId}/points`)
        const data = await res.json()
        setPoints(data)
      } catch (e) {
        console.error(e)
      }
    }
    loadPoints()
  }, [activeId, refresh])

  const chartData = useMemo(() => {
    return points.map((p) => ({ name: p.label, value: Number(p.value) }))
  }, [points])

  const createDataset = async (e) => {
    e.preventDefault()
    if (!form.title) return
    await fetch(`${API_BASE}/datasets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ title: '', description: '', color: '#60a5fa' })
    setRefresh((x) => x + 1)
  }

  const addPoint = async (e) => {
    e.preventDefault()
    if (!activeId || !point.label || point.value === '') return
    await fetch(`${API_BASE}/datasets/${activeId}/points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: point.label, value: Number(point.value) }),
    })
    setPoint({ label: '', value: '' })
    setRefresh((x) => x + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(600px_circle_at_0%_0%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(600px_circle_at_100%_0%,rgba(168,85,247,0.12),transparent_40%),radial-gradient(700px_circle_at_100%_100%,rgba(34,197,94,0.1),transparent_40%)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <LineChart className="text-blue-300" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Statistik</h1>
              <p className="text-sm text-blue-200/70">Créez des courbes pour n'importe quel sujet</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-1 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Nouveau dataset</h2>
            <form onSubmit={createDataset} className="space-y-3">
              <input
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Titre"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <input
                className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description (optionnel)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  className="h-10 w-16 rounded-lg bg-white/10 border border-white/10"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus size={18} /> Créer
                </button>
              </div>
            </form>

            <div className="h-px my-6 bg-white/10" />

            <h3 className="text-sm uppercase tracking-wider text-white/60 mb-3">Vos datasets</h3>
            <div className="space-y-2 max-h-72 overflow-auto pr-1">
              {loading && <p className="text-white/60 text-sm">Chargement...</p>}
              {!loading && datasets.length === 0 && (
                <p className="text-white/60 text-sm">Aucun dataset pour l'instant</p>
              )}
              {datasets.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveId(d.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg border ${
                    d.id === activeId ? 'border-blue-400 bg-blue-500/10' : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{d.title}</p>
                      {d.description && (
                        <p className="text-xs text-white/60 line-clamp-1">{d.description}</p>
                      )}
                    </div>
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: d.color || '#60a5fa' }}
                    />
                  </div>
                </button>
              ))}
            </div>

            {activeDataset && (
              <form onSubmit={addPoint} className="mt-6 space-y-3">
                <h2 className="text-lg font-semibold">Ajouter un point</h2>
                <input
                  className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Label (ex: Janvier)"
                  value={point.label}
                  onChange={(e) => setPoint((p) => ({ ...p, label: e.target.value }))}
                />
                <input
                  type="number"
                  step="any"
                  className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Valeur (ex: 42.5)"
                  value={point.value}
                  onChange={(e) => setPoint((p) => ({ ...p, value: e.target.value }))}
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus size={18} /> Ajouter
                </button>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="lg:col-span-2 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">{activeDataset ? activeDataset.title : 'Aucun dataset sélectionné'}</h2>
                {activeDataset?.description && (
                  <p className="text-white/70 text-sm">{activeDataset.description}</p>
                )}
              </div>
            </div>

            <div className="h-96">
              {activeDataset ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RLineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                    <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke={activeDataset?.color || '#60a5fa'} strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} />
                  </RLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/60">
                  Sélectionnez ou créez un dataset pour commencer
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default App
