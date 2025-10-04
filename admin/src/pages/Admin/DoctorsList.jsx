import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const DoctorsList = () => {
    const { doctors, changeAvailability, aToken, getAllDoctors } = useContext(AdminContext);
    const { currencySymbol, backendUrl } = useContext(AppContext);
    const [editingFee, setEditingFee] = useState({ id: null, value: '' });

    useEffect(() => {
        if (aToken) {
            getAllDoctors();
        }
    }, [aToken]);

    const handleDelete = async (doctorId) => {
        if (window.confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) {
            try {
                const { data } = await axios.delete(`${backendUrl}/api/admin/delete-doctor/${doctorId}`, { headers: { aToken } });
                
                if (data.success) {
                    toast.success(data.message);
                    getAllDoctors();
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to delete doctor.");
            }
        }
    };

    const handleFeeUpdate = async () => {
        if (!editingFee.id || editingFee.value === '' || isNaN(editingFee.value)) {
            toast.warn("Please enter a valid fee.");
            return;
        }

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/admin/update-doctor-fee`,
                { doctorId: editingFee.id, fees: editingFee.value },
                { headers: { aToken } }
            );

            if (data.success) {
                toast.success(data.message);
                setEditingFee({ id: null, value: '' });
                getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update fee.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">All Doctors</h1>
                <p className="text-gray-600">{doctors.length} doctors registered</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {doctors.map((doctor) => (
                    <div
                        key={doctor._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group relative flex flex-col"
                    >
                        <button
                            onClick={() => handleDelete(doctor._id)}
                            className="absolute top-3 right-3 p-2 bg-white text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors z-10 opacity-0 group-hover:opacity-100"
                            title="Delete doctor"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>

                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                            <img
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                src={doctor.image}
                                alt={doctor.name}
                            />
                            <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${doctor.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {doctor.available ? 'Available' : 'Not Available'}
                            </div>
                        </div>

                        <div className="p-4 flex-grow flex flex-col">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{doctor.name}</h3>
                                    <p className="text-amber-600 font-medium text-sm">{doctor.speciality}</p>
                                </div>
                                <p className="text-gray-500 text-sm">{doctor.degree}</p>
                            </div>

                            <div className="mt-4 flex-grow flex items-end justify-between">
                                <div className="flex items-center text-gray-600">
                                    <svg className="w-5 h-5 mr-1.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    
                                    {editingFee.id === doctor._id ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                value={editingFee.value}
                                                onChange={(e) => setEditingFee({ ...editingFee, value: e.target.value })}
                                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                                                autoFocus
                                                onKeyDown={(e) => e.key === 'Enter' && handleFeeUpdate()}
                                            />
                                            <button onClick={handleFeeUpdate} className="p-1 text-green-600 hover:bg-green-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                                            <button onClick={() => setEditingFee({ id: null, value: '' })} className="p-1 text-red-600 hover:bg-red-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <span className="font-semibold text-gray-800">{currencySymbol}{doctor.fees}</span>
                                            <button onClick={() => setEditingFee({ id: doctor._id, value: doctor.fees })} className="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={doctor.available}
                                        onChange={() => changeAvailability(doctor._id)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DoctorsList;