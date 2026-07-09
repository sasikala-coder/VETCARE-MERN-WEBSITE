import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPets: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    totalStaff: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    todayAppointments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentPets, setRecentPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch pets
      const petsRes = await axios.get('http://localhost:5000/api/petrecords', {
        headers: { 'x-auth-token': token }
      });
      
      // Fetch appointments
      const appointmentsRes = await axios.get('http://localhost:5000/api/appointments', {
        headers: { 'x-auth-token': token }
      });
      
      const appointments = appointmentsRes.data;
      const pets = petsRes.data;
      
      // Calculate appointment stats
      const pending = appointments.filter(a => a.status === 'scheduled').length;
      const completed = appointments.filter(a => a.status === 'completed').length;
      const cancelled = appointments.filter(a => a.status === 'cancelled' || a.status === 'no-show').length;
      
      // Get today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayApts = appointments.filter(apt => apt.date?.split('T')[0] === today);
      setTodayAppointments(todayApts);
      
      // Set recent appointments (last 5)
      setRecentAppointments(appointments.slice(0, 5));
      
      // Set recent pets (last 5)
      setRecentPets(pets.slice(0, 5));
      
      // Fetch staff (ONLY for doctors)
      let staffCount = 0;
      if (user?.role === 'doctor') {
        const staffRes = await axios.get('http://localhost:5000/api/staff', {
          headers: { 'x-auth-token': token }
        });
        staffCount = staffRes.data.length;
      }
      
      // Fetch revenue (ONLY for doctors - NOT for receptionists)
      let revenue = 0;
      if (user?.role === 'doctor') {
        try {
          const revenueRes = await axios.get('http://localhost:5000/api/reports/revenue', {
            headers: { 'x-auth-token': token }
          });
          revenue = revenueRes.data.totalRevenue || 0;
        } catch (err) {
          console.log('Revenue fetch skipped or failed');
        }
      }
      
      setStats({
        totalPets: pets.length,
        totalAppointments: appointments.length,
        totalRevenue: revenue,
        totalStaff: staffCount,
        pendingAppointments: pending,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        todayAppointments: todayApts.length,
      });
      
    } catch (err) {
      console.error('Dashboard error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status) => {
    const icons = {
      scheduled: '🟡',
      completed: '✅',
      cancelled: '❌',
      'no-show': '⚠️'
    };
    return `${icons[status] || '📅'} ${status.toUpperCase()}`;
  };

  // Role-specific stat cards
  const getStatCards = () => {
    // Base cards for all roles
    const baseCards = [
      { 
        title: 'Total Pets', 
        value: stats.totalPets, 
        icon: ClipboardDocumentListIcon, 
        color: 'bg-blue-500',
        link: '/petrecords',
        action: 'View All Pets'
      },
      { 
        title: 'Total Appointments', 
        value: stats.totalAppointments, 
        icon: CalendarIcon, 
        color: 'bg-green-500',
        link: '/appointments',
        action: 'View All Appointments'
      },
    ];
    
    // DOCTOR view - Full access including revenue, staff, and billing
    if (user?.role === 'doctor') {
      return [
        ...baseCards,
        { title: 'Pending', value: stats.pendingAppointments, icon: ClockIcon, color: 'bg-yellow-500', link: '/appointments', action: 'Check Schedule' },
        { title: 'Completed', value: stats.completedAppointments, icon: CheckCircleIcon, color: 'bg-green-600', link: '/appointments', action: 'View History' },
        { title: 'Revenue', value: `₹${stats.totalRevenue}`, icon: CurrencyDollarIcon, color: 'bg-purple-500', link: '/reports', action: 'View Reports' },
        { title: 'Staff', value: stats.totalStaff, icon: UserGroupIcon, color: 'bg-indigo-500', link: '/staff', action: 'Manage Staff' },
      ];
    } 
    
    // RECEPTIONIST view - Can create bills and process payments, but NO revenue stats
    if (user?.role === 'receptionist') {
      return [
        ...baseCards,
        { 
          title: "Today's", 
          value: stats.todayAppointments, 
          icon: ClockIcon, 
          color: 'bg-orange-500',
          link: '/appointments',
          action: 'Today\'s Schedule'
        },
        { 
          title: 'Pending', 
          value: stats.pendingAppointments, 
          icon: CalendarIcon, 
          color: 'bg-yellow-500',
          link: '/appointments',
          action: 'Manage Pending'
        },
        { 
          title: 'Billing', 
          value: 'Manage', 
          icon: CurrencyDollarIcon, 
          color: 'bg-purple-500',
          link: '/billing',
          action: 'Go to Billing'
        },
      ];
    }
    
    // NURSE view - NO revenue, NO billing, only pets and appointments
    return [
      { 
        title: 'Total Pets', 
        value: stats.totalPets, 
        icon: ClipboardDocumentListIcon, 
        color: 'bg-blue-500',
        link: '/petrecords',
        action: 'View All Pets'
      },
      { 
        title: 'Appointments', 
        value: stats.totalAppointments, 
        icon: CalendarIcon, 
        color: 'bg-green-500',
        link: '/appointments',
        action: 'View All'
      },
      { 
        title: "Today's", 
        value: stats.todayAppointments, 
        icon: ClockIcon, 
        color: 'bg-orange-500',
        link: '/appointments',
        action: 'Today\'s Schedule'
      },
      { 
        title: 'Pending', 
        value: stats.pendingAppointments, 
        icon: CalendarIcon, 
        color: 'bg-yellow-500',
        link: '/appointments',
        action: 'Check Pending'
      },
    ];
  };

  const statCards = getStatCards();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {user?.role === 'doctor' && "Here's what's happening with your veterinary practice today."}
          {user?.role === 'receptionist' && "Manage appointments, pet records, and billing from your dashboard."}
          {user?.role === 'nurse' && "View today's schedule and pet records."}
        </p>
      </div>

      {/* Stats Cards with clickable links */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => navigate(stat.link)}
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="ml-5">
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stat.value}</dd>
                  </div>
                </div>
                <div className="text-xs text-indigo-600 font-medium">
                  {stat.action} →
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Appointments Section - For all roles */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Today's Appointments ({todayAppointments.length})
          </h2>
          <button
            onClick={() => navigate('/appointments')}
            className="text-sm text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1"
          >
            View All Appointments <EyeIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {todayAppointments.map((appointment) => (
              <li key={appointment._id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/appointments')}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600">
                        🐾 {appointment.petId?.petName || 'Unknown Pet'}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        🕐 {appointment.time}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-4">
                      <p className="text-sm text-gray-500">
                        👤 Owner: {appointment.petId?.ownerName || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        👨‍⚕️ Doctor: {appointment.doctorId?.name || 'N/A'}
                      </p>
                    </div>
                    {appointment.reason && (
                      <p className="text-sm text-gray-500 mt-1">
                        📝 Reason: {appointment.reason}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {getStatusBadge(appointment.status)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
            {todayAppointments.length === 0 && (
              <li className="px-6 py-8 text-center text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p>No appointments scheduled for today</p>
                {(user?.role === 'receptionist' || user?.role === 'doctor') && (
                  <button
                    onClick={() => navigate('/appointments')}
                    className="mt-2 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    + Schedule an appointment
                  </button>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Recent Pets Section - For all roles */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Recently Added Pets ({recentPets.length})
          </h2>
          <button
            onClick={() => navigate('/petrecords')}
            className="text-sm text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1"
          >
            Add New Pet <PlusCircleIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {recentPets.map((pet) => (
              <li key={pet._id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/petrecords')}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-indigo-600">
                        🐕 {pet.petName}
                      </p>
                      <span className="text-xs text-gray-400">
                        ({pet.species})
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Owner: {pet.ownerName}
                    </p>
                    {pet.breed && (
                      <p className="text-xs text-gray-400">
                        Breed: {pet.breed} | Age: {pet.age} years
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      📞 {pet.ownerPhone || 'No phone'}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/petrecords');
                      }}
                      className="mt-1 text-xs text-indigo-600 hover:text-indigo-900"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {recentPets.length === 0 && (
              <li className="px-6 py-8 text-center text-gray-500">
                <ClipboardDocumentListIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p>No pets registered yet</p>
                <button
                  onClick={() => navigate('/petrecords')}
                  className="mt-2 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  + Register a pet
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Recent Appointments Section - For all roles */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Appointments</h2>
          <button
            onClick={() => navigate('/appointments')}
            className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
          >
            View All →
          </button>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {recentAppointments.map((appointment) => (
              <li key={appointment._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-indigo-600">
                      {appointment.petId?.petName || 'Unknown Pet'}
                    </p>
                    <p className="text-sm text-gray-500">
                      👤 {appointment.petId?.ownerName || 'N/A'} | 👨‍⚕️ Dr. {appointment.doctorId?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      📅 {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                    </div>
                    <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {getStatusBadge(appointment.status)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
            {recentAppointments.length === 0 && (
              <li className="px-6 py-4 text-center text-gray-500">No appointments found</li>
            )}
          </ul>
        </div>
      </div>

      {/* Quick Actions - For Receptionist AND Doctor */}
      {(user?.role === 'receptionist' || user?.role === 'doctor') && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              onClick={() => navigate('/appointments')}
              className="bg-indigo-50 p-4 rounded-lg hover:bg-indigo-100 transition-colors text-left"
            >
              <CalendarIcon className="h-6 w-6 text-indigo-600 mb-2" />
              <p className="font-medium text-gray-900">Schedule Appointment</p>
              <p className="text-sm text-gray-500">Book a new appointment for a pet</p>
            </button>
            <button
              onClick={() => navigate('/petrecords')}
              className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <ClipboardDocumentListIcon className="h-6 w-6 text-green-600 mb-2" />
              <p className="font-medium text-gray-900">Register Pet</p>
              <p className="text-sm text-gray-500">Add a new pet to the system</p>
            </button>
            <button
              onClick={() => navigate('/billing')}
              className="bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">Billing</p>
              <p className="text-sm text-gray-500">Create invoice or process payment</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;