import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const Reports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('appointments');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [appointmentData, setAppointmentData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [petStats, setPetStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchReports();
    }
  }, [dateRange, reportType]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (reportType === 'appointments') {
        const res = await axios.get(`http://localhost:5000/api/reports/appointments?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
        setAppointmentData(res.data);
      } else if (reportType === 'revenue') {
        const res = await axios.get('http://localhost:5000/api/reports/revenue');
        setRevenueData(res.data);
      } else if (reportType === 'pets') {
        const res = await axios.get('http://localhost:5000/api/reports/pets');
        setPetStats(res.data);
      }
    } catch (err) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const prepareAppointmentChartData = () => {
    if (!appointmentData?.appointments) return [];
    const statusCount = {
      Scheduled: 0,
      Completed: 0,
      Cancelled: 0,
      'No Show': 0,
    };
    appointmentData.appointments.forEach(apt => {
      if (apt.status === 'scheduled') statusCount.Scheduled++;
      else if (apt.status === 'completed') statusCount.Completed++;
      else if (apt.status === 'cancelled') statusCount.Cancelled++;
      else if (apt.status === 'no-show') statusCount['No Show']++;
    });
    return [
      { name: 'Scheduled', count: statusCount.Scheduled, color: '#0088FE' },
      { name: 'Completed', count: statusCount.Completed, color: '#00C49F' },
      { name: 'Cancelled', count: statusCount.Cancelled, color: '#FFBB28' },
      { name: 'No Show', count: statusCount['No Show'], color: '#FF8042' },
    ];
  };

  const prepareSpeciesDistribution = () => {
    if (!petStats?.speciesDistribution) return [];
    return Object.keys(petStats.speciesDistribution).map(species => ({
      name: species,
      count: petStats.speciesDistribution[species],
    }));
  };

  if (user?.role !== 'doctor') {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Only doctors can access reports and analytics.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Comprehensive analytics and reports for your veterinary practice.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="appointments">Appointment Reports</option>
            <option value="revenue">Revenue Reports</option>
            <option value="pets">Pet Statistics</option>
          </select>
        </div>
      </div>

      {/* Date Range Selector */}
      {reportType === 'appointments' && (
        <div className="mt-4 bg-white shadow sm:rounded-lg p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      )}

      {!loading && (
        <div className="mt-8 space-y-8">
          {/* Appointment Reports */}
          {reportType === 'appointments' && appointmentData && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Appointments</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{appointmentData.stats.total}</dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600">{appointmentData.stats.completed}</dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Cancelled/No Show</dt>
                    <dd className="mt-1 text-3xl font-semibold text-red-600">
                      {appointmentData.stats.cancelled + appointmentData.stats.noShow}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                    <dd className="mt-1 text-3xl font-semibold text-blue-600">
                      {((appointmentData.stats.completed / appointmentData.stats.total) * 100).toFixed(1)}%
                    </dd>
                  </div>
                </div>
              </div>

              {/* Bar Chart - NO OVERLAPPING TEXT ISSUE */}
              <div className="bg-white shadow sm:rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Appointment Status Distribution</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={prepareAppointmentChartData()}
                    margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 14 }} />
                    <YAxis tick={{ fontSize: 14 }} />
                    <Tooltip 
                      formatter={(value) => [`${value} appointments`, 'Count']}
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '5px' }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" radius={[8, 8, 0, 0]}>
                      {prepareAppointmentChartData().map((entry, index) => (
                        <Bar key={`bar-${index}`} dataKey="count" fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* Revenue Reports */}
          {reportType === 'revenue' && revenueData && (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600">₹{revenueData.totalRevenue?.toFixed(2) || '0.00'}</dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Bills Paid</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{revenueData.totalBills || 0}</dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Average Bill Value</dt>
                    <dd className="mt-1 text-3xl font-semibold text-blue-600">₹{revenueData.averageBillValue?.toFixed(2) || '0.00'}</dd>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow sm:rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Analytics</h3>
                <div className="prose max-w-none">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Key Insights:</h4>
                    <ul className="mt-2 space-y-1 text-blue-800">
                      <li>• Total revenue generated: ₹{revenueData.totalRevenue?.toFixed(2)}</li>
                      <li>• Number of paid transactions: {revenueData.totalBills}</li>
                      <li>• Average transaction value: ₹{revenueData.averageBillValue?.toFixed(2)}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Pet Statistics */}
          {reportType === 'pets' && petStats && (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Registered Pets</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{petStats.totalPets}</dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Unique Species</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {Object.keys(petStats.speciesDistribution || {}).length}
                    </dd>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow sm:rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Species Distribution</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={prepareSpeciesDistribution()}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 14 }} />
                    <Tooltip formatter={(value) => [`${value} pets`, 'Count']} />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white shadow sm:rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Species Details</h3>
                <div className="space-y-3">
                  {prepareSpeciesDistribution().map((species, index) => (
                    <div key={index} className="flex justify-between items-center border-b py-2">
                      <span className="font-medium text-gray-700">{species.name}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-64 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(species.count / petStats.totalPets) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-600 min-w-[80px]">
                          {species.count} pets ({((species.count / petStats.totalPets) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;