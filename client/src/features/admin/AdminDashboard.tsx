import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Store,
  Users,
  Bike,
  LifeBuoy,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  DollarSign,
  Package,
  Star,
  RefreshCw,
  Plus,
  Building,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

interface AdminDashboardProps {
  onSwitchToCustomer: () => void;
  onSwitchToVendor: () => void;
  onSwitchToRider: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSwitchToCustomer,
  onSwitchToVendor,
  onSwitchToRider,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'support' | 'users'>('overview');
  const [loading, setLoading] = useState(true);

  // Executive Stats State
  const [stats, setStats] = useState<any>({
    totalSales: 754500,
    totalOrders: 342,
    completedDeliveries: 318,
    activeRestaurants: 5,
    pendingRestaurants: 1,
    totalUsers: 254,
    activeRiders: 9,
    openSupportTickets: 3,
    resolvedSupportTickets: 45,
    averageOrderValue: 2206,
    salesByDay: [
      { day: 'Mon', sales: 78500, orders: 42 },
      { day: 'Tue', sales: 92400, orders: 48 },
      { day: 'Wed', sales: 86200, orders: 44 },
      { day: 'Thu', sales: 104500, orders: 53 },
      { day: 'Fri', sales: 135800, orders: 67 },
      { day: 'Sat', sales: 148900, orders: 74 },
      { day: 'Sun', sales: 108200, orders: 64 },
    ],
    ordersByStatus: {
      pending: 4,
      confirmed: 6,
      preparing: 8,
      ready_for_pickup: 3,
      out_for_delivery: 3,
      delivered: 318,
    },
    topRestaurants: [],
  });

