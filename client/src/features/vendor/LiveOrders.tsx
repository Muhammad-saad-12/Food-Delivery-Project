import React, { useState, useEffect } from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Clock,
  Bike,
  CheckCircle2,
  ChefHat,
  Phone,
  MapPin,
  Flame,
  DollarSign,
  TrendingUp,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { formatPKR } from '../../utils/currency';

interface LiveOrdersProps {
  restaurantId: string;
  restaurantName: string;
}

export const LiveOrders: React.FC<LiveOrdersProps> = ({
  restaurantId,
  restaurantName,
}) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Audio chime generator using Web Audio API (no external mp3 files needed)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.3); // D6

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.85);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Setup Socket.IO real-time listener for incoming orders
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('join_room', 'kitchen');

    const handleNewOrder = (order: any) => {
      setOrders((prev) => [order, ...prev.filter((o) => o._id !== order._id && o.orderNumber !== order.orderNumber)]);
      setNewOrderAlert(order);
      playChime();
    };

    const handleStatusUpdate = (update: any) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.orderNumber === update.orderNumber
            ? { ...o, status: update.status, timeline: update.timeline || o.timeline }
            : o
        )
      );
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_update', handleStatusUpdate);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_update', handleStatusUpdate);
    };
  }, [restaurantId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch vendor orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await api.patch(`/orders/${orderId}/status`, {
        status: nextStatus,
      });

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId || o.orderNumber === orderId ? res.data.order : o))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
  const activeCount = orders.filter((o) =>
    ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status)
  ).length;
  const completedCount = orders.filter((o) => o.status === 'delivered').length;

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') {
      return ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status);
    }
    return o.status === filterStatus;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Live Audio / Visual Alert Banner */}
      {newOrderAlert && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500 text-white flex items-center justify-between shadow-xl shadow-emerald-500/20 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-slate-950">
              <Bell className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold flex items-center gap-2">
                New Order Received! #{newOrderAlert.orderNumber}
              </h4>
              <p className="text-xs text-slate-300">
                {newOrderAlert.customerName} ordered {newOrderAlert.items?.length || 1} dishes ({formatPKR(newOrderAlert.pricing?.total)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleUpdateStatus(newOrderAlert._id || newOrderAlert.orderNumber, 'confirmed');
                setNewOrderAlert(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
            >
              Accept & Start
            </button>
            <button
              type="button"
              onClick={() => setNewOrderAlert(null)}
              className="text-slate-400 hover:text-white p-1 text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Operational Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Kitchen Live Operations
            </h1>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {restaurantName} • Real-Time Order Stream & Kitchen Pipeline
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              soundEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle audio alert chime on incoming orders"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Chime Active' : 'Muted'}</span>
          </button>

          <button
            type="button"
            onClick={fetchOrders}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Real-Time Operational KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Today's Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-white font-mono">
            {formatPKR(totalRevenue)}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live Gross Volume
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active in Kitchen</span>
            <ChefHat className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-white font-mono">{activeCount}</p>
          <span className="text-[10px] text-amber-400 font-semibold">
            Cooking / In Transit
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-black text-white font-mono">{orders.length}</p>
          <span className="text-[10px] text-slate-400">
            {completedCount} Delivered
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg. Prep Time</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl font-black text-white font-mono">18 mins</p>
          <span className="text-[10px] text-teal-400 font-semibold">
            On Target Speed
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto custom-scrollbar">
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'active', label: 'Active Pipeline' },
          { id: 'placed', label: 'New (Pending Acceptance)' },
          { id: 'confirmed', label: 'Confirmed' },
          { id: 'preparing', label: 'In Kitchen Cooking' },
          { id: 'out_for_delivery', label: 'Out with Rider' },
          { id: 'delivered', label: 'Delivered' },
        ].map((tab) => {
          const isSelected = filterStatus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders Pipeline Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-3">
          <ChefHat className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Orders in this Status</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All kitchen queues are currently clear. Incoming orders from customer checkout will stream here in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isUpdating = updatingId === order._id || updatingId === order.orderNumber;
            return (
              <div
                key={order._id || order.orderNumber}
                className={`bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition shadow-lg ${
                  order.status === 'placed'
                    ? 'border-amber-500/60 shadow-amber-500/10'
                    : order.status === 'preparing'
                    ? 'border-purple-500/60 shadow-purple-500/10'
                    : 'border-slate-800'
                }`}
              >
                {/* Order Top Bar */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-white">
                        #{order.orderNumber}
                      </span>
                      {order.status === 'placed' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 animate-pulse">
                          ACTION REQUIRED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{new Date(order.createdAt || Date.now()).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-semibold">{order.customerName}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-400 font-mono block">
                      {formatPKR(order.pricing?.total)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {order.payment?.method?.toUpperCase()} [
                      {order.payment?.status === 'paid' ? 'PAID' : 'COD'}]
                    </span>
                  </div>
                </div>

                {/* Ordered Items with Kitchen Details */}
                <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    Kitchen Prep List:
                  </span>
                  <div className="space-y-2">
                    {(order.items || []).map((item: any, i: number) => (
                      <div
                        key={i}
                        className="text-xs text-slate-200 border-b border-slate-900/80 last:border-0 pb-1.5 last:pb-0"
                      >
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-mono text-slate-400">
                            {formatPKR(item.itemTotal)}
                          </span>
                        </div>

                        {/* Customization Details */}
                        <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                          {item.size && (
                            <span>
                              Size: <strong className="text-slate-200">{item.size.name}</strong>
                            </span>
                          )}
                          {item.spiceLevel && (
                            <span className="text-orange-400 flex items-center gap-0.5">
                              <Flame className="w-3 h-3" />
                              {item.spiceLevel}
                            </span>
                          )}
                          {item.selectedAddOns?.length > 0 && (
                            <span className="text-emerald-400">
                              + {item.selectedAddOns.map((a: any) => a.name).join(', ')}
                            </span>
                          )}
                        </div>

                        {item.specialInstructions && (
                          <p className="text-[11px] text-amber-300/90 italic bg-amber-500/10 px-2 py-0.5 rounded mt-1 border border-amber-500/20">
                            Note: "{item.specialInstructions}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Contact & Delivery Drop-off */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-mono truncate">{order.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">
                      {order.deliveryAddress?.areaOrLandmark || order.deliveryAddress?.street}
                    </span>
                  </div>
                </div>

                {/* Workflow Status Action Progression */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-slate-500">Status: </span>
                    <strong className="text-white capitalize">{order.status.replace(/_/g, ' ')}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'placed' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleUpdateStatus(order._id || order.orderNumber, 'confirmed')
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
                      >
                        Accept & Confirm
                      </button>
                    )}

                    {order.status === 'confirmed' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleUpdateStatus(order._id || order.orderNumber, 'preparing')
                        }
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition shadow-md shadow-purple-500/20"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        Start Cooking
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleUpdateStatus(order._id || order.orderNumber, 'out_for_delivery')
                        }
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-md shadow-teal-500/20"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        Handover to Rider
                      </button>
                    )}

                    {order.status === 'out_for_delivery' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleUpdateStatus(order._id || order.orderNumber, 'delivered')
                        }
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirm Delivered
                      </button>
                    )}

                    {order.status === 'delivered' && (
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <PackageCheck className="w-4 h-4" /> Order Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
