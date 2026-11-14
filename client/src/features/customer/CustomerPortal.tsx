import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { clearCart } from '../../store/slices/cartSlice';
import { CustomerNavbar } from './CustomerNavbar';
import { CustomerDiscovery, RestaurantItem } from './CustomerDiscovery';
import { RestaurantDetail } from './RestaurantDetail';
import {
  FoodCustomizationModal,
  MenuItemOption,
} from '../../components/customer/FoodCustomizationModal';
import { CartDrawer } from '../../components/customer/CartDrawer';
import { AIChatWidget } from '../../components/chat/AIChatWidget';
import { CheckoutModal } from './CheckoutModal';
import { InvoiceView } from './InvoiceView';
import { OrderHistoryView } from './OrderHistoryView';

interface CustomerPortalProps {
  onSwitchToVendor?: () => void;
  onSwitchToRider?: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  onSwitchToVendor,
  onSwitchToRider,
}) => {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);

  // Active Main View: 'discovery' (restaurants/menu) | 'orders' (tracking & invoices)
  const [activeView, setActiveView] = useState<'discovery' | 'orders'>('discovery');

  // Selected restaurant for detail view
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<RestaurantItem | null>(null);

  // Item customization modal state
  const [customizingItem, setCustomizingItem] =
    useState<MenuItemOption | null>(null);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Invoice Modal State
  const [placedOrderForInvoice, setPlacedOrderForInvoice] = useState<any | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const handleOpenCustomization = (item: MenuItemOption) => {
    setCustomizingItem(item);
    setIsCustomizationOpen(true);
  };

  const handleCloseCustomization = () => {
    setIsCustomizationOpen(false);
    setCustomizingItem(null);
  };

  const handleOrderSuccess = (order: any) => {
    dispatch(clearCart());
    setPlacedOrderForInvoice(order);
    setIsInvoiceOpen(true);
    setActiveView('orders'); // Switch view so the customer sees tracking immediately
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Customer Navigation */}
      <CustomerNavbar
        onGoHome={() => {
          setActiveView('discovery');
          setSelectedRestaurant(null);
        }}
        onGoOrders={() => setActiveView('orders')}
        onSwitchToVendor={onSwitchToVendor}
        onSwitchToRider={onSwitchToRider}
        activeView={activeView}
        activeRestaurantName={selectedRestaurant?.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeView === 'orders' ? (
          <OrderHistoryView
            onBackToDiscovery={() => {
              setActiveView('discovery');
              setSelectedRestaurant(null);
            }}
          />
        ) : selectedRestaurant ? (
          <RestaurantDetail
            restaurant={selectedRestaurant}
            onBack={() => setSelectedRestaurant(null)}
            onSelectItemForCustomization={handleOpenCustomization}
          />
        ) : (
          <CustomerDiscovery
            onSelectRestaurant={(restaurant) => setSelectedRestaurant(restaurant)}
          />
        )}
      </main>

      {/* Food Customization Modal */}
      <FoodCustomizationModal
        item={customizingItem}
        isOpen={isCustomizationOpen}
        onClose={handleCloseCustomization}
      />

      {/* Persistent Shopping Cart Slide-over Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal with Leaflet Geocoding & Pakistani Payments */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart.items}
        subtotal={cart.subtotal}
        tax={cart.tax}
        deliveryFee={cart.deliveryFee}
        tip={cart.tip}
        total={cart.total}
        restaurantId={cart.restaurantId || 'mock-rest-1'}
        restaurantName={cart.restaurantName || 'Gourmet Kitchen'}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Itemized Official Tax Invoice Modal */}
      <InvoiceView
        order={placedOrderForInvoice}
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setPlacedOrderForInvoice(null);
        }}
      />

      {/* Lightweight Floating AI Chat Assistant */}
      <AIChatWidget
        onSelectItemForCustomization={handleOpenCustomization}
        restaurantId={selectedRestaurant?._id}
      />
    </div>
  );
};

export default CustomerPortal;
