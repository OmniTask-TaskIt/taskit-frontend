import { Filter, Search } from 'lucide-react';
import type { TaskCategoryOption } from '../hooks/useTaskCategories';
import type { TaskFilters as Filters } from '../types/task.types';

type Props = { filters: Filters; setFilters: (value: Filters) => void; categories: TaskCategoryOption[] };

export default function TaskFilters({ filters, setFilters, categories }: Props) {
  const update = (key: keyof Filters, value: string) => setFilters({ ...filters, [key]: value });
  return <div className="mb-5 grid gap-3 rounded-2xl bg-[#f6f7fc] p-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_0.7fr_0.7fr_auto] lg:items-center">
    <label className="relative sm:col-span-2 lg:col-span-1"><Search size={16} className="absolute left-3 top-3 text-[#8290ae]" /><input value={filters.query} onChange={(event) => update('query', event.target.value)} placeholder="Buscar por palabra clave" className="h-10 w-full rounded-xl border border-[#e0e5f3] bg-white pl-9 pr-3 text-sm outline-none" /></label>
    <select value={filters.category} onChange={(event) => update('category', event.target.value)} className="h-10 rounded-xl border border-[#e0e5f3] bg-white px-3 text-sm text-[#5b6685]"><option value="ALL">Todas las categorías</option>{categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select>
    <input value={filters.minPrice} onChange={(event) => update('minPrice', event.target.value)} type="number" min="0" placeholder="Precio mín." className="h-10 rounded-xl border border-[#e0e5f3] bg-white px-3 text-sm" />
    <input value={filters.maxPrice} onChange={(event) => update('maxPrice', event.target.value)} type="number" min="0" placeholder="Precio máx." className="h-10 rounded-xl border border-[#e0e5f3] bg-white px-3 text-sm" />
    <span className="inline-flex h-10 items-center justify-center gap-2 text-xs font-semibold text-[#263BAA]"><Filter size={15} /> Filtros activos</span>
  </div>;
}
