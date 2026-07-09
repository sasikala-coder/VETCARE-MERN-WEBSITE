import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    petId: '',
    appointmentId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0,
  });
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'cash',
  });

  // BLOCK NURSES FROM ACCESSING BILLING
  if (user?.role === 'nurse') {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Nurses do not have access to billing.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchBills();
    fetchPets();
    fetchAppointments();
  }, []);

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/billing', {
        headers: { 'x-auth-token': token }
      });
      setBills(res.data);
    } catch (err) {
      toast.error('Failed to fetch bills');
    }
  };

  const fetchPets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/petrecords', {
        headers: { 'x-auth-token': token }
      });
      setPets(res.data);
    } catch (err) {
      console.error('Failed to fetch pets');
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/appointments', {
        headers: { 'x-auth-token': token }
      });
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to fetch appointments');
    }
  };

  const calculateTotals = (items, taxRate = 0.1) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const { subtotal, tax, total } = calculateTotals(newItems);
    setFormData({ ...formData, items: newItems, subtotal, tax, total });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    let parsedValue = value;
    
    if (field === 'quantity') {
      parsedValue = parseInt(value) || 0;
    }
    if (field === 'unitPrice') {
      parsedValue = parseFloat(value) || 0;
    }
    
    newItems[index][field] = parsedValue;
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].unitPrice || 0);
    }
    const { subtotal, tax, total } = calculateTotals(newItems);
    setFormData({ ...formData, items: newItems, subtotal, tax, total });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const billData = {
        ...formData,
        petId: formData.petId,
        appointmentId: formData.appointmentId || undefined,
      };
      await axios.post('http://localhost:5000/api/billing', billData, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Bill created successfully');
      fetchBills();
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to create bill');
    }
  };

  const handleProcessPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/billing/${selectedBill._id}/pay`, paymentData, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Payment processed successfully');
      fetchBills();
      setShowPaymentModal(false);
      setSelectedBill(null);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to process payment');
    }
  };

  const resetForm = () => {
    setFormData({
      petId: '',
      appointmentId: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0,
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingBills = bills.filter(bill => bill.status === 'pending');
  const paidBills = bills.filter(bill => bill.status === 'paid');
  const totalRevenue = paidBills.reduce((sum, bill) => sum + bill.total, 0);

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Billing & Invoicing</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage invoices, process payments, and track revenue.
          </p>
        </div>
        {/* Create Bill button - Doctor and Receptionist */}
        {(user?.role === 'receptionist' || user?.role === 'doctor') && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Create New Bill
            </button>
          </div>
        )}
      </div>

      {/* Financial Summary Cards - Doctor AND Receptionist can see revenue */}
      {(user?.role === 'doctor' || user?.role === 'receptionist') && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">₹{totalRevenue.toFixed(2)}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Bills</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{bills.length}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending Payments</dt>
              <dd className="mt-1 text-3xl font-semibold text-yellow-600">{pendingBills.length}</dd>
            </div>
          </div>
        </div>
      )}

      {/* Bills Table - All roles except Nurse can view */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bill #</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Pet</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Owner</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {bills.map((bill) => (
                    <tr key={bill._id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                        #{bill._id.slice(-6)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {bill.petId?.petName || 'N/A'}
                       </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {bill.petId?.ownerName || 'N/A'}
                       </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gray-900">
                        ₹{bill.total.toFixed(2)}
                       </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                          {bill.status}
                        </span>
                       </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(bill.createdAt).toLocaleDateString()}
                       </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {/* Process Payment button - Doctor and Receptionist */}
                        {(user?.role === 'doctor' || user?.role === 'receptionist') && (
                          <button
                            onClick={() => {
                              setSelectedBill(bill);
                              setShowPaymentModal(true);
                            }}
                            disabled={bill.status === 'paid'}
                            className={`${bill.status === 'paid' ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {bill.status === 'paid' ? 'Paid' : 'Process Payment'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Bill Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Bill</h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Select Pet</label>
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
                      <label className="block text-sm font-medium text-gray-700">Related Appointment (Optional)</label>
                      <select
                        value={formData.appointmentId}
                        onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select appointment</option>
                        {appointments.map((apt) => (
                          <option key={apt._id} value={apt._id}>
                            {apt.petId?.petName} - {new Date(apt.date).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Items (Amount in ₹)</label>
                    <div className="space-y-2">
                      {formData.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5">
                            <input
                              type="text"
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              placeholder="Qty"
                              value={item.quantity || 0}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              required
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              placeholder="Price (₹)"
                              value={item.unitPrice || 0}
                              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              required
                            />
                          </div>
                          <div className="col-span-1 text-sm font-medium">
                            ₹{(item.quantity * item.unitPrice).toFixed(2)}
                          </div>
                          <div className="col-span-1">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="mt-2 text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-1 text-right">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>₹{formData.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (10%):</span>
                        <span>₹{formData.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>₹{formData.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    >
                      Create Bill
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

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Process Payment</h3>
                <div className="mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-600">Bill Amount:</p>
                    <p className="text-2xl font-bold text-gray-900">₹{selectedBill.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 mt-2">Pet: {selectedBill.petId?.petName}</p>
                    <p className="text-sm text-gray-600">Owner: {selectedBill.petId?.ownerName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <select
                      value={paymentData.paymentMethod}
                      onChange={(e) => setPaymentData({ paymentMethod: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="insurance">Insurance</option>
                      <option value="upi">UPI (GPay/PhonePe)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                  <button
                    onClick={handleProcessPayment}
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                  >
                    Confirm Payment
                  </button>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedBill(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;