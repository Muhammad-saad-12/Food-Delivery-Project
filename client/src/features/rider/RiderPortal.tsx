import React, { useState, useEffect, useRef } from 'react';
import {
  Bike,
  Power,
  Navigation,
  Phone,
  Store,
  MapPin,
  CheckCircle2,
  Package,
  ArrowRight,
  RefreshCw,
  ArrowRightLeft,
  Play,
  Pause,
  ShieldCheck,
} from 'lucide-react';
import L from 'leaflet';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { fetchRoadRoute, RouteResult } from '../../services/routing';

interface RiderPortalProps {
  onSwitchToCustomer: () => void;
  onSwitchToVendor: () => void;
  onSwitchToAdmin?: () => void;
}

export const RiderPortal: React.FC<RiderPortalProps> = ({
  onSwitchToCustomer,
  onSwitchToVendor,
  onSwitchToAdmin,
}) => {
  // Rider Profile State
  const [isOnline, setIsOnline] = useState(true);
  const [riderProfile] = useState({
    id: 'rider-tariq-101',
    name: 'Tariq Mehmood',
    phone: '0300-8491024',
    vehicle: 'Honda CD70 (ICT-8492)',
    rating: 4.9,
    tripsToday: 6,
    earningsToday: 38.5,
  });

  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Active Route & GPS Simulation State
  const [simulatingGps, setSimulatingGps] = useState(false);
  const [, setGpsStepIndex] = useState(0);
  const [routeData, setRouteData] = useState<RouteResult | null>(null);

  const activeMapContainerRef = useRef<HTMLDivElement>(null);
  const activeMapInstanceRef = useRef<L.Map | null>(null);
  const activeRiderMarkerRef = useRef<L.Marker | null>(null);
  const gpsIntervalRef = useRef<any>(null);

  useEffect(() => {
    fetchOrdersFeed();

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('join_room', 'riders');

    const handleNewOrder = () => {
      fetchOrdersFeed();
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_update', handleNewOrder);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_update', handleNewOrder);
    };
  }, []);

  const fetchOrdersFeed = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      const allOrders: any[] = res.data.orders || [];

      // Find if this rider already has an active order in delivery
      const ongoing = allOrders.find(
        (o) =>
          o.rider?.id === riderProfile.id &&
          ['confirmed', 'preparing', 'out_for_delivery'].includes(o.status)
      );

      if (ongoing) {
        setActiveDelivery(ongoing);
      }

      // Filter available unassigned orders
      const unassigned = allOrders.filter(
        (o) =>
          !o.rider &&
          ['placed', 'confirmed', 'preparing'].includes(o.status)
      );

      setAvailableOrders(unassigned);
    } catch (err) {
      console.error('Failed to fetch orders for rider feed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Direct Order Acceptance Handler
  const handleAcceptOrder = async (order: any) => {
    try {
      setAcceptingId(order._id || order.orderNumber);

      const res = await api.post(`/orders/${order._id || order.orderNumber}/accept-rider`, {
        rider: {
          id: riderProfile.id,
          name: riderProfile.name,
          phone: riderProfile.phone,
          vehicle: riderProfile.vehicle,
          rating: riderProfile.rating,
          currentCoordinates: order.pickupCoordinates || { lat: 33.7083, lng: 73.0569 },
        },
      });

      const updated = res.data.order;
      setActiveDelivery(updated);
      setAvailableOrders((prev) =>
        prev.filter((o) => o._id !== updated._id && o.orderNumber !== updated.orderNumber)
      );
      setGpsStepIndex(0);
      setSimulatingGps(true);
    } catch (err) {
      console.error('Failed to accept order:', err);
      alert('Order is no longer available or was accepted by another rider.');
    } finally {
      setAcceptingId(null);
    }
  };

  // Status Progression Handler
  const handleUpdateStatus = async (nextStatus: string) => {
    if (!activeDelivery) return;
    try {
      const orderId = activeDelivery._id || activeDelivery.orderNumber;
      const res = await api.patch(`/orders/${orderId}/status`, {
        status: nextStatus,
      });

      const updated = res.data.order;
      if (nextStatus === 'delivered') {
        setActiveDelivery(null);
        setSimulatingGps(false);
        fetchOrdersFeed();
      } else {
        setActiveDelivery(updated);
      }
    } catch (err) {
      console.error('Failed to update delivery status:', err);
    }
  };

  // Setup Leaflet map for Active Delivery
  useEffect(() => {
    if (!activeDelivery) {
      if (activeMapInstanceRef.current) {
        activeMapInstanceRef.current.remove();
        activeMapInstanceRef.current = null;
      }
      return;
    }

    const pickupLat = activeDelivery.pickupCoordinates?.lat || 33.7083;
    const pickupLng = activeDelivery.pickupCoordinates?.lng || 73.0569;
    const dropLat = activeDelivery.deliveryAddress?.coordinates?.lat || 33.7214;
    const dropLng = activeDelivery.deliveryAddress?.coordinates?.lng || 73.056;

    const timer = setTimeout(async () => {
      if (!activeMapContainerRef.current) return;

      if (!activeMapInstanceRef.current) {
        const map = L.map(activeMapContainerRef.current).setView(
          [(pickupLat + dropLat) / 2, (pickupLng + dropLng) / 2],
          14
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        // Pickup Marker
        L.marker([pickupLat, pickupLng], {
          icon: L.divIcon({
            className: 'custom-pin',
            html: '<div style="background:#f59e0b; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #0f172a; font-size:16px;">🍳</div>',
            iconSize: [34, 34],
          }),
        })
          .addTo(map)
          .bindPopup(`<b>${activeDelivery.restaurantName}</b><br/>Pickup Point`);

        // Drop-off Marker
        L.marker([dropLat, dropLng], {
          icon: L.divIcon({
            className: 'custom-pin',
            html: '<div style="background:#3b82f6; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #0f172a; font-size:16px;">🏠</div>',
            iconSize: [34, 34],
          }),
        })
          .addTo(map)
          .bindPopup(`<b>${activeDelivery.customerName}</b><br/>${activeDelivery.deliveryAddress?.street}`);

        // Initial Rider Marker
        const riderMarker = L.marker([pickupLat, pickupLng], {
          icon: L.divIcon({
            className: 'custom-pin',
            html: '<div style="background:#10b981; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2.5px solid #0f172a; font-size:18px; box-shadow:0 0 15px rgba(16,185,129,0.6);">🏍️</div>',
            iconSize: [36, 36],
          }),
        }).addTo(map);

        activeRiderMarkerRef.current = riderMarker;

        // Fetch OSRM Road Route
        const route = await fetchRoadRoute([pickupLat, pickupLng], [dropLat, dropLng]);
        setRouteData(route);

        const polyline = L.polyline(route.coordinates, {
          color: '#10b981',
          weight: 5,
          opacity: 0.85,
          dashArray: '8, 8',
        }).addTo(map);

        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        activeMapInstanceRef.current = map;
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [activeDelivery]);

  // Live GPS Simulator & Socket.IO Broadcaster
  useEffect(() => {
    if (!simulatingGps || !routeData || !activeDelivery) {
      if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
      return;
    }

    const socket = getSocket();
    const coordinates = routeData.coordinates;

    gpsIntervalRef.current = setInterval(() => {
      setGpsStepIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % coordinates.length;
        const currentCoord = coordinates[nextIndex];

        // Update local map marker
        if (activeRiderMarkerRef.current) {
          activeRiderMarkerRef.current.setLatLng(currentCoord);
        }

        // Calculate simulated ETA and remaining distance
        const progressPct = nextIndex / coordinates.length;
        const remainingKm = Math.max(
          0.1,
          Number((routeData.distanceKm * (1 - progressPct)).toFixed(1))
        );
        const etaMins = Math.max(1, Math.round(routeData.durationMin * (1 - progressPct)));

        // Broadcast to customer and server via Socket.IO
        socket.emit('rider_location_update', {
          orderNumber: activeDelivery.orderNumber,
          riderId: riderProfile.id,
          riderName: riderProfile.name,
          coordinates: { lat: currentCoord[0], lng: currentCoord[1] },
          etaMinutes: etaMins,
          distanceRemainingKm: remainingKm,
        });

        return nextIndex;
      });
    }, 2500);

    return () => {
      if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
    };
  }, [simulatingGps, routeData, activeDelivery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 pb-20">
      {/* Top Rider Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  GourmetOS Rider Logistics
                </span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Fleet Ops
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {riderProfile.name} • {riderProfile.vehicle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Online / Offline Availability Toggle */}
            <button
              type="button"
              onClick={() => setIsOnline((prev) => !prev)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isOnline ? 'Online • Accepting' : 'Offline • On Break'}</span>
            </button>

            {/* Switch to Diner View */}
            <button
              type="button"
              onClick={onSwitchToCustomer}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Customer View</span>
            </button>

            {/* Switch to Vendor View */}
            <button
              type="button"
              onClick={onSwitchToVendor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-300 transition"
            >
              <span>Kitchen Ops</span>
            </button>

            {/* Switch to Admin View */}
            {onSwitchToAdmin && (
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs font-bold text-indigo-300 transition"
                title="Switch to Admin Governance Console"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Rider KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Today's Earnings</span>
            <p className="text-xl font-black text-emerald-400 font-mono">
              ${riderProfile.earningsToday.toFixed(2)}
            </p>
            <span className="text-[10px] text-slate-500">6 Trips Finished</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Rider Rating</span>
            <p className="text-xl font-black text-amber-400 font-mono flex items-center gap-1">
              ★ {riderProfile.rating}
            </p>
            <span className="text-[10px] text-slate-500">Top Tier Fleet</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Active Delivery</span>
            <p className="text-xl font-black text-white font-mono">
              {activeDelivery ? '1 Ongoing' : 'Idle'}
            </p>
            <span className="text-[10px] text-emerald-400 font-semibold">
              {activeDelivery ? 'GPS Broadcasting' : 'Ready for Order'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Nearby Pool</span>
            <p className="text-xl font-black text-white font-mono">
              {availableOrders.length}
            </p>
            <span className="text-[10px] text-teal-400 font-semibold">
              Ready for Acceptance
            </span>
          </div>
        </div>

        {/* ACTIVE DELIVERY ASSIGNMENT VIEW (If Rider has accepted an order) */}
        {activeDelivery && (
          <div className="bg-slate-900/90 border-2 border-emerald-500/60 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Navigation className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">
                      Active Trip: #{activeDelivery.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      GPS Broadcaster Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Pickup at {activeDelivery.restaurantName} • Deliver to {activeDelivery.customerName}
                  </p>
                </div>
              </div>

              {/* GPS Simulator Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSimulatingGps((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    simulatingGps
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                  }`}
                >
                  {simulatingGps ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{simulatingGps ? 'Pause GPS Beacon' : 'Resume GPS Beacon'}</span>
                </button>
              </div>
            </div>

            {/* Road Route Leaflet Map */}
            <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-800 relative bg-slate-950 shadow-inner">
              <div ref={activeMapContainerRef} className="w-full h-full" />
              {routeData && (
                <div className="absolute top-3 left-3 z-20 px-3.5 py-1.5 rounded-xl bg-slate-950/90 text-xs text-white border border-slate-800 backdrop-blur-md flex items-center gap-2 shadow-lg">
                  <span className="text-emerald-400 font-bold font-mono">
                    {routeData.distanceKm} km
                  </span>
                  <span>•</span>
                  <span>ETA ~{routeData.durationMin} mins</span>
                  <span>•</span>
                  <span className="text-slate-400 text-[11px]">{routeData.summary}</span>
                </div>
              )}
            </div>

            {/* Pickup & Drop-off Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup Point */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-4 h-4" />
                    <span>STEP 1: RESTAURANT PICKUP</span>
                  </div>
                  <span className="text-white font-mono">{activeDelivery.items?.length || 1} Dishes</span>
                </div>

                <p className="text-sm font-bold text-white">{activeDelivery.restaurantName}</p>
                <p className="text-xs text-slate-400">
                  Sector F-7 / Blue Area, Islamabad
                </p>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                  <strong className="text-slate-200">Order Items: </strong>
                  {(activeDelivery.items || []).map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                </div>
              </div>

              {/* Drop-off Point */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>STEP 2: CUSTOMER DROP-OFF</span>
                  </div>
                  <a
                    href={`tel:${activeDelivery.customerPhone}`}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Customer</span>
                  </a>
                </div>

                <p className="text-sm font-bold text-white">{activeDelivery.customerName}</p>
                <p className="text-xs text-slate-300 font-medium">
                  {activeDelivery.deliveryAddress?.street}, {activeDelivery.deliveryAddress?.areaOrLandmark}
                </p>

                {activeDelivery.deliveryAddress?.specialNotes && (
                  <p className="text-[11px] text-amber-300/90 italic pt-1 border-t border-slate-800/80">
                    Rider Note: "{activeDelivery.deliveryAddress.specialNotes}"
                  </p>
                )}
              </div>
            </div>

            {/* Rider Milestone Action Progression */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Payment Type:{' '}
                <strong className="text-white font-mono uppercase">
                  {activeDelivery.payment?.method} (
                  {activeDelivery.payment?.status === 'paid' ? 'Paid Digitally' : 'Collect Cash $ ' + activeDelivery.pricing?.total?.toFixed(2)}
                  )
                </strong>
              </div>

              <div className="flex items-center gap-2">
                {activeDelivery.status !== 'delivered' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('delivered')}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Order Delivered</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NEARBY AVAILABLE ORDERS DISPATCH POOL */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Nearby Available Orders</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {availableOrders.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pick up prepared meals from local restaurants and earn delivery payouts
              </p>
            </div>

            <button
              type="button"
              onClick={fetchOrdersFeed}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Pool</span>
            </button>
          </div>

          {availableOrders.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-3">
              <Package className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Unassigned Orders Nearby</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All customer orders are currently assigned. Stay online; new orders from restaurants will pop up automatically!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableOrders.map((order) => {
                const isAccepting = acceptingId === (order._id || order.orderNumber);
                const payoutEarned = (order.pricing?.deliveryFee || 2.99) + (order.pricing?.tip || 0);

                return (
                  <div
                    key={order._id || order.orderNumber}
                    className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-white">
                            #{order.orderNumber}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Ready for Pickup
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 font-semibold text-emerald-400">
                          {order.restaurantName}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-emerald-400 font-mono block">
                          +${payoutEarned.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">Rider Earning</span>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                        <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block">Drop-off Destination:</strong>
                          <span className="text-slate-300">
                            {order.deliveryAddress?.areaOrLandmark || order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                        <span>Items: {order.items?.length || 1} packaged plates</span>
                        <span className="font-mono">
                          Payment: {order.payment?.method?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Accept CTA */}
                    <button
                      type="button"
                      disabled={isAccepting || !!activeDelivery}
                      onClick={() => handleAcceptOrder(order)}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-emerald-500/20"
                    >
                      {isAccepting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Accepting Assignment...</span>
                        </>
                      ) : (
                        <>
                          <span>Accept Delivery & Navigate</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RiderPortal;
