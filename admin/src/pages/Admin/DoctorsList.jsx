import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const DoctorsList = () => {
  const { doctors, changeAvailability, aToken, getAllDoctors, deleteDoctor } = useContext(AdminContext);
  const { currencySymbol } = useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken, getAllDoctors]);

  const handleDelete = async (doctorId) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        const { data } = await deleteDoctor(doctorId);
        if (data.success) {
          toast.success(data.message);
          getAllDoctors(); // Refresh the list
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Doctors</h1>
        <p className="text-gray-600">{doctors.length} doctors available</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {doctors.map((doctor, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group relative"
          >
            {/* DELETE BUTTON - Make sure this is inside the card div */}
            <button 
              onClick={() => handleDelete(doctor._id)}
              className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
              title="Delete doctor"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>

            {/* Rest of your card content */}
            <div className="relative h-48 bg-gray-100 overflow-hidden">
              <img 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                src={doctor.image} 
                alt={doctor.name} 
              />
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                doctor.available 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {doctor.available ? 'Available' : 'Not Available'}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{doctor.name}</h3>
                  <p className="text-amber-600 font-medium">{doctor.speciality}</p>
                </div>
                <p className="text-gray-600 text-sm">{doctor.degree}</p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <svg 
                    className="w-5 h-5 mr-1 text-amber-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {currencySymbol}{doctor.fees}
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