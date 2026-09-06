// src/app/dashboard/page.tsx

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome back, User! 👋</h1>
      <p className="text-gray-400">Manage your profile, view orders, and update settings here.</p>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900 shadow-lg">
          <h3 className="text-gray-400 font-medium">Total Orders</h3>
          <p className="text-3xl font-bold text-indigo-400 mt-2">12</p>
        </div>
        <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900 shadow-lg">
          <h3 className="text-gray-400 font-medium">Pending Deliveries</h3>
          <p className="text-3xl font-bold text-orange-400 mt-2">2</p>
        </div>
        <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900 shadow-lg">
          <h3 className="text-gray-400 font-medium">Saved Items</h3>
          <p className="text-3xl font-bold text-green-400 mt-2">8</p>
        </div>
      </div>
    </div>
  );
}