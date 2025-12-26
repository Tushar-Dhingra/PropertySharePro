/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import type { DashboardAnalytics } from "../types";
import { TrendingUp, TrendingDown, Home, Upload, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: DashboardAnalytics;
      }>("/analytics/dashboard");
      return response.data.data;
    },
  });

  const { data: dailyData } = useQuery({
    queryKey: ["daily-uploads"],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: any[] }>(
        "/analytics/daily-uploads"
      );
      return response.data.data;
    },
  });

  const { data: weeklyData } = useQuery({
    queryKey: ["weekly-trends"],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: any[] }>(
        "/analytics/weekly-trends"
      );
      return response.data.data;
    },
  });

  if (analyticsLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Properties",
      value: analytics?.totalProperties || 0,
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Daily Uploads",
      value: analytics?.dailyUploads || 0,
      icon: Upload,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Weekly Uploads",
      value: analytics?.weeklyUploads || 0,
      icon: Upload,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: analytics?.weeklyTrend,
    },
    ...(isAdmin
      ? [
          {
            title: "Active Employees",
            value: analytics?.activeEmployees || 0,
            icon: Users,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Welcome back! Here's your property overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">
                        {stat.value}
                      </p>
                      {stat.trend !== undefined && (
                        <div className="flex items-center mt-2">
                          {stat.trend >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              stat.trend >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {Math.abs(stat.trend).toFixed(1)}%
                          </span>
                          <span className="text-xs text-slate-500 ml-1">
                            from last week
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Upload Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="uploads" fill="#2D4F39" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Upload Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="uploads"
                    stroke="#2D4F39"
                    strokeWidth={2}
                    dot={{ fill: "#2D4F39", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {isAdmin && (
          <>
            {/* Quick Actions */}
            <div className="mt-8 mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate("/users")}
                >
                  <CardContent className="p-6 flex items-center space-x-4">
                    <div className="p-3 bg-primary-100 rounded-lg text-primary-600">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Add Employee
                      </p>
                      <p className="text-sm text-slate-500">
                        Create new account
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate("/properties")}
                >
                  <CardContent className="p-6 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                      <Home className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        View All Properties
                      </p>
                      <p className="text-sm text-slate-500">Manage listings</p>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate("/upload")}
                >
                  <CardContent className="p-6 flex items-center space-x-4">
                    <div className="p-3 bg-green-50 rounded-lg text-green-600">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Upload Property
                      </p>
                      <p className="text-sm text-slate-500">Add new listing</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Generate Reports
                      </p>
                      <p className="text-sm text-slate-500">Coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Employee Statistics */}
            <EmployeeStatsTable />
          </>
        )}
      </div>
    </div>
  );
};

const EmployeeStatsTable: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");
  const [timeFilter, setTimeFilter] = React.useState<"today" | "week">("today");
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["employee-stats"],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: any[] }>(
        "/analytics/employee-stats"
      );
      return response.data.data;
    },
  });

  const filteredStats = React.useMemo(() => {
    if (!stats) return [];

    let result = [...stats];

    // Search
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (employee) =>
          employee.name.toLowerCase().includes(lowerSearch) ||
          employee.email.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [stats, search, sortConfig]);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  if (isLoading) return <div>Loading stats...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Employee Statistics</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search employees..."
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as "today" | "week")}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
          <select className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Name</option>
            <option>Performance</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => handleSort("name")}
                >
                  Employee{" "}
                  {sortConfig?.key === "name"
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : "↑↓"}
                </th>

                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => handleSort("today")}
                >
                  Today{" "}
                  {sortConfig?.key === "today" ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : "↑↓"}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => handleSort("thisWeek")}
                >
                  This Week{" "}
                  {sortConfig?.key === "thisWeek" ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : "↑↓"}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => handleSort("total")}
                >
                  Total{" "}
                  {sortConfig?.key === "total" ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : "↑↓"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredStats?.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {employee.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {employee.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {employee.today}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {employee.thisWeek}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {employee.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        employee.performance === "excellent"
                          ? "bg-green-100 text-green-800"
                          : employee.performance === "good"
                          ? "bg-blue-100 text-blue-800"
                          : employee.performance === "average"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {employee.performance.charAt(0).toUpperCase() +
                        employee.performance.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate("/users")}
                      className="hover:bg-orange-200 rounded-2xl p-3 text-primary-600 hover:text-primary-900 hover:cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
