import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PetRecords = () => {
  const [pets, setPets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    petName: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    medicalHistory: '',
    allergies: '',
  });

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/petrecords');
      setPets(res.data);
    } catch (err) {
      toast.error('Failed to fetch pet records');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPet) {
        await axios.put(`http://localhost:5000/api/petrecords/${editingPet._id}`, formData);
        toast.success('Pet record updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/petrecords', formData);
        toast.success('Pet record created successfully');
      }
      fetchPets();
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pet record?')) {
      try {
        await axios.delete(`http://localhost:5000/api/petrecords/${id}`);
        toast.success('Pet record deleted successfully');
        fetchPets();
      } catch (err) {
        toast.error('Failed to delete pet record');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      petName: '',
      species: '',
      breed: '',
      age: '',
      weight: '',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      medicalHistory: '',
      allergies: '',
    });
    setEditingPet(null);
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setFormData(pet);
    setShowModal(true);
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Pet Records</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all registered pets including their medical history.
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
            Add Pet Record
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Pet Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Species</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Owner</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Age</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Weight</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pets.map((pet) => (
                    <tr key={pet._id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pet.petName}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pet.species}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pet.ownerName}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pet.age}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{pet.weight} kg</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(pet)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        {user?.role === 'doctor' && (
                          <button
                            onClick={() => handleDelete(pet._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
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

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {editingPet ? 'Edit Pet Record' : 'Add New Pet Record'}
                </h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Pet Name"
                      value={formData.petName}
                      onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Species"
                      value={formData.species}
                      onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Breed"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Owner Name"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Owner Phone"
                      value={formData.ownerPhone}
                      onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <input
                      type="email"
                      placeholder="Owner Email"
                      value={formData.ownerEmail}
                      onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                      className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <textarea
                    placeholder="Medical History"
                    rows="3"
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <textarea
                    placeholder="Allergies"
                    rows="2"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    >
                      {editingPet ? 'Update' : 'Create'}
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

export default PetRecords;