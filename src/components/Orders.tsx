import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, RefreshCw, X, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSeller } from '../contexts/SellerContext';
import { getOrders } from '../services';
import type { Order } from '../types';
import Header from './Header';
import OrdersTable from './OrdersTable';
import { LoadingSpinner } from './LoadingSpinner';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'eligible', label: 'Eligible' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending_eligibility', label: 'Pending' },
  { value: 'held', label: 'Held' },
];

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, string> = {
    eligible: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    paid: 'bg-gray-100 text-gray-600 border-gray-200',
    pending_eligibility: 'bg-amber-50 text-amber-700 border-amber-200',
    held: 'bg-red-50 text-red-700 border-red-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  const cls = configs[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

function OrderDetailPanel({ order, onBack }: { order: Order; onBack: () => void }) {
  const commissionPct = order.commissionPercentage > 1
    ? order.commissionPercentage
    : order.commissionPercentage * 100;

  // Discount: combine Make An Offer + Discount fields
  const discountAmt = (order.discount || 0) + (order.makeAnOffer || 0);
  const hasDiscount = discountAmt > 0;
  // Total Base Price = Vendor Base Price minus any discount (what commission is applied to)
  const totalBasePrice = order.originalFinalBase - discountAmt;

  // Shipping: show row when charged to vendor
  const hasShipping = order.vendorShippingCost > 0;

  // Optional deductions
  const hasRefund = order.supplierRefund > 0;
  const hasCancellation = order.cancellationFee > 0;

  // ── Build breakdown rows ───────────────────────────────────────────────────
  type Row = { label: string; value: string; highlight?: boolean; negative?: boolean; subtotal?: boolean };

  const rows: Row[] = [
    // 1. Vendor Base Price (always first)
    { label: 'Vendor Base Price', value: `£${order.originalFinalBase.toFixed(2)}` },

    // 2. Discount row — only when a discount / Make An Offer was applied (Scenario 2 & 3)
    ...(hasDiscount
      ? [
          { label: 'Make An Offer / Discount', value: `-£${discountAmt.toFixed(2)}`, negative: true },
          // Subtotal after discount, before commission
          { label: 'Total Base Price', value: `£${totalBasePrice.toFixed(2)}`, subtotal: true },
        ]
      : []),

    // 3. Fleek Commission — applied to Total Base Price (or Vendor Base if no discount)
    { label: `Fleek Commission (${commissionPct.toFixed(0)}%)`, value: `-£${order.originalCommission.toFixed(2)}`, negative: true },

    // 4. Shipping Chargeable to Vendor — only when shipping is charged (Scenarios 1–3 with shipping)
    ...(hasShipping
      ? [{ label: 'Shipping Inclusive', value: `-£${order.vendorShippingCost.toFixed(2)}`, negative: true }]
      : []),

    // 5. Refund — only when a refund was processed (Scenario 3)
    ...(hasRefund
      ? [{ label: 'Refund', value: `-£${order.supplierRefund.toFixed(2)}`, negative: true }]
      : []),

    // 6. Cancellation Fee — only when applicable
    ...(hasCancellation
      ? [{ label: 'Cancellation Fee', value: `-£${order.cancellationFee.toFixed(2)}`, negative: true }]
      : []),

    // 7. Balance — always last, highlighted
    { label: 'Balance', value: `£${order.totalPaidAmount.toFixed(2)}`, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sellerId={order.vendor} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-fleek-black mb-6 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </button>

        {/* Header card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">
                {order.internalOrderId}
              </p>
              <h1 className="text-xl font-bold text-fleek-black mb-3">{order.productName}</h1>
              <StatusBadge status={order.latestStatus} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-fleek-black">£{order.totalPaidAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">Balance</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-bold text-fleek-black uppercase tracking-wide mb-4">Key Dates</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Order Created</p>
              <p className="font-semibold text-fleek-black">{formatDate(order.createdAt)}</p>
            </div>
            {order.completedAt && order.completedAt !== order.createdAt && (
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Payment Date</p>
                <p className="font-semibold text-fleek-black">{formatDate(order.completedAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-fleek-black uppercase tracking-wide">Payout Breakdown</h2>
          </div>
          <table className="w-full">
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-50 last:border-0 ${
                    row.highlight
                      ? 'bg-fleek-yellow-light'
                      : row.subtotal
                        ? 'bg-gray-50'
                        : ''
                  }`}
                >
                  <td className={`px-6 py-3 text-sm ${
                    row.highlight
                      ? 'font-bold text-fleek-black'
                      : row.subtotal
                        ? 'font-semibold text-fleek-black'
                        : 'text-gray-600'
                  }`}>
                    {row.label}
                  </td>
                  <td className={`px-6 py-3 text-sm text-right ${
                    row.highlight
                      ? 'font-bold text-fleek-black'
                      : row.subtotal
                        ? 'font-semibold text-fleek-black'
                        : row.negative
                          ? 'text-red-600 font-medium'
                          : 'font-medium text-fleek-black'
                  }`}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order IDs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-fleek-black uppercase tracking-wide mb-4">Order Reference</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Order Line ID</p>
              <p className="font-mono font-medium text-fleek-black text-xs">{order.orderId}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Internal Order ID</p>
              <p className="font-mono font-medium text-fleek-black text-xs">{order.internalOrderId}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { sellerId, vendorHandle, loading: sellerLoading } = useSeller();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (!sellerLoading && (sellerId || vendorHandle)) {
      loadOrders();
    }
  }, [sellerId, vendorHandle, sellerLoading]);

  async function loadOrders() {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrders(sellerId || vendorHandle || '');
      setAllOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  // Client-side filtering — no reload on search/filter change
  const filteredOrders = useMemo(() => {
    let result = allOrders;
    if (statusFilter !== 'all') {
      result = result.filter(o => (o.latestStatus || o.status) === statusFilter);
    }
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      result = result.filter(o =>
        String(o.orderNumber || '').includes(s) ||
        o.internalOrderId.toLowerCase().includes(s) ||
        o.productName.toLowerCase().includes(s)
      );
    }
    return result;
  }, [allOrders, statusFilter, searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const eligibleCount = allOrders.filter(o => (o.latestStatus || o.status) === 'eligible').length;
  const totalValue = allOrders.reduce((sum, o) => sum + (o.totalPaidAmount || 0), 0);

  if (sellerLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header sellerId={sellerId || vendorHandle || ''} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadOrders}
              className="inline-flex items-center gap-2 px-4 py-2 bg-fleek-yellow text-fleek-black font-bold rounded-lg hover:bg-fleek-yellow-dark transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return <OrderDetailPanel order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sellerId={sellerId || vendorHandle || ''} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-fleek-black mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-fleek-black tracking-tight mb-1">Orders</h1>
          <p className="text-gray-500 text-sm">Track and manage your order payouts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Orders</p>
            <p className="text-3xl font-extrabold text-fleek-black">{allOrders.length.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Eligible for Payout</p>
            <p className="text-3xl font-extrabold text-emerald-600">{eligibleCount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Value</p>
            <p className="text-3xl font-extrabold text-fleek-black">£{totalValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Search + Status Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-9 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-fleek-yellow transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                    statusFilter === opt.value
                      ? 'bg-fleek-black text-white border-fleek-black'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-fleek-black hover:text-fleek-black'
                  }`}
                >
                  {opt.label}
                  {opt.value !== 'all' && (
                    <span className="ml-1.5 text-xs opacity-70">
                      {allOrders.filter(o => (o.latestStatus || o.status) === opt.value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active filter indicator */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <span>Showing {filteredOrders.length} of {allOrders.length} orders</span>
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                className="text-fleek-black font-semibold underline underline-offset-2 hover:text-gray-600"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <OrdersTable
            orders={pagedOrders}
            onOrderClick={(orderId) => {
              const order = allOrders.find(o => o.orderId === orderId || o.internalOrderId === orderId);
              if (order) setSelectedOrder(order);
            }}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {currentPage} of {totalPages} ({filteredOrders.length} orders)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border-2 border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:border-fleek-black transition"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-sm font-bold rounded-lg border-2 transition ${
                        currentPage === page
                          ? 'bg-fleek-yellow border-fleek-yellow text-fleek-black'
                          : 'border-gray-200 text-gray-600 hover:border-fleek-black'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border-2 border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:border-fleek-black transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Orders;
