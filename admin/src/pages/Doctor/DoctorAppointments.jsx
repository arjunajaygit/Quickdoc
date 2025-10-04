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
    <div className='w-full max-w-7xl mx-auto p-6'>

      <h1 className='mb-6 text-2xl font-bold text-gray-800'>All Appointments</h1>

      <div className='bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2.5fr_1fr_0.8fr_2.5fr_1fr_1.2fr] gap-4 py-4 px-6 bg-gray-50 border-b border-gray-200'>
          <p className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>#</p>
          <p className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>Patient</p>
          <p className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>Payment</p>
          <p className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>Age</p>
          <p className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>Date & Time</p>
          <p className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>Fees</p>
          <p className='text-xs font-semibold text-gray-600 uppercase tracking-wide text-center'>Action</p>
        </div>
        
        <div className='max-h-[70vh] overflow-y-auto'>
          {appointments.map((item, index) => (
            <div key={index} className='border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors'>
              <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2.5fr_1fr_0.8fr_2.5fr_1fr_1.2fr] gap-4 items-center py-4 px-6'>
                <p className='max-sm:hidden text-sm font-medium text-gray-500'>{index + 1}</p>
                
                <div className='flex items-center gap-3'>
                  <img src={item.userData.image} className='w-10 h-10 rounded-full border-2 border-gray-200' alt="" /> 
                  <p className='text-sm font-medium text-gray-800'>{item.userData.name}</p>
                </div>
                
                <div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    item.payment 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-amber-100 text-amber-700 border border-amber-300'
                  }`}>
                    {item.payment ? 'Online' : 'CASH'}
                  </span>
                </div>
                
                <p className='max-sm:hidden text-sm text-gray-700'>{calculateAge(item.userData.dob)}</p>
                
                <div className='text-sm text-gray-700'>
                  <p className='font-medium'>{slotDateFormat(item.slotDate)}</p>
                  <p className='text-xs text-gray-500'>{item.slotTime}</p>
                </div>
                
                <p className='text-sm font-semibold text-gray-800'>{currency}{item.amount}</p>
                
                <div className='flex items-center justify-center gap-2'>
                  {item.cancelled
                    ? <span className='text-red-600 text-xs font-semibold bg-red-50 px-3 py-1.5 rounded-full border border-red-200'>Cancelled</span>
                    : item.isCompleted
                      ? <span className='text-green-600 text-xs font-semibold bg-green-50 px-3 py-1.5 rounded-full border border-green-200'>Completed</span>
                      : <div className='flex gap-1'>
                          <button 
                            onClick={() => cancelAppointment(item._id)} 
                            className='p-1.5 hover:bg-red-100 rounded-full transition-colors group'
                            title='Cancel appointment'
                          >
                            <img className='w-7 h-7' src={assets.cancel_icon} alt="Cancel" />
                          </button>
                          <button 
                            onClick={() => completeAppointment(item._id)} 
                            className='p-1.5 hover:bg-green-100 rounded-full transition-colors group'
                            title='Complete appointment'
                          >
                            <img className='w-7 h-7' src={assets.tick_icon} alt="Complete" />
                          </button>
                        </div>
                  }
                </div>
              </div>
              
              {/* Symptoms Section */}
              {item.symptoms && (
                <div className="px-6 pb-4">
                  <button
                    onClick={() => toggleSymptoms(item._id)}
                    className="flex items-center gap-2 text-amber-700 text-sm font-medium hover:text-amber-800 transition-colors w-full text-left pt-3"
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
  )
}

export default DoctorAppointments