import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin, 
  Brain, 
  Download,
  Filter,
  RefreshCw,
  Settings,
  User,
  LogOut,
  Search,
  ChevronDown,
  Bell,
  Sparkles,
  Target,
  Zap,
  Shield,
  Database,
  Cpu,
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const TourismSalesPredictor = () => {
  // State Management
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalBookings: 0,
    averageBookingValue: 0,
    salesByDestination: [],
    monthlyTrend: []
  });
  const [predictions, setPredictions] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('all');
  const [selectedModel, setSelectedModel] = useState('xgboost');
  const [marketBasketRules, setMarketBasketRules] = useState([]);

  // Authentication
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Mock API functions
  const api = {
    login: async (credentials) => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockUser = { 
          id: 1, 
          username: credentials.username, 
          role: 'analyst',
          name: 'Alex Johnson',
          avatar: null
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return mockUser;
      } finally {
        setLoading(false);
      }
    },

    getDashboardData: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        totalSales: 2450000,
        totalBookings: 1245,
        averageBookingValue: 1968,
        salesByDestination: [
          { destination: 'Goa Beaches', total_sales: 850000, booking_count: 420, growth: 12 },
          { destination: 'Kerala Backwaters', total_sales: 620000, booking_count: 310, growth: 8 },
          { destination: 'Rajasthan Heritage', total_sales: 580000, booking_count: 285, growth: -2 },
          { destination: 'Himachal Mountains', total_sales: 400000, booking_count: 230, growth: 15 }
        ],
        monthlyTrend: [
          { month: 'Jan', sales: 420000, bookings: 210 },
          { month: 'Feb', sales: 480000, bookings: 240 },
          { month: 'Mar', sales: 520000, bookings: 260 },
          { month: 'Apr', sales: 610000, bookings: 305 },
          { month: 'May', sales: 720000, bookings: 360 },
          { month: 'Jun', sales: 680000, bookings: 340 }
        ]
      };
    },

    getDestinations: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        { id: 1, name: 'Goa Beaches', category: 'beach', country: 'India' },
        { id: 2, name: 'Kerala Backwaters', category: 'cultural', country: 'India' },
        { id: 3, name: 'Rajasthan Heritage', category: 'historical', country: 'India' },
        { id: 4, name: 'Himachal Mountains', category: 'mountain', country: 'India' }
      ];
    },

    generatePredictions: async (modelType, destinationId, days) => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const predictions = [];
        const baseDate = new Date();
        let baseSales = 45000;
        
        for (let i = 1; i <= days; i++) {
          const date = new Date(baseDate);
          date.setDate(date.getDate() + i);
          const trend = 1 + (i * 0.008); // Growing trend
          const seasonal = Math.sin(i * 0.2) * 8000; // Seasonal variation
          
          predictions.push({
            date: date.toISOString().split('T')[0],
            predicted_sales: baseSales * trend + seasonal + Math.random() * 5000,
            predicted_bookings: Math.floor(25 + Math.sin(i * 0.15) * 10 + Math.random() * 8),
            confidence: 0.85 + Math.random() * 0.1
          });
        }
        return predictions;
      } finally {
        setLoading(false);
      }
    },

    getMarketBasketAnalysis: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        { 
          antecedent: ['Airport Transfer'], 
          consequent: ['Travel Insurance'], 
          support: 0.15, 
          confidence: 0.75, 
          lift: 2.3,
          impact: 'High'
        },
        { 
          antecedent: ['Professional Guide'], 
          consequent: ['Photography Package'], 
          support: 0.12, 
          confidence: 0.68, 
          lift: 1.9,
          impact: 'Medium'
        },
        { 
          antecedent: ['Hotel Upgrade'], 
          consequent: ['Local Cuisine Tour'], 
          support: 0.08, 
          confidence: 0.82, 
          lift: 2.8,
          impact: 'High'
        },
        { 
          antecedent: ['Adventure Sports'], 
          consequent: ['Equipment Rental'], 
          support: 0.11, 
          confidence: 0.71, 
          lift: 2.1,
          impact: 'Medium'
        }
      ];
    }
  };

  // Effects
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadDestinations();
      runMarketBasketAnalysis();
    }
  }, [user]);

  // Data Loading Functions
  const loadDashboardData = async () => {
    try {
      const data = await api.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadDestinations = async () => {
    try {
      const data = await api.getDestinations();
      setDestinations(data);
    } catch (error) {
      console.error('Failed to load destinations:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await api.login(loginForm);
    } catch (error) {
      alert('Login failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setActiveTab('dashboard');
  };

  const generatePredictions = async () => {
    try {
      const newPredictions = await api.generatePredictions(selectedModel, selectedDestination, 30);
      setPredictions(newPredictions);
    } catch (error) {
      alert('Failed to generate predictions');
    }
  };

  const runMarketBasketAnalysis = async () => {
    try {
      setLoading(true);
      const rules = await api.getMarketBasketAnalysis();
      setMarketBasketRules(rules);
    } catch (error) {
      alert('Failed to run market basket analysis');
    } finally {
      setLoading(false);
    }
  };

  // Login Component
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-white" size={40} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">TourismAI</h1>
            <p className="text-white/80">Intelligent Sales Prediction Platform</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-3">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-3">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                placeholder="Enter password"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-white text-indigo-600 py-3 px-4 rounded-xl hover:bg-white/90 transition-all duration-200 flex items-center justify-center font-semibold shadow-lg"
            >
              {loading ? <RefreshCw className="animate-spin mr-2" size={20} /> : <Zap className="mr-2" size={20} />}
              Sign In to Dashboard
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-white/70">
            Demo: <code className="bg-white/20 px-2 py-1 rounded">demo</code> / <code className="bg-white/20 px-2 py-1 rounded">demo123</code>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard Component
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-xl mr-3">
                  <Sparkles className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  TourismAI
                </h1>
              </div>
              
              {/* Navigation Tabs */}
              <nav className="flex space-x-1 bg-gray-100/80 rounded-2xl p-1 backdrop-blur-sm">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'predictions', label: 'Predictions', icon: Brain },
                  { id: 'market-basket', label: 'Market Analysis', icon: Target },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-4 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white shadow-sm text-indigo-600'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                    }`}
                  >
                    <tab.icon className="mr-2" size={18} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition duration-200 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center space-x-3 bg-white/80 rounded-2xl px-3 py-2 shadow-sm">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                <ChevronDown className="text-gray-400" size={16} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
                <p className="text-gray-600">Real-time insights and performance metrics</p>
              </div>
              <div className="flex space-x-3">
                <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition duration-200">
                  <Filter size={16} className="mr-2" />
                  Filter
                </button>
                <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition duration-200">
                  <Download size={16} className="mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  title: 'Total Revenue', 
                  value: `$${(dashboardData.totalSales / 100000).toFixed(1)}L`, 
                  change: '+12.5%',
                  trend: 'up',
                  icon: DollarSign, 
                  gradient: 'from-green-500 to-emerald-600',
                  bg: 'bg-gradient-to-br from-green-50 to-emerald-100/50'
                },
                { 
                  title: 'Total Bookings', 
                  value: dashboardData.totalBookings.toLocaleString(), 
                  change: '+8.2%',
                  trend: 'up',
                  icon: Calendar, 
                  gradient: 'from-blue-500 to-cyan-600',
                  bg: 'bg-gradient-to-br from-blue-50 to-cyan-100/50'
                },
                { 
                  title: 'Avg. Booking Value', 
                  value: `$${dashboardData.averageBookingValue.toLocaleString()}`, 
                  change: '+3.1%',
                  trend: 'up',
                  icon: TrendingUp, 
                  gradient: 'from-purple-500 to-violet-600',
                  bg: 'bg-gradient-to-br from-purple-50 to-violet-100/50'
                },
                { 
                  title: 'Active Destinations', 
                  value: destinations.length, 
                  change: '+2',
                  trend: 'up',
                  icon: MapPin, 
                  gradient: 'from-orange-500 to-amber-600',
                  bg: 'bg-gradient-to-br from-orange-50 to-amber-100/50'
                }
              ].map((kpi, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200/50 hover:shadow-md transition duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${kpi.bg}`}>
                      <div className={`bg-gradient-to-r ${kpi.gradient} p-2 rounded-lg`}>
                        <kpi.icon className="text-white" size={20} />
                      </div>
                    </div>
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      kpi.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {kpi.trend === 'up' ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                      {kpi.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Sales Trend */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200/50">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-lg font-medium">Monthly</button>
                    <button className="px-3 py-1 text-xs text-gray-500 rounded-lg font-medium">Quarterly</button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData.monthlyTrend}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: '#666' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#666' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${(value/1000).toFixed(0)}K`, 'Sales']}
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#4F46E5" 
                      strokeWidth={3}
                      fill="url(#colorSales)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Destination Performance */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Destination Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.salesByDestination}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="destination" 
                      tick={{ fontSize: 11, fill: '#666' }}
                      axisLine={false}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#666' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${(value/1000).toFixed(0)}K`, 'Sales']}
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="total_sales" 
                      radius={[6, 6, 0, 0]}
                      barSize={32}
                    >
                      {dashboardData.salesByDestination.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#4F46E5', '#06B6D4', '#10B981', '#F59E0B'][index % 4]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ML Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-8">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Predictions</h2>
                <p className="text-gray-600">Machine learning forecasts and trend analysis</p>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Activity size={16} />
                <span>Model Accuracy: 94.2%</span>
              </div>
            </div>

            {/* Prediction Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm p-6 border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Prediction Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">AI Model</label>
                    <div className="relative">
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                      >
                        <option value="arima">ARIMA (Time Series)</option>
                        <option value="xgboost">XGBoost (Ensemble)</option>
                        <option value="prophet">Facebook Prophet</option>
                        <option value="ensemble">Hybrid Ensemble</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Destination Focus</label>
                    <div className="relative">
                      <select
                        value={selectedDestination}
                        onChange={(e) => setSelectedDestination(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                      >
                        <option value="all">All Destinations</option>
                        {destinations.map(dest => (
                          <option key={dest.id} value={dest.id}>{dest.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={generatePredictions}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center font-semibold shadow-lg disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="animate-spin mr-2" size={20} />
                      ) : (
                        <Brain className="mr-2" size={20} />
                      )}
                      Generate Forecast
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                <Cpu className="mb-3" size={24} />
                <h4 className="font-semibold mb-2">AI Insights</h4>
                <p className="text-sm text-indigo-100 opacity-90">
                  Our models analyze historical patterns, seasonality, and market trends to provide accurate 30-day forecasts.
                </p>
              </div>
            </div>

            {/* Predictions Chart */}
            {predictions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200/50">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">30-Day Sales Forecast</h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
                      <span className="text-gray-600">Predicted Sales</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-gray-600">Predicted Bookings</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={predictions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#666' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#666' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      formatter={(value, name) => [
                        name === 'predicted_sales' ? `$${(value/1000).toFixed(1)}K` : Math.round(value),
                        name === 'predicted_sales' ? 'Predicted Sales' : 'Predicted Bookings'
                      ]}
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted_sales" 
                      stroke="#4F46E5" 
                      strokeWidth={3}
                      dot={false}
                      name="Predicted Sales"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted_bookings" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={false}
                      name="Predicted Bookings"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Market Basket Analysis Tab */}
        {activeTab === 'market-basket' && (
          <div className="space-y-8">
            {/* Page Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Market Basket Analysis</h2>
                <p className="text-gray-600">Customer behavior patterns and product associations</p>
              </div>
              <button
                onClick={runMarketBasketAnalysis}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition duration-200 font-medium"
              >
                {loading ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Target className="mr-2" size={16} />}
                Refresh Analysis
              </button>
            </div>

            {/* Insights Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Strong Associations</h4>
                  <TrendingUp className="text-green-500" size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600 mt-1">High-confidence rules</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Avg. Confidence</h4>
                  <Shield className="text-blue-500" size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-900">76%</p>
                <p className="text-sm text-gray-600 mt-1">Rule accuracy</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Top Impact</h4>
                  <Zap className="text-orange-500" size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-900">2.8x</p>
                <p className="text-sm text-gray-600 mt-1">Maximum lift</p>
              </div>
            </div>

            {/* Association Rules Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100/50">
                <h3 className="text-lg font-semibold text-gray-900">Product Association Rules</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        If Customer Buys
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        They Also Buy
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Support
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Lift
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Impact
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {marketBasketRules.map((rule, index) => (
                      <tr key={index} className="hover:bg-gray-50/50 transition duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-900">{rule.antecedent.join(', ')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-900">{rule.consequent.join(', ')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {(rule.support * 100).toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {(rule.confidence * 100).toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{rule.lift.toFixed(2)}x</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rule.impact === 'High' 
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {rule.impact}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Page Header */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h2>
              <p className="text-gray-600">Configure your analytics environment</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200/50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">System Configuration</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Database Connection</label>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-300">
                        <div className="flex items-center space-x-3">
                          <Database className="text-green-500" size={20} />
                          <div>
                            <p className="font-medium text-gray-900">MySQL Database</p>
                            <p className="text-sm text-gray-600">Connected to production server</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-600 font-medium">Live</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">AI Models Status</label>
                      <div className="space-y-3">
                        {[
                          { name: 'ARIMA Time Series', status: 'active', accuracy: '92%' },
                          { name: 'XGBoost Ensemble', status: 'active', accuracy: '94%' },
                          { name: 'Apriori Algorithm', status: 'active', accuracy: '89%' },
                          { name: 'Neural Network', status: 'training', accuracy: '85%' }
                        ].map((model, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-300">
                            <div className="flex items-center space-x-3">
                              <Cpu className="text-indigo-500" size={16} />
                              <span className="font-medium text-gray-900">{model.name}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600">Accuracy: {model.accuracy}</span>
                              <div className={`w-2 h-2 rounded-full ${
                                model.status === 'active' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                              }`}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                  <Shield className="mb-3" size={24} />
                  <h4 className="font-semibold mb-2">System Health</h4>
                  <p className="text-sm text-indigo-100 opacity-90 mb-4">
                    All systems operational with optimal performance metrics.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span className="font-medium">24%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Memory</span>
                      <span className="font-medium">1.2GB / 4GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Response Time</span>
                      <span className="font-medium">128ms</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200/50">
                  <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Backup Database</span>
                        <Database size={16} className="text-gray-400" />
                      </div>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Update Models</span>
                        <Cpu size={16} className="text-gray-400" />
                      </div>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Clear Cache</span>
                        <RefreshCw size={16} className="text-gray-400" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourismSalesPredictor;