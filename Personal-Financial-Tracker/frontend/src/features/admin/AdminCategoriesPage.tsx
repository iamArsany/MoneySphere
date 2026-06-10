import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store'
import { api } from '../../services/api'
import { Plus, Pencil, Trash2, X, Shield } from 'lucide-react'

interface Category {
  id: string
  nameEn: string
  nameAr: string
  type: 'income' | 'expense' | 'system'
  icon: string
  color: string
  isSystem: boolean
  isActive: boolean
}

const PRESET_COLORS = [
  '#EF4444','#F97316','#EAB308','#22C55E','#14B8A6','#3B82F6',
  '#8B5CF6','#EC4899','#10B981','#84CC16','#005c55','#64748B'
]

function AdminCategoriesPage() {
  const language = useSelector(selectLanguage)
  const isAr = language === 'ar'

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [form, setForm] = useState({
    nameEn: '', nameAr: '', type: 'expense' as Category['type'],
    icon: 'tag', color: '#3B82F6'
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await api.get('/categories')
      setCategories(res.data.categories || [])
    } catch {
      console.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const openAdd = () => {
    setEditTarget(null)
    setForm({ nameEn: '', nameAr: '', type: 'expense', icon: 'tag', color: '#3B82F6' })
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (cat: Category) => {
    setEditTarget(cat)
    setForm({ nameEn: cat.nameEn, nameAr: cat.nameAr, type: cat.type, icon: cat.icon, color: cat.color })
    setFormError(null)
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nameEn.trim()) { setFormError(isAr ? 'الاسم الإنجليزي مطلوب' : 'English name is required'); return }
    setSaving(true); setFormError(null)
    try {
      if (editTarget) {
        await api.patch(`/categories/${editTarget.id}`, form)
      } else {
        await api.post('/categories', { ...form, isSystem: false, isActive: true })
      }
      setShowModal(false)
      fetchCategories()
    } catch (err: any) {
      setFormError(err?.response?.data?.error?.message || (isAr ? 'فشل الحفظ' : 'Failed to save'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat: Category) => {
    if (cat.isSystem) { alert(isAr ? 'لا يمكن حذف الفئات الافتراضية' : 'System categories cannot be deleted'); return }
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذه الفئة؟' : 'Delete this category?')) return
    try {
      await api.delete(`/categories/${cat.id}`)
      fetchCategories()
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to delete')
    }
  }

  const handleToggleActive = async (cat: Category) => {
    try { await api.patch(`/categories/${cat.id}`, { isActive: !cat.isActive }); fetchCategories() }
    catch { console.error('Toggle failed') }
  }

  const typeLabel = (t: string) => t === 'income' ? (isAr ? 'دخل' : 'Income') : t === 'expense' ? (isAr ? 'مصروف' : 'Expense') : (isAr ? 'نظام' : 'System')
  const typeBadgeClass = (t: string) => t === 'income' ? 'bg-emerald-100 text-emerald-800' : t === 'expense' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'

  if (loading) return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#005c55] border-t-transparent" />
    </div>
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0b1c30]">
                {editTarget ? (isAr ? 'تعديل الفئة' : 'Edit Category') : (isAr ? 'إضافة فئة' : 'Add Category')}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="rounded p-1 hover:bg-[#e5eeff]">
                <X className="h-5 w-5 text-[#3e4947]" />
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-[#3e4947]">{isAr ? 'الاسم (إنجليزي)' : 'Name (English)'} *</span>
                <input type="text" required value={form.nameEn}
                  onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
                  className="rounded-lg border border-[#bdc9c6] px-3 py-2.5 text-sm outline-none focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55]" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-[#3e4947]">{isAr ? 'الاسم (عربي)' : 'Name (Arabic)'}</span>
                <input type="text" value={form.nameAr}
                  onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
                  className="rounded-lg border border-[#bdc9c6] px-3 py-2.5 text-sm outline-none focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55]" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-[#3e4947]">{isAr ? 'النوع' : 'Type'}</span>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Category['type'] }))}
                  className="rounded-lg border border-[#bdc9c6] px-3 py-2.5 text-sm outline-none focus:border-[#005c55]">
                  <option value="expense">{isAr ? 'مصروف' : 'Expense'}</option>
                  <option value="income">{isAr ? 'دخل' : 'Income'}</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-[#3e4947]">{isAr ? 'اللون' : 'Color'}</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${form.color === c ? 'border-[#0b1c30] scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase text-[#3e4947]">{isAr ? 'الأيقونة' : 'Icon'}</span>
                <input type="text" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="e.g. wallet, tag, home, coffee"
                  className="rounded-lg border border-[#bdc9c6] px-3 py-2.5 text-sm outline-none focus:border-[#005c55] focus:ring-1 focus:ring-[#005c55]" />
              </label>
              {formError && <p className="rounded-lg bg-[#ffdad6] px-3 py-2 text-sm text-[#ba1a1a]">{formError}</p>}
              <div className="mt-1 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-[#bdc9c6] py-2.5 text-sm font-semibold text-[#3e4947] hover:bg-[#f8f9ff] transition">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-lg bg-[#005c55] py-2.5 text-sm font-semibold text-white hover:bg-[#004943] disabled:opacity-60 transition">
                  {saving ? '...' : (isAr ? 'حفظ' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1c30]">{isAr ? 'إدارة الفئات' : 'Manage Categories'}</h1>
          <p className="mt-1 text-sm text-[#3e4947]">
            {categories.length} {isAr ? 'فئة' : 'categories'}
          </p>
        </div>
        <button type="button" onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-[#005c55] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004943]">
          <Plus className="h-4 w-4" />
          {isAr ? 'إضافة فئة' : 'Add Category'}
        </button>
      </div>

      {/* Categories table */}
      <div className="overflow-hidden rounded-xl border border-[#bdc9c6] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#bdc9c6] bg-[#f8f9ff] text-xs font-semibold uppercase tracking-wide text-[#6e7977]">
                <th className="px-4 py-3 w-12">{isAr ? 'لون' : 'Color'}</th>
                <th className="px-4 py-3">{isAr ? 'الاسم' : 'Name'}</th>
                <th className="px-4 py-3">{isAr ? 'النوع' : 'Type'}</th>
                <th className="px-4 py-3">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3">{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ff]">
              {categories.map(cat => (
                <tr key={cat.id} className="transition hover:bg-[#f8f9ff]">
                  <td className="px-4 py-3">
                    <span className="inline-block h-5 w-5 rounded-full border border-[#bdc9c6]/50 shadow-sm"
                      style={{ backgroundColor: cat.color }} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {cat.isSystem && (
                        <span title={isAr ? 'فئة نظام' : 'System category'}>
                          <Shield className="h-3.5 w-3.5 text-[#005c55]" />
                        </span>
                      )}
                      <div>
                        <p className="font-semibold text-[#0b1c30]">{cat.nameEn}</p>
                        {cat.nameAr && <p className="text-xs text-[#6e7977]">{cat.nameAr}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeBadgeClass(cat.type)}`}>
                      {typeLabel(cat.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => handleToggleActive(cat)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        cat.isActive ? 'bg-[#005c55]' : 'bg-[#bdc9c6]'
                      }`}>
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                        cat.isActive ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => openEdit(cat)}
                        className="rounded-lg p-1.5 text-[#3e4947] transition hover:bg-[#e5eeff] hover:text-[#005c55]">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {!cat.isSystem && (
                        <button type="button" onClick={() => handleDelete(cat)}
                          className="rounded-lg p-1.5 text-[#3e4947] transition hover:bg-[#ffdad6] hover:text-[#ba1a1a]">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminCategoriesPage
