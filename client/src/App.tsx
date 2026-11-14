import { useState } from 'react';
import { CustomerPortal } from './features/customer/CustomerPortal';
import { VendorPortal } from './features/vendor/VendorPortal';
import { RiderPortal } from './features/rider/RiderPortal';

export function App() {
  const [portalMode, setPortalMode] = useState<'customer' | 'vendor' | 'rider'>('customer');

  if (portalMode === 'vendor') {
    return (
      <VendorPortal
        onSwitchToCustomer={() => setPortalMode('customer')}
        onSwitchToRider={() => setPortalMode('rider')}
      />
    );
  }

  if (portalMode === 'rider') {
    return (
      <RiderPortal
        onSwitchToCustomer={() => setPortalMode('customer')}
        onSwitchToVendor={() => setPortalMode('vendor')}
      />
    );
  }

  return (
    <CustomerPortal
      onSwitchToVendor={() => setPortalMode('vendor')}
      onSwitchToRider={() => setPortalMode('rider')}
    />
  );
}

export default App;
