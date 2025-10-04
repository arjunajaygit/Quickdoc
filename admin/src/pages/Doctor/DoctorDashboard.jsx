import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext);
  const { slotDateFormat } = useContext(AppContext);
  const [expandedSymptoms, setExpandedSymptoms] = useState({});

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken]);

  const toggleSymptoms = (appointmentId) => {
    setExpandedSymptoms(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }));
  };

  return dashData && (
    <div className="max-w-6xl mx-auto p-6">

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-amber-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <img className="w-8 h-8" src={assets.appointments_icon} alt="Appointments" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{dashData.appointments}</p>
              <p className="text-gray-600">Total Appointments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-amber-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <img className="w-8 h-8" src={assets.patients_icon} alt="Patients" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{dashData.patients}</p>
              <p className="text-gray-600">Total Patients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Bookings */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-amber-100">
        <div className="px-6 py-4 border-b border-amber-100 bg-amber-50">
          <div className="flex items-center gap-3">
            <img className="w-5 h-5" src={assets.list_icon} alt="Bookings" />
            <h2 className="text-xl font-semibold text-gray-800">Latest Bookings</h2>
          </div>
        </div>

        <div className="divide-y divide-amber-100">
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div key={index}>
              <div className="flex items-center px-6 py-4 hover:bg-amber-50 transition-colors">
                <img 
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-100 flex-shrink-0" 
                  src={item.userData.image} 
                  alt={item.userData.name} 
                />
                
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{item.userData.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Patient: {item.userData.name}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 font-medium">
                          {slotDateFormat(item.slotDate)}, {item.slotTime}
                        </p>
                      </div>
                      
                      {item.cancelled ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full whitespace-nowrap">
                          Cancelled
                        </span>
                      ) : item.isCompleted ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
                          Completed
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => cancelAppointment(item._id)} 
                            className="p-3 hover:bg-red-50 rounded-lg transition-colors group"
                            title="Cancel Appointment"
                          >
                            <img className="w-10 h-10 opacity-80 group-hover:opacity-100" src={assets.cancel_icon} alt="Cancel" />
                          </button>
                          <button 
                            onClick={() => completeAppointment(item._id)} 
                            className="p-3 hover:bg-green-50 rounded-lg transition-colors group"
                            title="Complete Appointment"
                          >
                            <img className="w-10 h-10 opacity-80 group-hover:opacity-100" src={assets.tick_icon} alt="Complete" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Symptoms Preview */}
              {item.symptoms && (
                <div className="px-4 pb-4">
                  <button
                    onClick={() => toggleSymptoms(item._id)}
                    className="flex items-center gap-2 text-amber-700 text-sm font-medium hover:text-amber-800 transition-colors w-full text-left"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 transition-transform duration-200 ${expandedSymptoms[item._id] ? 'rotate-90' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>View Patient Symptoms</span>
                  </button>
                  
                  {expandedSymptoms[item._id] && (
                    <div className="mt-3 bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide">Patient's Symptoms:</p>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.symptoms}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DoctorDashboard;