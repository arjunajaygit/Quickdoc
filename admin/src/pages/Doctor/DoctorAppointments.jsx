import React from 'react'
import { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {

  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  const [expandedSymptoms, setExpandedSymptoms] = useState({})

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  const toggleSymptoms = (appointmentId) => {
    setExpandedSymptoms(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }))
  }

  return (
    <div className='w-full max-w-7xl mx-auto p-4 md:p-6'>
      <h1 className='mb-6 text-xl md:text-2xl font-bold text-gray-800'>All Appointments</h1>
      <div className='bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden'>
        <div className='hidden md:grid grid-cols-12 gap-4 py-3 px-6 bg-gray-50/70 font-semibold text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200'>
          <p className='col-span-1'>#</p>
          <p className='col-span-4'>Patient</p>
          <p className='col-span-1'>Age</p>
          <p className='col-span-3'>Date & Time</p>
          <p className='col-span-1'>Fees</p>
          <p className='col-span-2 text-center'>Action</p>
        </div>
        
        <div className='max-h-[75vh] overflow-y-auto'>
          {appointments.map((item, index) => (
            <div key={index} className='border-b border-gray-100 last:border-b-0'>
              <div className='grid grid-cols-1 md:grid-cols-12 md:gap-4 items-center py-4 px-6 hover:bg-amber-50/50 transition-colors'>
                
                {/* Mobile View Layout */}
                <div className='md:hidden col-span-1 w-full'>
                  <div className='flex justify-between items-center'>
                     <div className='flex items-center gap-3'>
                        <img src={item.userData.image} className='w-12 h-12 rounded-full border-2 border-gray-200' alt="" /> 
                        <div>
                          <p className='text-md font-bold text-gray-800'>{item.userData.name}</p>
                          <p className='text-sm text-gray-500'>{calculateAge(item.userData.dob)} years</p>
                        </div>
                     </div>
                     <div className='flex items-center gap-2'>
                       {item.cancelled ? <span className='px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full'>Cancelled</span>
                        : item.isCompleted ? <span className='px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full'>Completed</span>
                        : <div className='flex gap-2'>
                            <button onClick={() => cancelAppointment(item._id)} className='p-3 hover:bg-red-100 rounded-full' title='Cancel'><img className='w-10 h-10' src={assets.cancel_icon} alt="Cancel" /></button>
                            <button onClick={() => completeAppointment(item._id)} className='p-3 hover:bg-green-100 rounded-full' title='Complete'><img className='w-10 h-10' src={assets.tick_icon} alt="Complete" /></button>
                          </div>
                       }
                     </div>
                  </div>
                  <div className='mt-4 flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg'>
                      <div>
                          <p className='font-medium'>{slotDateFormat(item.slotDate)}</p>
                          <p className='text-xs text-gray-500'>{item.slotTime}</p>
                      </div>
                      <p className='text-md font-semibold text-amber-600'>{currency}{item.amount}</p>
                  </div>
                </div>

                {/* Desktop View Layout */}
                <p className='hidden md:block col-span-1 text-sm font-medium text-gray-500'>{index + 1}</p>
                <div className='hidden md:flex col-span-4 items-center gap-3'>
                  <img src={item.userData.image} className='w-10 h-10 rounded-full border-2 border-gray-200' alt="" /> 
                  <p className='text-sm font-medium text-gray-800'>{item.userData.name}</p>
                </div>
                <p className='hidden md:block col-span-1 text-sm text-gray-700'>{calculateAge(item.userData.dob)}</p>
                <div className='hidden md:block col-span-3 text-sm text-gray-700'>
                  <p className='font-medium'>{slotDateFormat(item.slotDate)}</p>
                  <p className='text-xs text-gray-500'>{item.slotTime}</p>
                </div>
                <p className='hidden md:block col-span-1 text-sm font-semibold text-gray-800'>{currency}{item.amount}</p>
                <div className='hidden md:flex col-span-2 items-center justify-center gap-2'>
                  {item.cancelled
                    ? <span className='px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full'>Cancelled</span>
                    : item.isCompleted
                      ? <span className='px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full'>Completed</span>
                      : <div className='flex gap-2'>
                          <button onClick={() => cancelAppointment(item._id)} className='p-3 hover:bg-red-100 rounded-full transition-colors group' title='Cancel appointment'>
                            <img className='w-10 h-10 opacity-70 group-hover:opacity-100' src={assets.cancel_icon} alt="Cancel" />
                          </button>
                          <button onClick={() => completeAppointment(item._id)} className='p-3 hover:bg-green-100 rounded-full transition-colors group' title='Complete appointment'>
                            <img className='w-10 h-10 opacity-70 group-hover:opacity-100' src={assets.tick_icon} alt="Complete" />
                          </button>
                        </div>
                  }
                </div>
              </div>
              
              {item.symptoms && (
                <div className="px-6 pb-4 -mt-2">
                  <button onClick={() => toggleSymptoms(item._id)} className="flex items-center gap-2 text-amber-700 text-sm font-medium hover:text-amber-800 transition-colors w-full text-left pt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${expandedSymptoms[item._id] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>View Patient Symptoms</span>
                  </button>
                  {expandedSymptoms[item._id] && (
                    <div className="mt-3 bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <div className="flex items-start gap-3">
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
  )
}

export default DoctorAppointments;