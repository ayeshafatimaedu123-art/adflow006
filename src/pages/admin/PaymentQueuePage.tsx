import { useEffect, useState } from 'react';
import { ExternalLink, CheckCircle, XCircle, DollarSign, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Payment } from '../../types';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatsCard from '../../components/common/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function PaymentQueuePage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');
  const [publishSuccess, setPublishSuccess] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    let query = supabase.from('payments').select(`
      *, ads(title, status), users!payments_user_id_fkey(name, email)
    `).order('created_at', { ascending: true });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setPayments(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, [filter]);

  const handleVerify = async (approve: boolean) => {
    if (!selected || !user) return;
    if (!approve && !rejectionReason.trim()) return;
    setActionLoading(true);

    await supabase.from('payments').update({
      status: approve ? 'verified' : 'rejected',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
      rejection_reason: approve ? '' : rejectionReason,
    }).eq('id', selected.id);

    const adTitle = (selected.ads as { title?: string })?.title ?? '';

    if (approve) {
      await supabase.from('ads').update({ status: 'payment_verified' }).eq('id', selected.ad_id);
      await supabase.from('ad_status_history').insert({
        ad_id: selected.ad_id,
        previous_status: 'payment_submitted',
        new_status: 'payment_verified',
        changed_by: user.id,
        note: 'Payment verified by admin',
      });
      await supabase.from('notifications').insert({
        user_id: selected.user_id,
        title: 'Payment Verified!',
        message: `Your payment for "${adTitle}" has been verified. Your ad will be published shortly.`,
        type: 'success',
      });
    } else {
      await supabase.from('ads').update({ status: 'payment_pending' }).eq('id', selected.ad_id);
      await supabase.from('notifications').insert({
        user_id: selected.user_id,
        title: 'Payment Rejected',
        message: `Your payment for "${adTitle}" was rejected. Reason: ${rejectionReason}. Please re-submit.`,
        type: 'error',
      });
    }

    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action_type: approve ? 'payment_verified' : 'payment_rejected',
      target_type: 'payment',
      target_id: selected.id,
    });

    setSelected(null);
    setRejectionReason('');
    await fetchPayments();
    setActionLoading(false);
  };

  const handlePublish = async (adId: string) => {
    if (!user) return;
    setActionLoading(true);

    const { data: adData } = await supabase
      .from('ads')
      .select('package_id, packages(duration_days), title')
      .eq('id', adId)
      .maybeSingle();

    const durationDays = (adData?.packages as { duration_days?: number })?.duration_days ?? 30;
    const now = new Date();
    const expireAt = new Date(now);
    expireAt.setDate(expireAt.getDate() + durationDays);

    await supabase.from('ads').update({
      status: 'published',
      publish_at: now.toISOString(),
      expire_at: expireAt.toISOString(),
    }).eq('id', adId);

    await supabase.from('ad_status_history').insert({
      ad_id: adId,
      previous_status: 'payment_verified',
      new_status: 'published',
      changed_by: user.id,
      note: 'Published by admin',
    });

    // Notify client
    const payment = payments.find(p => p.ad_id === adId);
    if (payment) {
      await supabase.from('notifications').insert({
        user_id: payment.user_id,
        title: 'Ad Published!',
        message: `Your ad "${adData?.title}" is now live. It will expire in ${durationDays} days.`,
        type: 'success',
      });
    }

    setPublishSuccess(adId);
    setTimeout(() => setPublishSuccess(''), 3000);
    setSelected(null);
    await fetchPayments();
    setActionLoading(false);
  };

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const verifiedCount = payments.filter(p => p.status === 'verified').length;
  const totalRevenue = payments.filter(p => p.status === 'verified').reduce((s, p) => s + p.amount, 0);

  return (
    <DashboardLayout title="Payment Queue">
      <div className="space-y-6">

        {publishSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Ad has been published successfully!
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <StatsCard label="Pending Verification" value={pendingCount} icon={<Clock className="w-5 h-5" />} color="amber" />
          <StatsCard label="Verified" value={verifiedCount} icon={<CheckCircle className="w-5 h-5" />} color="green" />
          <StatsCard label="Total Revenue" value={`PKR ${totalRevenue.toLocaleString()}`} icon={<DollarSign className="w-5 h-5" />} color="blue" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['pending', 'verified', 'rejected', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Payment Records ({payments.length})</h3>
            </div>
            {loading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : payments.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No payments found</div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
                {payments.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelected(p); setRejectionReason(''); }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition ${
                      selected?.id === p.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {(p.ads as { title?: string })?.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        PKR {p.amount.toLocaleString()} • {p.sender_name} • {p.method.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`ml-3 text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
                      p.status === 'verified' ? 'bg-green-100 text-green-700' :
                      p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {!selected ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <DollarSign className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-sm">Select a payment to review</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <h3 className="font-semibold text-gray-900">Payment Details</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Ad</dt>
                    <dd className="font-medium truncate ml-4">{(selected.ads as { title?: string })?.title}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Client</dt>
                    <dd className="font-medium">{(selected.users as { name?: string })?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Amount</dt>
                    <dd className="font-bold text-green-700">PKR {selected.amount.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Method</dt>
                    <dd className="font-medium capitalize">{selected.method.replace('_', ' ')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">TXN Ref</dt>
                    <dd className="font-mono text-xs font-medium">{selected.transaction_ref}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Sender</dt>
                    <dd className="font-medium">{selected.sender_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Submitted</dt>
                    <dd className="text-gray-600">{new Date(selected.created_at).toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Ad Status</dt>
                    <dd>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                        {(selected.ads as { status?: string })?.status}
                      </span>
                    </dd>
                  </div>
                </dl>

                {selected.screenshot_url && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Payment Screenshot</p>
                    <a
                      href={selected.screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Screenshot
                    </a>
                  </div>
                )}

                {selected.notes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Client Notes</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selected.notes}</p>
                  </div>
                )}

                {/* Pending — Verify or Reject */}
                {selected.status === 'pending' && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Rejection Reason (required to reject)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        rows={2}
                        placeholder="e.g., Invalid TXN reference, amount mismatch..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(true)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {actionLoading ? 'Processing...' : 'Verify & Approve'}
                      </button>
                      <button
                        onClick={() => handleVerify(false)}
                        disabled={actionLoading || !rejectionReason.trim()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-xl text-sm font-medium transition"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </>
                )}

                {/* Verified — Publish Ad */}
                {selected.status === 'verified' &&
                  (selected.ads as { status?: string })?.status === 'payment_verified' && (
                  <button
                    onClick={() => handlePublish(selected.ad_id)}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition"
                  >
                    {actionLoading ? 'Publishing...' : 'Publish Ad Now'}
                  </button>
                )}

                {selected.status === 'rejected' && selected.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-600">{selected.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}