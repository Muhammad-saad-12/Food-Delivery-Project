import { useState } from 'react';
import { CustomerPortal } from './features/customer/CustomerPortal';
import { VendorPortal } from './features/vendor/VendorPortal';

export function App() {
  const [portalMode, setPortalMode] = useState<'customer' | 'vendor'>('customer');

  if (portalMode === 'vendor') {
    return <VendorPortal onSwitchToCustomer={() => setPortalMode('customer')} />;
  }

  return <CustomerPortal onSwitchToVendor={() => setPortalMode('vendor')} />;
}

export default App;
