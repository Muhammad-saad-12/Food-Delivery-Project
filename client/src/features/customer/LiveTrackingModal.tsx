import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  Bike,
  Navigation,
  Phone,
  MapPin,
  Store,
} from 'lucide-react';
import L from 'leaflet';
import { getSocket } from '../../services/socket';
import { fetchRoadRoute } from '../../services/routing';

interface LiveTrackingModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [etaMinutes, setEtaMinutes] = useState<number>(12);
  const [distanceKm, setDistanceKm] = useState<number>(3.2);
  const [routeSummary, setRouteSummary] = useState<string>('City Route via Jinnah Ave');
  const [orderStatus, setOrderStatus] = useState<string>(order?.status || 'out_for_delivery');
  const [riderCoords, setRiderCoords] = useState<[number, number] | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const pickupLat = order?.pickupCoordinates?.lat || 33.7083; // Centaurus/Blue Area
  const pickupLng = order?.pickupCoordinates?.lng || 73.0569;
  const dropLat = order?.deliveryAddress?.coordinates?.lat || 33.7214; // F-7 Jinnah Super
  const dropLng = order?.deliveryAddress?.coordinates?.lng || 73.056;

  // Custom DivIcons for Leaflet
  const createMarkerIcon = (emoji: string, color: string, pulse = false) =>
    L.divIcon({
      className: 'custom-tracking-icon',
      html: `
        <div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #0f172a; box-shadow: 0 4px 12px rgba(0,0,0,0.5); font-size: 16px; position: relative;">
          ${pulse ? '<span style="position: absolute; inset: -4px; border-radius: 50%; background: #10b981; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>' : ''}
          ${emoji}
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

  useEffect(() => {
    if (!order) return;
    setOrderStatus(order.status || 'out_for_delivery');

    // Default rider starting location near pickup point if not assigned yet
    const initialRiderLat = order.rider?.currentCoordinates?.lat || (pickupLat + (dropLat - pickupLat) * 0.3);
    const initialRiderLng = order.rider?.currentCoordinates?.lng || (pickupLng + (dropLng - pickupLng) * 0.3);
    setRiderCoords([initialRiderLat, initialRiderLng]);
  }, [order]);

  // Setup Leaflet map and OSRM Road Route
  useEffect(() => {
    if (!isOpen || !order) return;

    const timer = setTimeout(async () => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView(
          [(pickupLat + dropLat) / 2, (pickupLng + dropLng) / 2],
          14
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        // 1. Restaurant Pickup Marker
        L.marker([pickupLat, pickupLng], {
          icon: createMarkerIcon('🍳', '#f59e0b'),
        })
          .addTo(map)
          .bindPopup(`<b>${order.restaurantName}</b><br/>Pickup Kitchen`);

        // 2. Customer Drop-off Marker
        L.marker([dropLat, dropLng], {
          icon: createMarkerIcon('🏠', '#3b82f6'),
        })
          .addTo(map)
          .bindPopup(`<b>${order.customerName}</b><br/>${order.deliveryAddress?.street || 'Delivery Address'}`);

        // 3. Moving Rider Marker
        const riderPos = riderCoords || [pickupLat, pickupLng];
        const riderMarker = L.marker(riderPos, {
          icon: createMarkerIcon('🏍️', '#10b981', true),
        })
          .addTo(map)
          .bindPopup(`<b>Rider: ${order.rider?.name || 'Assigned Driver'}</b><br/>On the way`);

        riderMarkerRef.current = riderMarker;

        // 4. Fetch and render real OSRM road polyline
        const routeData = await fetchRoadRoute([pickupLat, pickupLng], [dropLat, dropLng]);
        setDistanceKm(routeData.distanceKm);
        setEtaMinutes(routeData.durationMin);
        if (routeData.summary) setRouteSummary(routeData.summary);

        const polyline = L.polyline(routeData.coordinates, {
          color: '#10b981',
          weight: 5,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round',
        }).addTo(map);

        routePolylineRef.current = polyline;

        // Fit map bounds to show route
        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, order]);

  // Clean up Leaflet on close
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      riderMarkerRef.current = null;
      routePolylineRef.current = null;
    }
  }, [isOpen]);

  // Subscribe to live Socket.IO events for GPS updates and order status
  useEffect(() => {
    if (!isOpen || !order?.orderNumber) return;

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    // Join order room for private tracking broadcast
    socket.emit('join_order_room', order.orderNumber);

    const handleLocation = (data: any) => {
      if (data.coordinates?.lat && data.coordinates?.lng) {
        const newPos: [number, number] = [data.coordinates.lat, data.coordinates.lng];
        setRiderCoords(newPos);

        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng(newPos);
        }

        if (data.etaMinutes) setEtaMinutes(data.etaMinutes);
        if (data.distanceRemainingKm) setDistanceKm(data.distanceRemainingKm);
      }
    };

    const handleStatus = (data: any) => {
      if (data.status) {
        setOrderStatus(data.status);
      }
    };

    socket.on('live_rider_location', handleLocation);
    socket.on('order_status_update', handleStatus);

    return () => {
      socket.off('live_rider_location', handleLocation);
      socket.off('order_status_update', handleStatus);
    };
  }, [isOpen, order?.orderNumber]);

  if (!order) return null;

  const riderInfo = order.rider || {
    name: 'Tariq Mehmood',
    phone: '0300-8491024',
    vehicle: 'Honda CD70 (ICT-8492)',
    rating: 4.9,
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Bike className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Live Delivery GPS Tracking</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    #{order.orderNumber}
                  </span>
                </Dialog.Title>
                <p className="text-xs text-slate-400">
                  {order.restaurantName} • Real-time road tracking powered by OSRM
                </p>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
            {/* Live ETA Metric Banner */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Estimated Arrival
                </span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {etaMinutes} mins
                </span>
              </div>
              <div className="border-x border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Remaining Distance
                </span>
                <span className="text-lg font-black text-white font-mono">
                  {distanceKm} km
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Delivery Status
                </span>
                <span className="text-xs font-bold text-amber-400 capitalize block mt-1">
                  {orderStatus.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Interactive Leaflet Tracking Map */}
            <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative bg-slate-950">
              <div ref={mapContainerRef} className="w-full h-full" />
              <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-xl bg-slate-950/90 text-[11px] text-slate-300 border border-slate-800 backdrop-blur-md flex items-center gap-1.5 shadow">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>{routeSummary}</span>
              </div>
            </div>

            {/* Rider Profile Card & Instant Calling */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
                  🏍️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{riderInfo.name}</h4>
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-0.5">
                      ★ {riderInfo.rating}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{riderInfo.vehicle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${riderInfo.phone}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Rider</span>
                </a>
              </div>
            </div>

            {/* Pickup & Drop-off Route Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Store className="w-3.5 h-3.5" />
                  <span>Pickup Location:</span>
                </div>
                <p className="text-white font-medium">{order.restaurantName}</p>
                <p className="text-slate-400">Sector F-7 / Blue Area, Islamabad</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Delivery Destination:</span>
                </div>
                <p className="text-white font-medium">
                  {order.deliveryAddress?.areaOrLandmark || order.customerName}
                </p>
                <p className="text-slate-400">
                  {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                </p>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
