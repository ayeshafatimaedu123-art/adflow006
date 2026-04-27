import { useState, useEffect } from 'react';
import { useParams, Link } from '../../lib/router';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Clock, ArrowLeft } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function AdStatusHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const [history, setHistory] = useState<any[]>([]);
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('ads').select('title, status').eq('id', id).single(),
      supabase.from('ad_status_history').select('*, users(name)').eq('ad_id', id).order('changed_at', { ascending: false })
    ]).then(([adRes, histRes]) => {
      setAd(adRes.data);
      setHistory(histRes.data ?? []);
      setLoading(false);
    });
  }, [id]);

  return (
    <DashboardLayout title="Ad Timeline">
      <div className="mb-4">
        <Link to="/dashboard/my-ads" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to My Ads
        </Link>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900">{ad?.title || 'Loading...'}</h3>
            <p className="text-xs text-gray-500 mt-1">Status History Timeline</p>
          </div>
          {ad && <StatusBadge status={ad.status} />}
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No history found for this ad.</div>
        ) : (
          <div className="p-6">
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
              {history.map((item, index) => (
                <div key={item.id} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.new_status} />
                        <span className="text-xs text-gray-400">was {item.previous_status || 'none'}</span>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.changed_at).toLocaleString()}
                      </div>
                    </div>
                    {item.note && <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded-lg border border-gray-200">{item.note}</p>}
                    <p className="text-xs text-gray-500 mt-2">Changed by: {item.users?.name || 'System'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