  // Restaurants Governance State
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [restaurantFilter, setRestaurantFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [updatingRestaurantId, setUpdatingRestaurantId] = useState<string | null>(null);

  // Support & Complaint Queue State
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [supportCounts, setSupportCounts] = useState({ pending: 0, reviewed: 0, resolved: 0 });
  const [supportStatusFilter, setSupportStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('pending');
  const [supportPriorityFilter, setSupportPriorityFilter] = useState<string>('all');
  const [supportSearch, setSupportSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketResolutionInput, setTicketResolutionInput] = useState('');
  const [ticketAdminNotesInput, setTicketAdminNotesInput] = useState('');
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);

  // User Governance State
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'manager',
    password: '',
  });

  // Notification Banner
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();

    // Socket.IO real-time administrative listener
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('join_room', 'admin');

    const handleNewTicket = (ticket: any) => {
      setAlertBanner(`New support inquiry received: ${ticket.subject} (${ticket.ticketId})`);
      setSupportTickets((prev) => [ticket, ...prev]);
      setSupportCounts((prev) => ({ ...prev, pending: prev.pending + 1 }));
      setTimeout(() => setAlertBanner(null), 6000);
    };

    const handleTicketUpdated = (updated: any) => {
      setSupportTickets((prev) =>
        prev.map((t) => (t._id === updated._id || t.ticketId === updated.ticketId ? updated : t))
      );
    };

    socket.on('new_support_ticket', handleNewTicket);
    socket.on('support_ticket_updated', handleTicketUpdated);

    return () => {
      socket.off('new_support_ticket', handleNewTicket);
      socket.off('support_ticket_updated', handleTicketUpdated);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, restRes, supportRes, usersRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/restaurants'),
        api.get('/support'),
        api.get('/admin/users'),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setStats(statsRes.value.data);
      }
      if (restRes.status === 'fulfilled' && restRes.value.data?.restaurants) {
        setRestaurants(restRes.value.data.restaurants);
      }
      if (supportRes.status === 'fulfilled' && supportRes.value.data) {
        setSupportTickets(supportRes.value.data.tickets || []);
        setSupportCounts({
          pending: supportRes.value.data.pendingCount || 0,
          reviewed: supportRes.value.data.reviewedCount || 0,
          resolved: supportRes.value.data.resolvedCount || 0,
        });
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.data?.users) {
        setUsers(usersRes.value.data.users);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  // Restaurant Governance Actions
  const handleUpdateRestaurantStatus = async (id: string, newStatus: 'active' | 'pending' | 'suspended') => {
    try {
      setUpdatingRestaurantId(id);
      await api.patch(`/admin/restaurants/${id}/status`, { status: newStatus });
      setRestaurants((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
      );
      setAlertBanner(`Restaurant status updated to "${newStatus.toUpperCase()}"`);
      setTimeout(() => setAlertBanner(null), 4000);
    } catch (err) {
      console.error('Error updating restaurant status', err);
    } finally {
      setUpdatingRestaurantId(null);
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      setUpdatingRestaurantId(id);
      await api.patch(`/admin/restaurants/${id}/status`, { featured: !currentFeatured });
      setRestaurants((prev) =>
        prev.map((r) => (r._id === id ? { ...r, featured: !currentFeatured } : r))
      );
    } catch (err) {
      console.error('Error toggling featured status', err);
    } finally {
      setUpdatingRestaurantId(null);
    }
  };

  // Support Ticket Actions
  const handleSelectTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setTicketResolutionInput(ticket.resolution || '');
    setTicketAdminNotesInput(ticket.adminNotes || '');
  };

  const handleUpdateTicket = async (newStatus?: string) => {
    if (!selectedTicket) return;
    try {
      setIsUpdatingTicket(true);
      const payload: any = {
        resolution: ticketResolutionInput,
        adminNotes: ticketAdminNotesInput,
      };
      if (newStatus) payload.status = newStatus;

      const res = await api.patch(`/support/${selectedTicket._id}`, payload);
      const updated = res.data.ticket;

      setSelectedTicket(updated);
      setSupportTickets((prev) =>
        prev.map((t) => (t._id === updated._id || t.ticketId === updated.ticketId ? updated : t))
      );

      // Recalculate counts
      const pending = supportTickets.filter((t) => (t._id === updated._id ? updated.status === 'pending' : t.status === 'pending')).length;
      const reviewed = supportTickets.filter((t) => (t._id === updated._id ? updated.status === 'reviewed' : t.status === 'reviewed')).length;
      const resolved = supportTickets.filter((t) => (t._id === updated._id ? updated.status === 'resolved' : t.status === 'resolved')).length;
      setSupportCounts({ pending, reviewed, resolved });

      setAlertBanner(`Ticket ${updated.ticketId} updated successfully`);
      setTimeout(() => setAlertBanner(null), 4000);
    } catch (err) {
      console.error('Error updating support ticket', err);
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  // User Governance Actions
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      setAlertBanner('User role updated successfully');
      setTimeout(() => setAlertBanner(null), 4000);
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/admin/users/${userId}/role`, { status: newStatus });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u)));
      setAlertBanner(`User account marked as ${newStatus}`);
      setTimeout(() => setAlertBanner(null), 4000);
    } catch (err) {
      console.error('Failed to toggle user status', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email) return;

    try {
      const res = await api.post('/admin/users', newUserData);
      if (res.data.user) {
        setUsers((prev) => [res.data.user, ...prev]);
        setIsAddUserModalOpen(false);
        setNewUserData({ name: '', email: '', phone: '', role: 'manager', password: '' });
        setAlertBanner('New staff user created successfully');
        setTimeout(() => setAlertBanner(null), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create user');
    }
  };

  // Filtering Logic
  const filteredRestaurants = restaurants.filter((r) => {
    const matchesStatus = restaurantFilter === 'all' || r.status === restaurantFilter;
    const matchesSearch =
      r.name.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
      r.address?.city?.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
      r.cuisine?.some((c: string) => c.toLowerCase().includes(restaurantSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const filteredSupportTickets = supportTickets.filter((t) => {
    const matchesStatus = supportStatusFilter === 'all' || t.status === supportStatusFilter;
    const matchesPriority = supportPriorityFilter === 'all' || t.priority === supportPriorityFilter;
    const matchesSearch =
      t.ticketId.toLowerCase().includes(supportSearch.toLowerCase()) ||
      t.name.toLowerCase().includes(supportSearch.toLowerCase()) ||
      t.subject.toLowerCase().includes(supportSearch.toLowerCase()) ||
      (t.orderNumber && t.orderNumber.toLowerCase().includes(supportSearch.toLowerCase()));
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.toLowerCase().includes(userSearch.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-20">
      {/* Top Administrative Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white truncate">Platform Governance</h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider shrink-0">
                  Admin Console
                </span>
              </div>
              <p className="hidden sm:block text-[11px] sm:text-xs text-slate-400 truncate">Executive Analytics • Partner Governance • Support Queues</p>
            </div>
          </div>

          {/* Quick Portal Switcher */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onSwitchToCustomer}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Switch to Customer App"
            >
              Customer<span className="hidden md:inline"> App</span>
            </button>
            <button
              type="button"
              onClick={onSwitchToVendor}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Switch to Vendor Operations Hub"
            >
              Vendor<span className="hidden md:inline"> Hub</span>
            </button>
            <button
              type="button"
              onClick={onSwitchToRider}
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Switch to Rider Logistics Fleet"
            >
              Rider<span className="hidden md:inline"> Fleet</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Smooth Responsive Touch-Scrollable) */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-1.5 sm:gap-2 border-t border-slate-800/60 overflow-x-auto py-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Executive Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('restaurants')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${
              activeTab === 'restaurants'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Restaurants<span className="hidden sm:inline"> & Approvals</span></span>
            {stats.pendingRestaurants > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold shrink-0">
                {stats.pendingRestaurants}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${
              activeTab === 'support'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Support<span className="hidden sm:inline"> & Complaint Queues</span></span>
            {supportCounts.pending > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold animate-pulse shrink-0">
                {supportCounts.pending}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Users<span className="hidden sm:inline"> & Role Governance</span></span>
          </button>
        </div>
      </header>

      {/* Real-time Alert Toast */}
      {alertBanner && (
        <div className="bg-indigo-600/90 text-white border-b border-indigo-400/30 px-4 py-2.5 text-center text-xs font-medium backdrop-blur-md shadow-lg flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{alertBanner}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full flex-1">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading executive governance data...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: EXECUTIVE ANALYTICS */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Executive KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-semibold">Total Revenue</span>
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-xl font-extrabold text-white">
                      PKR {stats.totalSales.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                      <span>↑ 14.8%</span>
                      <span className="text-slate-500">vs last week</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-semibold">Completed Deliveries</span>
                      <Package className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="text-xl font-extrabold text-white">
                      {stats.completedDeliveries}
                    </div>
                    <div className="text-[11px] text-sky-400 mt-1 flex items-center gap-1">
                      <span>{stats.totalOrders} total orders</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-semibold">Active Restaurants</span>
                      <Store className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-xl font-extrabold text-white">
                      {stats.activeRestaurants}
                    </div>
                    <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                      <span>{stats.pendingRestaurants} pending review</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-semibold">Platform Users</span>
                      <Users className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="text-xl font-extrabold text-white">{stats.totalUsers}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Verified accounts</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-semibold">Active Riders</span>
                      <Bike className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="text-xl font-extrabold text-white">{stats.activeRiders}</div>
                    <div className="text-[11px] text-teal-400 mt-1">On-duty fleet</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-semibold">Support Queue</span>
                      <LifeBuoy className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="text-xl font-extrabold text-white">
                      {supportCounts.pending}
                    </div>
                    <div className="text-[11px] text-rose-400 mt-1">
                      {supportCounts.reviewed} in review
                    </div>
                  </div>
                </div>

                {/* 7-Day Revenue Trend & Pipeline Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Chart Visualization */}
                  <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-sm font-bold text-white">Weekly Revenue & Order Trajectory</h2>
                        <p className="text-xs text-slate-400">Daily gross volume across all partner restaurants</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                        Avg Ticket: PKR {stats.averageOrderValue?.toLocaleString()}
                      </span>
                    </div>

                    {/* CSS Bar Chart */}
                    <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
                      {stats.salesByDay.map((d: any, idx: number) => {
                        const maxSales = Math.max(...stats.salesByDay.map((item: any) => item.sales || 1), 160000);
                        const heightPct = Math.min(100, Math.round((d.sales / maxSales) * 100));
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                              Rs. {d.sales.toLocaleString()}
                            </div>
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-indigo-700 to-indigo-500 group-hover:from-indigo-600 group-hover:to-violet-400 transition shadow-lg shadow-indigo-600/20"
                            />
                            <span className="text-xs font-bold text-slate-300">{d.day}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{d.orders} ord</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Status Distribution */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-white mb-1">Live Order Status Pipeline</h2>
                      <p className="text-xs text-slate-400 mb-4">Active fulfilment stages across city hubs</p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-slate-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            Placed / Pending Kitchen
                          </span>
                          <span className="font-bold font-mono text-white">
                            {stats.ordersByStatus?.pending || 4}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-slate-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                            Kitchen Preparing
                          </span>
                          <span className="font-bold font-mono text-white">
                            {stats.ordersByStatus?.preparing || 8}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-slate-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                            Ready for Rider Pickup
                          </span>
                          <span className="font-bold font-mono text-white">
                            {stats.ordersByStatus?.ready_for_pickup || 3}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-slate-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                            Out for Delivery (Live GPS)
                          </span>
                          <span className="font-bold font-mono text-white">
                            {stats.ordersByStatus?.out_for_delivery || 3}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                          <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            Delivered Successfully
                          </span>
                          <span className="font-bold font-mono text-emerald-400">
                            {stats.completedDeliveries}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>Fulfillment Health</span>
                      <span className="text-emerald-400 font-semibold">98.4% On-Time</span>
                    </div>
                  </div>
                </div>

                {/* Top Partner Performance */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                  <h2 className="text-sm font-bold text-white mb-3">Top Partner Restaurants By Volume</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Restaurant</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Rating</th>
                          <th className="py-2.5 px-3">Orders</th>
                          <th className="py-2.5 px-3">Revenue (PKR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {stats.topRestaurants.map((r: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-800/30 transition">
                            <td className="py-3 px-3 font-semibold text-white">{r.name}</td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  r.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="flex items-center gap-1 text-amber-400 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {r.rating}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-200">{r.orders}</td>
                            <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                              Rs. {r.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RESTAURANT APPROVALS & GOVERNANCE */}
            {activeTab === 'restaurants' && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search restaurant or city..."
                      value={restaurantSearch}
                      onChange={(e) => setRestaurantSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setRestaurantFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        restaurantFilter === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      All ({restaurants.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRestaurantFilter('pending')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        restaurantFilter === 'pending'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                      }`}
                    >
                      Pending Approvals (
                      {restaurants.filter((r) => r.status === 'pending').length}
                      )
                    </button>
                    <button
                      type="button"
                      onClick={() => setRestaurantFilter('active')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        restaurantFilter === 'active'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setRestaurantFilter('suspended')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        restaurantFilter === 'suspended'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                      }`}
                    >
                      Suspended
                    </button>
                  </div>
                </div>

                {/* Restaurants Governance Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRestaurants.map((rest) => (
                    <div
                      key={rest._id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between hover:border-slate-700 transition"
                    >
                      <div>
                        {/* Header Image & Badges */}
                        <div className="relative h-32 rounded-xl overflow-hidden mb-3 bg-slate-950">
                          <img
                            src={rest.image}
                            alt={rest.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                rest.status === 'active'
                                  ? 'bg-emerald-500/90 text-white backdrop-blur-md'
                                  : rest.status === 'pending'
                                  ? 'bg-amber-500/90 text-slate-950 backdrop-blur-md'
                                  : 'bg-rose-500/90 text-white backdrop-blur-md'
                              }`}
                            >
                              {rest.status || 'active'}
                            </span>
                            {rest.featured && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white shadow">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-amber-300 backdrop-blur-md flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-300" />
                            <span>{rest.rating || 4.5}</span>
                          </div>
                        </div>

                        {/* Title & Address */}
                        <h3 className="text-sm font-bold text-white mb-1">{rest.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                          {rest.description}
                        </p>

                        <div className="text-[11px] text-slate-400 space-y-1 mb-4">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {rest.address?.city || 'Islamabad'}, {rest.address?.areaOrLandmark || 'Capital Area'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">Cuisine:</span>
                            <span className="text-slate-300 font-medium">
                              {rest.cuisine?.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Administrative Action Controls */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        {rest.status === 'pending' ? (
                          <button
                            type="button"
                            disabled={updatingRestaurantId === rest._id}
                            onClick={() => handleUpdateRestaurantStatus(rest._id, 'active')}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Partner</span>
                          </button>
                        ) : rest.status === 'active' ? (
                          <button
                            type="button"
                            disabled={updatingRestaurantId === rest._id}
                            onClick={() => handleUpdateRestaurantStatus(rest._id, 'suspended')}
                            className="py-1.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Suspend</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={updatingRestaurantId === rest._id}
                            onClick={() => handleUpdateRestaurantStatus(rest._id, 'active')}
                            className="py-1.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reactivate</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(rest._id, !!rest.featured)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition ${
                            rest.featured
                              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/40'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {rest.featured ? 'Featured ★' : 'Promote'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: SUPPORT & COMPLAINT QUEUE */}
            {activeTab === 'support' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Tickets List Column */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Status Badges & Search */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSupportStatusFilter('pending')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            supportStatusFilter === 'pending'
                              ? 'bg-rose-600 text-white shadow-md'
                              : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
                          }`}
                        >
                          <span>Pending</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 font-mono">
                            {supportCounts.pending}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSupportStatusFilter('reviewed')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            supportStatusFilter === 'reviewed'
                              ? 'bg-amber-600 text-white shadow-md'
                              : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                          }`}
                        >
                          <span>Reviewed</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 font-mono">
                            {supportCounts.reviewed}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSupportStatusFilter('resolved')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            supportStatusFilter === 'resolved'
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                          }`}
                        >
                          <span>Resolved</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 font-mono">
                            {supportCounts.resolved}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSupportStatusFilter('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            supportStatusFilter === 'all'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          All ({supportTickets.length})
                        </button>
                      </div>

                      {/* Priority selector */}
                      <select
                        aria-label="Filter tickets by priority"
                        value={supportPriorityFilter}
                        onChange={(e) => setSupportPriorityFilter(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="all">All Priorities</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div className="relative w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search by ticket ID, customer name, subject, or order #..."
                        value={supportSearch}
                        onChange={(e) => setSupportSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Tickets List */}
                  <div className="space-y-3">
                    {filteredSupportTickets.length === 0 ? (
                      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                        No support tickets matching current filter criteria.
                      </div>
                    ) : (
                      filteredSupportTickets.map((ticket) => (
                        <div
                          key={ticket._id || ticket.ticketId}
                          onClick={() => handleSelectTicket(ticket)}
                          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                            selectedTicket?._id === ticket._id
                              ? 'bg-slate-800/80 border-indigo-500 shadow-md shadow-indigo-500/10'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs font-bold text-indigo-400">
                                  {ticket.ticketId}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    ticket.status === 'pending'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : ticket.status === 'reviewed'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  }`}
                                >
                                  {ticket.status}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    ticket.priority === 'urgent'
                                      ? 'bg-rose-600 text-white'
                                      : ticket.priority === 'high'
                                      ? 'bg-amber-500/20 text-amber-300'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {ticket.priority}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                                  {ticket.userType}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-white line-clamp-1">
                                {ticket.subject}
                              </h4>
                            </div>

                            <div className="text-right text-[11px] text-slate-400 shrink-0">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {new Date(ticket.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2">{ticket.message}</p>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                            <span>From: {ticket.name} ({ticket.email})</span>
                            {ticket.orderNumber && (
                              <span className="font-mono text-indigo-300">
                                Order: {ticket.orderNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Ticket Details & Resolution Panel */}
                <div className="lg:col-span-5">
                  {selectedTicket ? (
                    <div className="sticky top-28 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                      {/* Ticket Header */}
                      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono font-bold text-indigo-400">
                              {selectedTicket.ticketId}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                selectedTicket.status === 'pending'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : selectedTicket.status === 'reviewed'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {selectedTicket.status}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white">{selectedTicket.subject}</h3>
                        </div>
                      </div>

                      {/* Ticket Meta */}
                      <div className="text-xs space-y-1.5 text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Sender:</span>
                          <span className="font-medium">
                            {selectedTicket.name} ({selectedTicket.userType})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Contact:</span>
                          <span>{selectedTicket.email} • {selectedTicket.phone || 'N/A'}</span>
                        </div>
                        {selectedTicket.orderNumber && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Associated Order:</span>
                            <span className="font-mono font-bold text-indigo-400">
                              {selectedTicket.orderNumber}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">Category / Priority:</span>
                          <span className="capitalize">
                            {selectedTicket.category.replace('_', ' ')} • {selectedTicket.priority}
                          </span>
                        </div>
                      </div>

                      {/* Inquiry Message */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Inquiry / Complaint Description
                        </label>
                        <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-200 border border-slate-800 whitespace-pre-wrap leading-relaxed">
                          {selectedTicket.message}
                        </div>
                      </div>

                      {/* Internal Admin Notes */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Internal Governance Notes
                        </label>
                        <textarea
                          rows={2}
                          value={ticketAdminNotesInput}
                          onChange={(e) => setTicketAdminNotesInput(e.target.value)}
                          placeholder="Add private staff audit notes or rider fleet coordination..."
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Resolution Message to Customer */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Customer Resolution & Audit Record
                        </label>
                        <textarea
                          rows={3}
                          value={ticketResolutionInput}
                          onChange={(e) => setTicketResolutionInput(e.target.value)}
                          placeholder="Explain refund issued, credit credited, or kitchen confirmation..."
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Status Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isUpdatingTicket}
                            onClick={() => handleUpdateTicket('reviewed')}
                            className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-amber-600/20"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Mark Reviewed</span>
                          </button>
                          <button
                            type="button"
                            disabled={isUpdatingTicket}
                            onClick={() => handleUpdateTicket('resolved')}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolve Complaint</span>
                          </button>
                        </div>
                        {selectedTicket.status === 'resolved' && (
                          <button
                            type="button"
                            disabled={isUpdatingTicket}
                            onClick={() => handleUpdateTicket('pending')}
                            className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                          >
                            Reopen Inquiry (Set Pending)
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                      <LifeBuoy className="w-8 h-8 text-slate-600" />
                      <p>Select any ticket from the left queue to view details, assign staff, and submit resolutions.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: USER & ROLE GOVERNANCE */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {/* Search & New User Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search accounts by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      aria-label="Filter users by role"
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Executive Admin</option>
                      <option value="manager">Operations Manager</option>
                      <option value="rider">Rider</option>
                      <option value="kitchen">Kitchen / Vendor</option>
                      <option value="customer">Customer</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setIsAddUserModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Staff Account</span>
                    </button>
                  </div>
                </div>

                {/* Users Table */}
                <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3 px-4">User / Contact</th>
                          <th className="py-3 px-4">Role Assignment</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Joined Date</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-slate-800/30 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white">{user.name}</div>
                              <div className="text-[11px] text-slate-400">
                                {user.email} {user.phone ? `• ${user.phone}` : ''}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                aria-label={`Role for ${user.name}`}
                                value={user.role}
                                onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                                className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-indigo-300 focus:outline-none focus:border-indigo-500"
                              >
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="rider">Rider</option>
                                <option value="kitchen">Kitchen Staff</option>
                                <option value="waiter">Waiter</option>
                                <option value="customer">Customer</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  user.status === 'suspended'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {user.status || 'active'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(user._id, user.status || 'active')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                                  user.status === 'suspended'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                                }`}
                              >
                                {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add User Modal */}
                {isAddUserModalOpen && (
                  <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
                      <h3 className="text-base font-bold text-white mb-1">Create Staff Account</h3>
                      <p className="text-xs text-slate-400 mb-4">
                        Provision administrative, managerial, or fleet roles.
                      </p>

                      <form onSubmit={handleCreateUser} className="space-y-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={newUserData.name}
                            onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                            placeholder="e.g. Asad Malik"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            value={newUserData.email}
                            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                            placeholder="staff@restaurant.local"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-300 block mb-1">Phone Number</label>
                          <input
                            type="text"
                            value={newUserData.phone}
                            onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                            placeholder="0300-1234567"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-300 block mb-1">Platform Role</label>
                          <select
                            aria-label="Platform Role"
                            value={newUserData.role}
                            onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="admin">Executive Admin</option>
                            <option value="manager">Operations Manager</option>
                            <option value="kitchen">Kitchen Coordinator</option>
                            <option value="rider">Fleet Dispatch Rider</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-300 block mb-1">Initial Password</label>
                          <input
                            type="password"
                            value={newUserData.password}
                            onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                            placeholder="Defaults to Password123!"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => setIsAddUserModalOpen(false)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/20"
                          >
                            Provision Account
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
