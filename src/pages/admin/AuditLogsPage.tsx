import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Activity, Clock } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('audit_logs')
      .select('*, users(name)')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setLogs(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout title="System Audit Logs">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Recent Activity (Last 50)</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    <span className="text-blue-600">{log.users?.name || 'System'}</span> performed <span className="bg-gray-100 px-1.5 rounded">{log.action_type}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Target: {log.target_type} ({log.target_id})
                  </p>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
