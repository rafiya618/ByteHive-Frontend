import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import axios from "axios";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalCommunities: 0,
    totalReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API calls to your microservices
        // const usersRes = await axios.get("BASE_URL/api/users/count");
        // const postsRes = await axios.get("BASE_URL/api/posts/count");
        // const communitiesRes = await axios.get("BASE_URL/api/communities/count");
        // const reportsRes = await axios.get("BASE_URL/api/reports/count");

        // Mock data for now
        setMetrics({
          totalUsers: 11,
          totalPosts: 67,
          totalCommunities: 23,
          totalReports: 5,
        });
      } catch (err) {
        setError(err.message || "Failed to fetch metrics");
        console.error("Error fetching metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const MetricCard = ({ title, value, icon, bgColor }) => (
    <div className="bg-dark-indigo border border-navbar-border rounded-lg p-6 hover:bg-dark-indigo/80 transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-white font-fenix text-3xl">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <span className="material-icons text-periwinkle text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-rich-black flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-fenix text-[28px] text-white font-normal mb-2">
            Dashboard
          </h2>
          <p className="text-gray-400 text-sm">Welcome to the admin panel</p>
        </div>

        {/* Metrics Grid */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-12">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Users"
              value={metrics.totalUsers}
              icon="person"
              bgColor="bg-medium-slate-blue/20"
            />
            <MetricCard
              title="Total Posts"
              value={metrics.totalPosts}
              icon="article"
              bgColor="bg-celadon/20"
            />
            <MetricCard
              title="Total Communities"
              value={metrics.totalCommunities}
              icon="groups"
              bgColor="bg-periwinkle/20"
            />
            <MetricCard
              title="Reports"
              value={metrics.totalReports}
              icon="flag"
              bgColor="bg-pinkish/20"
            />
          </div>
        )}

        {/* Recent Activity Section */}
        <div className="bg-dark-indigo border border-navbar-border rounded-lg p-6">
          <h3 className="text-white font-fenix text-lg font-normal mb-4">
            Recent Activity
          </h3>
          <div className="text-gray-400 text-sm text-center py-12">
            Activity data will be displayed here
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
