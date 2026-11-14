import { useState } from 'react';
import { CustomerPortal } from './features/customer/CustomerPortal';
import { VendorPortal } from './features/vendor/VendorPortal';
import { RiderPortal } from './features/rider/RiderPortal';
import { AdminDashboard } from './features/admin/AdminDashboard';

export function App() {
  const [portalMode, setPortalMode] = useState<'customer' | 'vendor' | 'rider' | 'admin'>('customer');

  if (portalMode === 'admin') {
    return (
      <AdminDashboard
        onSwitchToCustomer={() => setPortalMode('customer')}
        onSwitchToVendor={() => setPortalMode('vendor')}
        onSwitchToRider={() => setPortalMode('rider')}
      />
    );
  }

  if (portalMode === 'vendor') {
    return (
      <VendorPortal
        onSwitchToCustomer={() => setPortalMode('customer')}
        onSwitchToRider={() => setPortalMode('rider')}
        onSwitchToAdmin={() => setPortalMode('admin')}
      />
    );
  }

  if (portalMode === 'rider') {
    return (
      <RiderPortal
        onSwitchToCustomer={() => setPortalMode('customer')}
        onSwitchToVendor={() => setPortalMode('vendor')}
        onSwitchToAdmin={() => setPortalMode('admin')}
      />
    );
  }

  return (
    <CustomerPortal
      onSwitchToVendor={() => setPortalMode('vendor')}
      onSwitchToRider={() => setPortalMode('rider')}
      onSwitchToAdmin={() => setPortalMode('admin')}
    />
  );
}

export default App;
