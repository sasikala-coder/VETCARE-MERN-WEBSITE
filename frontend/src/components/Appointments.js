import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    petId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    status: 'scheduled',
    notes: '',
  });

  useEffect(() => {
    fetchAppointments();
    fetchPets();
    fetchStaff();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/appointments');
      setAppointments(res.data);
    } catch (err) {
      toast.error('Failed to fetch appointments');
    }
  };

  const fetchPets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/petrecords');
      setPets(res.data);
    } catch (err) {
      console.error('Failed to fetch pets');
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/staff');
      const doctors = res.data.filter(staff => staff.role === 'doctor');
      setStaff(doctors);
    } catch (err) {
      console.error('Failed to fetch staff');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await axios.put(`http://localhost:5000/api/appointments/${editingAppointment._id}`, formData);
        toast.success('Appointment updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/appointments', formData);
        toast.success('Appointment created successfully');
      }
      fetchAppointments();
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Operation failed');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}`, { status });
      toast.success(`Appointment marked as ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      petId: '',
      doctorId: '',
      date: '',
      time: '',
      reason: '',
      status: 'scheduled',
      notes: '',
    });
    setEditingAppointment(null);
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      petId: appointment.petId._id,
      doctorId: appointment.doctorId._id,
      date: appointment.date.split('T')[0],
      time: appointment.time,
      reason: appointment.reason || '',
      status: appointment.status,
      notes: appointment.notes || '',
    });
    setShowModal(true);
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

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date.split('T')[0] === today);
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all veterinary appointments, schedule new visits, and track patient visits.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Schedule Appointment
          </button>
        </div>
      </div>

      {/* Today's Appointments Summary */}
      <div className="mt-6 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Today's Appointments ({getTodayAppointments().length})
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Appointments scheduled for today</p>
          </div>
          {getTodayAppointments().length > 0 && (
            <div className="mt-4">
              <ul className="divide-y divide-gray-200">
                {getTodayAppointments().map((apt) => (
                  <li key={apt._id} className="py-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {apt.petId?.petName} - {apt.time}
                        </p>
                        <p className="text-sm text-gray-500">
                          Doctor: {apt.doctorId?.name}
                        </p>
                      </div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Pet</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Owner</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Doctor</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Time</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {appointment.petId?.petName || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {appointment.petId?.ownerName || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {appointment.doctorId?.name || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {appointment.time}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <select
                          value={appointment.status}
                          onChange={(e) => handleStatusUpdate(appointment._id, e.target.value)}
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(appointment.status)} border-0`}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="no-show">No Show</option>
                        </select>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(appointment)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
                </h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pet</label>
                    <select
                      value={formData.petId}
                      onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select a pet</option>
                      {pets.map((pet) => (
                        <option key={pet._id} value={pet._id}>
                          {pet.petName} - {pet.ownerName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Doctor</label>
                    <select
                      value={formData.doctorId}
                      onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select a doctor</option>
                      {staff.map((doc) => (
                        <option key={doc._id} value={doc._id}>
                          Dr. {doc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Time</label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
                    <textarea
                      rows="2"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter reason for appointment"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                    <textarea
                      rows="2"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Any additional notes"
                    />
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    >
                      {editingAppointment ? 'Update' : 'Schedule'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;