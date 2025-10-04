import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

// Modal Component for Editing
const EditProfileModal = ({ initialProfileData, onClose, onSave }) => {
    const [profileData, setProfileData] = useState(initialProfileData);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(profileData);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
                    <p className="text-sm text-gray-500">Make changes to the doctor's profile below.</p>
                </div>
                <div className="p-6 space-y-5 overflow-y-auto">
                    {/* Form Fields */}
                    <div>
                        <label className='block text-md font-semibold text-gray-800 mb-2'>About</label>
                        <textarea
                            onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors'
                            rows={5}
                            value={profileData.about}
                        />
                    </div>
                    <div>
                        <label className='block text-md font-semibold text-gray-800 mb-2'>Case History & Notable Achievements</label>
                        <textarea
                            onChange={(e) => setProfileData(prev => ({ ...prev, caseHistory: e.target.value }))}
                            className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors'
                            rows={5}
                            value={profileData.caseHistory}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className='block text-md font-semibold text-gray-800 mb-2'>Address</label>
                            <div className="space-y-2">
                                <input
                                    type='text'
                                    className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                    placeholder="Street, Building"
                                    onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                                    value={profileData.address.line1}
                                />
                                <input
                                    type='text'
                                    className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                    placeholder="City, State, PIN"
                                    onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                                    value={profileData.address.line2}
                                />
                            </div>
                        </div>
                        <div>
                            <label className='block text-md font-semibold text-gray-800 mb-2'>Working Hours</label>
                            <div className='flex items-center gap-2'>
                                <input type="time" value={profileData.startTime || '09:00'} onChange={(e) => setProfileData(prev => ({ ...prev, startTime: e.target.value }))} className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500' />
                                <span className="text-gray-500">to</span>
                                <input type="time" value={profileData.endTime || '17:00'} onChange={(e) => setProfileData(prev => ({ ...prev, endTime: e.target.value }))} className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500' />
                            </div>
                        </div>
                         <div>
                            <label className='block text-md font-semibold text-gray-800 mb-2'>Availability</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" onChange={() => setProfileData(prev => ({ ...prev, available: !prev.available }))} checked={profileData.available} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700">{profileData.available ? 'Available' : 'Not Available'}</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-all">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-5 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-all disabled:bg-amber-400">
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Profile Page Component
const DoctorProfile = () => {
    const { dToken, profileData, getProfileData } = useContext(DoctorContext);
    const { currency, backendUrl } = useContext(AppContext);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const updateProfile = async (updatedData) => {
        try {
            const payload = {
                address: updatedData.address,
                about: updatedData.about,
                caseHistory: updatedData.caseHistory,
                available: updatedData.available,
                startTime: updatedData.startTime,
                endTime: updatedData.endTime
            };

            const { data } = await axios.post(
                `${backendUrl}/api/doctor/update-profile`,
                payload,
                { headers: { dToken } }
            );

            if (data.success) {
                toast.success(data.message);
                setIsEditModalOpen(false);
                getProfileData(); // Refresh data
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            console.error(error);
        }
    };

    useEffect(() => {
        if (dToken) {
            getProfileData();
        }
    }, [dToken]);

    if (!profileData) {
        return <div>Loading...</div>; // Or a loading spinner
    }

    return (
        <>
            <div className="max-w-7xl mx-auto p-4 md:p-6">
                <div className='flex flex-col lg:flex-row gap-6'>
                    <div className="lg:w-1/4">
                        <img className='w-full rounded-xl shadow-md border-2 border-amber-100' src={profileData.image} alt={profileData.name} />
                    </div>

                    <div className='flex-1 border border-gray-200 rounded-xl p-6 bg-white shadow-sm'>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className='flex items-center gap-2 text-2xl md:text-3xl font-bold text-gray-800'>{profileData.name}</p>
                                <div className='flex items-center gap-3 mt-2 text-gray-600'>
                                    <p>{profileData.degree}</p>
                                    <span className="text-gray-400">•</span>
                                    <p>{profileData.speciality}</p>
                                    <span className="py-0.5 px-2.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">{profileData.experience}</span>
                                </div>
                            </div>
                            <div>
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className='px-5 py-2 border border-amber-500 text-amber-600 text-sm font-medium rounded-lg hover:bg-amber-50 transition-all'
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 border-t pt-6 space-y-6">
                            <div>
                                <p className='text-md font-semibold text-gray-800 mb-2'>About</p>
                                <p className='text-sm text-gray-600 leading-relaxed whitespace-pre-wrap'>{profileData.about || 'Not provided.'}</p>
                            </div>

                            <div>
                                <p className='text-md font-semibold text-gray-800 mb-2'>Case History & Notable Achievements</p>
                                <p className='text-sm text-gray-600 leading-relaxed whitespace-pre-wrap'>{profileData.caseHistory || 'Not provided.'}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className='text-md font-semibold text-gray-800 mb-2'>Appointment Fee</p>
                                    <p className='text-lg font-bold text-amber-600'>{currency}{profileData.fees}</p>
                                </div>
                                <div>
                                    <p className='text-md font-semibold text-gray-800 mb-2'>Address</p>
                                    <p className='text-sm text-gray-600'>{profileData.address.line1}<br />{profileData.address.line2}</p>
                                </div>
                                <div>
                                    <p className='text-md font-semibold text-gray-800 mb-2'>Availability</p>
                                    <span className={`py-1 px-3 rounded-full text-xs font-medium ${profileData.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {profileData.available ? 'Available for Appointments' : 'Not Available'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Render the modal when isEditModalOpen is true */}
            {isEditModalOpen && (
                <EditProfileModal
                    initialProfileData={profileData}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={updateProfile}
                />
            )}
        </>
    );
};

export default DoctorProfile;