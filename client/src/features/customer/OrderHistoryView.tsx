import React, { useState, useEffect } from 'react';
import {
  Package,
  CheckCircle2,
  Receipt,
  Star,
  ArrowLeft,
  Bike,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { InvoiceView } from './InvoiceView';
import { ReviewModal } from '../../components/customer/ReviewModal';
import { LiveTrackingModal } from './LiveTrackingModal';
import { formatPKR } from '../../utils/currency';

interface OrderHistoryViewProps {
  onBackToDiscovery: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  onBackToDiscovery,
}) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'delivered'>('all');

  // Selected Order for Invoice View
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Selected Order for Review
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Selected Order for Live GPS Tracking
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'active') {
      return ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status);
    }
    if (activeFilter === 'delivered') {
      return order.status === 'delivered';
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'placed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Order Placed
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Confirmed by Kitchen
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Chef Preparing Meal
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Bike className="w-3.5 h-3.5 animate-pulse" /> Out for Delivery
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToDiscovery}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Order History & Tracking
            </h1>
            <p className="text-xs text-slate-400">
              Review live order tracking, download itemized tax invoices, and rate your dishes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(['all', 'active', 'delivered'] as const).map((filter) => {
          const isSelected = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {filter === 'all' ? 'All Orders' : filter}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-36 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-3">
          <Package className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't placed any orders matching this filter yet. Explore restaurants and place your first order!
          </p>
          <button
            type="button"
            onClick={onBackToDiscovery}
            className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition"
          >
            Browse Gourmet Menus
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id || order.orderNumber}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition shadow-lg space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {order.restaurantName}
                    </h3>
                    <span className="font-mono text-xs font-semibold text-slate-400">
                      #{order.orderNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{new Date(order.createdAt || Date.now()).toLocaleString()}</span>
                    <span>•</span>
                    <span className="capitalize font-mono">
                      Payment: {order.payment?.method?.toUpperCase()}{' '}
                      {order.payment?.transactionRef ? `(${order.payment.transactionRef})` : ''}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    {formatPKR(order.pricing?.total)}
                  </span>
                </div>
              </div>

              {/* Items Summary & Delivery Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    Ordered Dishes:
                  </span>
                  <div className="space-y-1">
                    {(order.items || []).map((item: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-slate-200">
                          {item.quantity}x {item.name}{' '}
                          {item.size ? `(${item.size.name})` : ''}
                        </span>
                        <span className="font-mono text-slate-400">
                          {formatPKR(item.itemTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-0.5">
                      Delivery Drop-off:
                    </span>
                    <p className="text-slate-300 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>
                        {order.deliveryAddress?.street}, {order.deliveryAddress?.areaOrLandmark}, {order.deliveryAddress?.city}
                      </span>
                    </p>
                  </div>

                  {order.timeline && order.timeline.length > 0 && (
                    <p className="text-[11px] text-emerald-400 font-medium truncate pt-1 border-t border-slate-800/80">
                      Latest Update: {order.timeline[order.timeline.length - 1].note}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-mono">
                  Recipient: {order.customerName} ({order.customerPhone})
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Live GPS Tracking Button */}
                  {['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status) && (
                    <button
                      type="button"
                      onClick={() => {
                        setTrackingOrder(order);
                        setIsTrackingOpen(true);
                      }}
                      className="flex-1 sm:flex-initial justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition shadow-sm animate-pulse"
                    >
                      <Bike className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Track Rider GPS</span>
                    </button>
                  )}

                  {/* Review Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setReviewOrder(order);
                      setIsReviewOpen(true);
                    }}
                    className="flex-1 sm:flex-initial justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/20 text-xs font-bold transition"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Rate Meal</span>
                  </button>

                  {/* Printable Invoice Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceOrder(order);
                      setIsInvoiceOpen(true);
                    }}
                    className="flex-1 sm:flex-initial justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tax Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceView
        order={invoiceOrder}
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setInvoiceOrder(null);
        }}
      />

      {/* Live GPS Delivery Tracking Modal */}
      <LiveTrackingModal
        order={trackingOrder}
        isOpen={isTrackingOpen}
        onClose={() => {
          setIsTrackingOpen(false);
          setTrackingOrder(null);
        }}
      />

      {/* Review Modal */}
      {reviewOrder && (
        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => {
            setIsReviewOpen(false);
            setReviewOrder(null);
          }}
          restaurantId={reviewOrder.restaurantId}
          restaurantName={reviewOrder.restaurantName}
          dishName={reviewOrder.items?.[0]?.name}
          menuItemId={reviewOrder.items?.[0]?.menuItemId}
          onReviewSubmitted={() => fetchOrders()}
        />
      )}
    </div>
  );
};
