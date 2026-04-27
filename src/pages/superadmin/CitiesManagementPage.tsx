import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { City } from '../../types';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Plus, Edit2, Check, X } from 'lucide-react';

export default function CitiesManagementPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    const { data } = await supabase.from('cities').select('*').order('name');
    if (data) setCities(data);
    setLoading(false);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await supabase.from('cities').update({ is_active: !current }).eq('id', id);
    fetchCities();
  };

  return (
    <DashboardLayout title="Cities Management">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">All Cities</h3>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cities.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.state}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <button onClick={() => handleToggleActive(c.id, c.is_active)} className="p-1 text-gray-400 hover:text-blue-600">
                      {c.is_active ? <X className="w-4 h-4 text-red-500" title="Deactivate" /> : <Check className="w-4 h-4 text-green-500" title="Activate" />}
                    </button>
                    <button className="p-1 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
