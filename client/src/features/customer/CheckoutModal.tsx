import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  Bike,
  Banknote,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import L from 'leaflet';
import api from '../../services/api';
import { CartItem } from '../../store/slices/cartSlice';
import { formatPKR } from '../../utils/currency';

// Predefined prominent Pakistani landmarks
export interface LandmarkOption {
  city: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
}

export const PAKISTANI_LANDMARKS: LandmarkOption[] = [
  // Islamabad
  { city: 'Islamabad', name: 'Centaurus Mall, Blue Area', area: 'F-8/G-8', lat: 33.7083, lng: 73.0569 },
  { city: 'Islamabad', name: 'F-7 Markaz (Jinnah Super)', area: 'Sector F-7', lat: 33.7214, lng: 73.0560 },
  { city: 'Islamabad', name: 'F-10 Markaz Commercial', area: 'Sector F-10', lat: 33.6961, lng: 73.0118 },
  { city: 'Islamabad', name: 'DHA Phase 2 (Giga Mall)', area: 'DHA Phase 2', lat: 33.5273, lng: 73.1614 },
  // Lahore
  { city: 'Lahore', name: 'MM Alam Road, Gulberg III', area: 'Gulberg III', lat: 31.5204, lng: 74.3587 },
  { city: 'Lahore', name: 'DHA Phase 5 Commercial Center', area: 'DHA Phase 5', lat: 31.4678, lng: 74.4079 },
  { city: 'Lahore', name: 'Packages Mall, Walton', area: 'Walton Road', lat: 31.4721, lng: 74.3582 },
  // Karachi
  { city: 'Karachi', name: 'Clifton Block 4 / Boat Basin', area: 'Clifton', lat: 24.8188, lng: 67.0315 },
  { city: 'Karachi', name: 'DHA Phase 6 Bukhari Commercial', area: 'DHA Phase 6', lat: 24.7891, lng: 67.0652 },
  { city: 'Karachi', name: 'Lucky One Mall, F.B. Area', area: 'Gulberg Town', lat: 24.9452, lng: 67.0863 },
];

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  restaurantId: string;
  restaurantName: string;
  onOrderSuccess: (order: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  tax,
  deliveryFee,
  tip,
  total,
  restaurantId,
  restaurantName,
  onOrderSuccess,
}) => {
  // Checkout Steps: 1 = Address & Map, 2 = Payment Selection & OTP, 3 = Submitting
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Customer Contact State
  const [customerName, setCustomerName] = useState('Saad Khan');
  const [customerPhone, setCustomerPhone] = useState('0300-8594210');
  const [customerEmail, setCustomerEmail] = useState('saad@example.pk');

  // Address & Map Coordinates State
  const [selectedCity, setSelectedCity] = useState('Islamabad');
  const [streetAddress, setStreetAddress] = useState('House 42, Street 18');
  const [areaOrLandmark, setAreaOrLandmark] = useState('F-7 Markaz (Jinnah Super)');
  const [deliveryNotes, setDeliveryNotes] = useState('Ring bell and leave at front door');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 33.7214,
    lng: 73.056,
  });
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash' | 'easypaisa'>('jazzcash');
  const [walletPhone, setWalletPhone] = useState('0300-8594210');
  const [walletOtp, setWalletOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [simulatedRef, setSimulatedRef] = useState('');

  // Processing state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Leaflet map container refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Custom Leaflet pin icon
  const customPinIcon = L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="background-color: #10b981; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid #0f172a; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4);">
        <div style="transform: rotate(45deg); color: white; font-size: 14px; font-weight: bold;">📍</div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });

  // Reverse geocoding function
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setIsGeocoding(true);
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'GourmetOS-RMS/1.0' } });
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          const parts = data.display_name.split(', ');
          const shortAddress = parts.slice(0, 3).join(', ');
          setStreetAddress(shortAddress);
          if (parts[1]) setAreaOrLandmark(parts[1]);
        }
      }
    } catch {
      // Ignore geocoding failure, keep existing address
    } finally {
      setIsGeocoding(false);
    }
  };

  // Initialize or update Leaflet map when Step 1 is rendered
  useEffect(() => {
    if (!isOpen || currentStep !== 1) return;

    // Small delay to ensure modal DOM is mounted
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView(
          [coordinates.lat, coordinates.lng],
          15
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        const marker = L.marker([coordinates.lat, coordinates.lng], {
          draggable: true,
          icon: customPinIcon,
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setCoordinates({ lat: pos.lat, lng: pos.lng });
          reverseGeocode(pos.lat, pos.lng);
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
          reverseGeocode(e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } else {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, currentStep]);

  // Clean up Leaflet on modal close
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  }, [isOpen]);

  // Predefined Landmark Selection Handler
  const handleSelectLandmark = (landmark: LandmarkOption) => {
    setCoordinates({ lat: landmark.lat, lng: landmark.lng });
    setAreaOrLandmark(landmark.name);
    setStreetAddress(`${landmark.name}, ${landmark.area}`);
    setSelectedCity(landmark.city);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([landmark.lat, landmark.lng], 16, { duration: 1 });
      markerRef.current.setLatLng([landmark.lat, landmark.lng]);
    }
  };

  // OTP Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (isOtpSent && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, otpTimer]);

  // Simulate OTP Dispatch for JazzCash / EasyPaisa
  const handleSendOtp = () => {
    setIsOtpSent(true);
    setOtpTimer(30);
    setWalletOtp('4819'); // Mock code prefilled / generated for seamless demo
  };

  // Simulate OTP Verification
  const handleVerifyOtp = () => {
    if (!walletOtp || walletOtp.length < 4) {
      setErrorMsg('Please enter the 4-6 digit confirmation code');
      return;
    }
    setErrorMsg('');
    const prefix = paymentMethod === 'jazzcash' ? 'JC' : 'EP';
    const ref = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
    setSimulatedRef(ref);
    setIsPaymentVerified(true);
  };

  // Submit Final Order
  const handlePlaceOrder = async () => {
    setErrorMsg('');

    if (!customerName.trim() || !customerPhone.trim() || !streetAddress.trim()) {
      setErrorMsg('Please ensure all required delivery and contact fields are completed.');
      return;
    }

    if ((paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && !isPaymentVerified) {
      setErrorMsg(`Please verify your ${paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} wallet authorization first.`);
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        restaurantId,
        restaurantName,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || 'customer@restaurant.local',
        deliveryAddress: {
          street: streetAddress.trim(),
          city: selectedCity,
          areaOrLandmark: areaOrLandmark.trim(),
          coordinates,
          specialNotes: deliveryNotes.trim(),
        },
        payment: {
          method: paymentMethod,
          status: paymentMethod === 'cod' ? 'pending' : 'paid',
          accountNumber: walletPhone,
          transactionRef: simulatedRef || undefined,
          paidAt: paymentMethod !== 'cod' ? new Date().toISOString() : undefined,
        },
        pricing: {
          subtotal,
          tax,
          deliveryFee,
          tip,
          total,
        },
        items: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          basePrice: item.basePrice,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          itemTotal: item.itemTotal,
          image: item.image,
          size: item.size,
          spiceLevel: item.spiceLevel,
          selectedAddOns: item.selectedAddOns,
          specialInstructions: item.specialInstructions,
        })),
      };

      const res = await api.post('/orders', orderPayload);
      onOrderSuccess(res.data.order);
      onClose();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.response?.data?.error || 'Unable to place order. Please review your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-white tracking-tight">
                  Checkout & Localized Delivery
                </Dialog.Title>
                <p className="text-xs text-slate-400">
                  {restaurantName} • Grand Total: <strong className="text-emerald-400">{formatPKR(total)}</strong>
                </p>
              </div>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold mr-3">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                    currentStep === 1
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  1
                </span>
                <span className={currentStep === 1 ? 'text-white' : 'text-slate-400'}>
                  Address
                </span>
                <span className="text-slate-600">→</span>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                    currentStep === 2
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  2
                </span>
                <span className={currentStep === 2 ? 'text-white' : 'text-slate-400'}>
                  Payment
                </span>
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
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                {errorMsg}
              </div>
            )}

            {/* STEP 1: LEAFLET MAP & LOCATION SELECTION */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Predefined Pakistani Landmarks Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Quick Pakistani Landmark Selection
                    </label>
                    <span className="text-[11px] text-slate-400">Islamabad • Lahore • Karachi</span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                    {PAKISTANI_LANDMARKS.map((lm) => {
                      const isSelected = areaOrLandmark === lm.name;
                      return (
                        <button
                          key={lm.name}
                          type="button"
                          onClick={() => handleSelectLandmark(lm)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border text-left ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                              : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-[10px] text-emerald-400 font-bold mr-1">
                            [{lm.city}]
                          </span>
                          {lm.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Leaflet Map Container */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300 font-semibold">
                      <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                      Pinpoint Exact Drop-off Point (Click or Drag Marker):
                    </span>
                    <span className="font-mono text-[11px] text-emerald-400">
                      {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                    </span>
                  </div>

                  <div className="h-52 w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner relative bg-slate-950">
                    <div ref={mapContainerRef} className="w-full h-full" />
                    {isGeocoding && (
                      <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-lg bg-slate-950/90 text-[11px] text-emerald-400 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1.5 shadow">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Locating address...
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Street Address & Building / House No. *
                    </label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. House 14-B, Street 3, Sector F-7/2"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Landmark / Nearest Market *
                    </label>
                    <input
                      type="text"
                      value={areaOrLandmark}
                      onChange={(e) => setAreaOrLandmark(e.target.value)}
                      placeholder="e.g. Near Shell Pump / Safa Gold Mall"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">City</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                    >
                      <option value="Islamabad">Islamabad (Federal Capital)</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Lahore">Lahore (Punjab)</option>
                      <option value="Karachi">Karachi (Sindh)</option>
                      <option value="Peshawar">Peshawar (KPK)</option>
                    </select>
                  </div>
                </div>

                {/* Customer Contact Details */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Recipient Contact Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Full Name *</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Recipient Name"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Pakistani Mobile Number *
                      </label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0300-XXXXXXX"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Email Address (for Digital Tax Invoice)
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="customer@example.pk"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Rider Delivery Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="Gate code, landmark direction, call on arrival..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PAKISTANI LOCAL PAYMENTS */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Select Payment Method
                  </h3>
                  <p className="text-xs text-slate-400">
                    Choose from Pakistani local mobile wallets or Cash on Delivery.
                  </p>
                </div>

                {/* Method Options Radio Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Cash on Delivery */}
                  <div
                    onClick={() => {
                      setPaymentMethod('cod');
                      setIsPaymentVerified(true);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer select-none transition flex flex-col justify-between space-y-3 ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Banknote className="w-6 h-6 text-emerald-400" />
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === 'cod'
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-slate-700'
                        }`}
                      >
                        {paymentMethod === 'cod' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Cash on Delivery</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Pay rider at door</p>
                    </div>
                  </div>

                  {/* JazzCash Mobile Wallet */}
                  <div
                    onClick={() => {
                      setPaymentMethod('jazzcash');
                      setIsPaymentVerified(false);
                      setIsOtpSent(false);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer select-none transition flex flex-col justify-between space-y-3 ${
                      paymentMethod === 'jazzcash'
                        ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/10'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black tracking-wider">
                        JazzCash
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === 'jazzcash'
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-slate-700'
                        }`}
                      >
                        {paymentMethod === 'jazzcash' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">JazzCash Wallet</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Mobile PIN / OTP</p>
                    </div>
                  </div>

                  {/* EasyPaisa Mobile Wallet */}
                  <div
                    onClick={() => {
                      setPaymentMethod('easypaisa');
                      setIsPaymentVerified(false);
                      setIsOtpSent(false);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer select-none transition flex flex-col justify-between space-y-3 ${
                      paymentMethod === 'easypaisa'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black tracking-wider">
                        EasyPaisa
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === 'easypaisa'
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-slate-700'
                        }`}
                      >
                        {paymentMethod === 'easypaisa' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">EasyPaisa Wallet</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Instant USSD Push</p>
                    </div>
                  </div>
                </div>

                {/* Sub-view for Cash on Delivery */}
                {paymentMethod === 'cod' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      Cash on Delivery Verified
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      You will pay <strong className="text-white">{formatPKR(total)}</strong> upon arrival of your food.
                      Please keep exact cash ready or let the rider know if change for large notes is required.
                    </p>
                  </div>
                )}

                {/* Sub-view for JazzCash & EasyPaisa Simulated Flow */}
                {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">
                          {paymentMethod === 'jazzcash' ? 'JazzCash Mobile Account' : 'EasyPaisa Wallet Verification'}
                        </span>
                      </div>
                      {isPaymentVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Authorized: {simulatedRef}
                        </span>
                      )}
                    </div>

                    {!isPaymentVerified ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-300">
                            Registered {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Phone No.
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={walletPhone}
                              onChange={(e) => setWalletPhone(e.target.value)}
                              placeholder="0300-1234567"
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition shrink-0"
                            >
                              {isOtpSent ? 'Resend' : 'Request OTP / Push'}
                            </button>
                          </div>
                        </div>

                        {isOtpSent && (
                          <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in">
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <KeyRound className="w-4 h-4 text-emerald-400" />
                                Simulated SMS/USSD Prompt sent to {walletPhone}!
                              </span>
                              <span className="font-mono text-[11px] text-slate-400">
                                Expires: {otpTimer}s
                              </span>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-slate-300">
                                Enter 4-6 Digit Security MPIN / OTP
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={walletOtp}
                                  onChange={(e) => setWalletOtp(e.target.value)}
                                  placeholder="Enter 4819"
                                  className="w-40 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-center font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                  type="button"
                                  onClick={handleVerifyOtp}
                                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-md shadow-emerald-500/20"
                                >
                                  Authorize & Confirm Payment
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-400">
                            Transaction Authorized Successfully
                          </span>
                          <span className="font-mono text-white font-bold">{formatPKR(total)}</span>
                        </div>
                        <p className="text-slate-300">
                          Digital payment secured via {paymentMethod === 'jazzcash' ? 'JazzCash PG' : 'EasyPaisa Wallet'}.
                          Transaction Reference: <strong className="font-mono text-white">{simulatedRef}</strong>.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
            {currentStep === 1 ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Address</span>
                </button>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending to Kitchen...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                      <span>Place Order • {formatPKR(total)}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
