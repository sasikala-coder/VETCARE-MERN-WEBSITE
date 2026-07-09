import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  CreditCardIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Define menu items with role-based access
  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['doctor', 'nurse', 'receptionist'] },
    { name: 'Pet Records', href: '/petrecords', icon: ClipboardDocumentListIcon, roles: ['doctor', 'nurse', 'receptionist'] },
    { name: 'Appointments', href: '/appointments', icon: CalendarIcon, roles: ['doctor', 'nurse', 'receptionist'] },
    { name: 'Staff', href: '/staff', icon: UserGroupIcon, roles: ['doctor', 'nurse', 'receptionist'] },
    { name: 'Billing', href: '/billing', icon: CreditCardIcon, roles: ['doctor', 'receptionist'] }, // Nurse CANNOT see billing
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: ['doctor'] }, // Only doctor can see reports
  ];

  // Filter navigation based on user role
  const navigation = allNavigation.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 bg-indigo-700 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
        
                <h1 className="text-white text-2xl font-bold">Vet Care Pro Clinic</h1>
            </div>
            <div className="mt-5 flex-1 flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-indigo-100 hover:bg-indigo-600 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  >
                    <item.icon className="mr-3 h-6 w-6" />
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="px-4 py-4 border-t border-indigo-800">
                <div className="text-white text-sm mb-2">
                  Logged in as: <strong>{user?.name}</strong>
                  <br />
                  <span className="text-indigo-200">Role: {user?.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;