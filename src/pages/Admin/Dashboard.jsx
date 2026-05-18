import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getRequiredUrl } from "../../utils/env";

const ADMIN_BASE = getRequiredUrl("VITE_ADMIN_SERVICE_URL");

const MetricCard = ({ title, value, icon, bgColor }) => (
  <div className="bg-dark-indigo border border-navbar-border rounded-lg p-6 hover:bg-dark-indigo/80 transition">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
        <p className="text-white font-fenix text-3xl">{Number(value || 0).toLocaleString()}</p>
      </div>
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <span className="material-icons text-periwinkle text-2xl">{icon}</span>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalCommunities: 0,
    totalReports: 0,
  });

  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [statsRes, activityRes] = await Promise.all([
          axios.get(`${ADMIN_BASE}/api/admin/dashboard/stats`),
          axios.get(`${ADMIN_BASE}/api/admin/dashboard/activity`)
        ]);

        const data = statsRes?.data?.data || {};
        setMetrics({
          totalUsers: data.totalUsers ?? 0,
          totalPosts: data.totalPosts ?? 0,
          totalCommunities: data.totalCommunities ?? 0,
          totalReports: data.totalReports ?? 0,
        });

        setActivity(activityRes?.data?.data || []);
      } catch (err) {
        console.error("Admin dashboard fetch failed", err);
        setError(err?.response?.data?.message || err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-rich-black flex">
      <AdminSidebar />

      <div className="ml-64 flex-1 p-8">
        <div className="mb-6">
          <h2 className="font-fenix text-[28px] text-white font-normal mb-2">Dashboard</h2>
          {/* <p className="text-gray-400 text-sm">Live stats and recent activity</p> */}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading dashboard...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard title="Total Users" value={metrics.totalUsers} icon="person" bgColor="bg-medium-slate-blue/20" />
              <MetricCard title="Total Posts" value={metrics.totalPosts} icon="article" bgColor="bg-celadon/20" />
              <MetricCard title="Total Communities" value={metrics.totalCommunities} icon="groups" bgColor="bg-periwinkle/20" />
              <MetricCard title="Reports" value={metrics.totalReports} icon="flag" bgColor="bg-pinkish/20" />
            </div>

            {/* <div className="bg-dark-indigo border border-navbar-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-fenix text-lg font-normal">Recent Activity</h3>
                <span className="text-xs text-gray-400">Latest {activity.length || 0}</span>
              </div>
              {activity.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-12">No activity yet</div>
              ) : (
                <div className="space-y-3">
                  {activity.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-rich-black border border-navbar-border rounded-md px-4 py-3">
                      <span className="material-icons text-periwinkle text-base mt-[2px]">history</span>
                      <div>
                        <p className="text-white text-sm">{item.what}</p>
                        <p className="text-gray-400 text-xs">{item.who} · {item.when}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div> */}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
