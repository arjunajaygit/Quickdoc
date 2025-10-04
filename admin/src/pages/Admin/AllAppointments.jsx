import React, { useEffect, useState, useMemo, useContext } from 'react';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';

const PatientDetailModal = ({ patient, onClose }) => {
  const { calculateAge } = useContext(AppContext);

  if (!patient) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-lg w-full max-w-lg m-4 p-8 relative animate-fade-in-up"
        onClick={e => e.stopPropagation()} 
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center border-b pb-6 mb-6">
          <img 
            src={patient.image} 
            alt={patient.name} 
            className="w-24 h-24 rounded-full object-cover border-4 border-amber-100 mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800">{patient.name}</h2>
          <p className="text-gray-600">{patient.email}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="text-md font-medium text-gray-800">{patient.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="text-md font-medium text-gray-800">{patient.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p className="text-md font-medium text-gray-800">{patient.dob}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Age</p>
            <p className="text-md font-medium text-gray-800">{calculateAge(patient.dob)} Years</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500">Address</p>
            <p className="text-md font-medium text-gray-800">
              {patient.address.line1}{patient.address.line2 ? `, ${patient.address.line2}` : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(AdminContext);
  const { calculateAge, currencySymbol } = useContext(AppContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  const handlePatientClick = (patientData) => {
    setSelectedPatient(patientData);
    setIsModalOpen(true);
  };

  const slotDateFormat = (slotDate) => {
    if (!slotDate) return '';
    const dateArray = slotDate.split('_');
    const day = dateArray[0];
    const monthIndex = parseInt(dateArray[1]) - 1;
    const year = dateArray[2];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${day} ${months[monthIndex]} ${year}`;
  }

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  const doctorList = useMemo(() => {
    const doctors = new Map();
    appointments.forEach(app => {
      if (!doctors.has(app.docId)) {
        doctors.set(app.docId, app.docData.name);
      }
    });
    return Array.from(doctors, ([id, name]) => ({ id, name }));
  }, [appointments]);

  useEffect(() => {
    let filteredData = [...appointments];
    if (filterDate) {
      const formattedFilterDate = filterDate.split('-').reverse().join('_');
      filteredData = filteredData.filter(item => {
        const [d, m, y] = item.slotDate.split('_');
        const itemDate = `${d.padStart(2, '0')}_${m.padStart(2, '0')}_${y}`;
        const filterDateParts = formattedFilterDate.split('_');
        const formattedFilter = `${filterDateParts[0].padStart(2,'0')}_${filterDateParts[1].padStart(2,'0')}_${filterDateParts[2]}`;
        return itemDate === formattedFilter;
      });
    }
    if (filterDoctor !== 'all') {
      filteredData = filteredData.filter(item => item.docId === filterDoctor);
    }
    if (filterStatus !== 'all') {
      filteredData = filteredData.filter(item => {
        if (filterStatus === 'completed') return item.isCompleted;
        if (filterStatus === 'cancelled') return item.cancelled;
        if (filterStatus === 'pending') return !item.isCompleted && !item.cancelled;
        return true;
      });
    }
    setFilteredAppointments(filteredData);
  }, [appointments, filterDate, filterDoctor, filterStatus]);
  
  const handleClearFilters = () => {
    setFilterDate('');
    setFilterDoctor('all');
    setFilterStatus('all');
  }

  return (
    <>
      {isModalOpen && (
        <PatientDetailModal 
          patient={selectedPatient} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">All Appointments</h2>
            <p className="text-gray-600 mt-1 text-sm">{filteredAppointments.length} appointments found</p>
          </div>

          <div className="p-4 flex flex-wrap items-center justify-between gap-4 bg-gray-50 border-b border-gray-200">
            <div className='flex flex-wrap items-center gap-4'>
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"/>
              <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)} className="text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors">
                <option value="all">All Doctors</option>
                {doctorList.map(doc => (<option key={doc.id} value={doc.id}>{doc.name}</option>))}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button onClick={handleClearFilters} className="px-4 py-2 border border-amber-600 text-amber-700 font-medium rounded-lg hover:bg-amber-100 transition-colors text-sm">
              Clear Filters
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-12 gap-4 py-3 px-6 bg-gray-50/70 font-semibold text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <div className="col-span-1">#</div>
              <div className="col-span-2">Patient</div>
              <div className="col-span-3">Doctor</div>
              <div className="col-span-2">Date & Time</div>
              <div className="col-span-1">Payment</div>
              <div className="col-span-1">Fees</div>
              <div className="col-span-2 text-center">Status</div>
            </div>
            <div className="max-h-[65vh] overflow-y-auto">
              {filteredAppointments.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 py-4 px-6 border-b border-gray-100 hover:bg-amber-50/50 transition-colors text-sm items-center">
                  <div className="col-span-1 text-gray-500 font-medium">{index + 1}</div>
                  <div className="col-span-2 flex items-center gap-3">
                    <img src={item.userData.image} className="w-9 h-9 rounded-full object-cover border-2 border-white ring-1 ring-gray-200" alt="Patient" />
                    <button onClick={() => handlePatientClick(item.userData)} className="font-medium text-gray-800 hover:text-amber-600 hover:underline cursor-pointer text-left">
                      {item.userData.name}
                    </button>
                  </div>
                  <div className="col-span-3 flex items-center gap-3 text-gray-700">
                    <img src={item.docData.image} className="w-9 h-9 rounded-full object-cover border-2 border-white ring-1 ring-gray-200" alt="Doctor" />
                    <span>{item.docData.name}</span>
                  </div>
                  <div className="col-span-2 text-gray-600">
                    <p>{slotDateFormat(item.slotDate)}</p>
                    <p className="text-xs">{item.slotTime}</p>
                  </div>
                  <div className="col-span-1">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      item.payment 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {item.payment ? 'Online' : 'CASH'}
                    </span>
                  </div>
                  <div className="col-span-1 font-medium text-gray-800">{currencySymbol}{item.amount}</div>
                  <div className="col-span-2 flex items-center justify-center">
                    {item.cancelled ? (<span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Cancelled</span>) 
                    : item.isCompleted ? (<span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Completed</span>) 
                    : (
                      <button onClick={() => cancelAppointment(item._id)} className="p-3 rounded-full hover:bg-red-100 transition-colors" title="Cancel Appointment">
                        <img className="w-10 h-10" src={assets.cancel_icon} alt="Cancel" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {filteredAppointments.map((item, index) => (
              <div key={index} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img src={item.userData.image} className="w-12 h-12 rounded-full object-cover border border-gray-200" alt="Patient" />
                    <div>
                      <button onClick={() => handlePatientClick(item.userData)} className="font-semibold text-lg text-gray-800 text-left hover:underline cursor-pointer">
                        {item.userData.name}
                      </button>
                      <p className="text-sm text-gray-500">vs Dr. {item.docData.name}</p>
                    </div>
                  </div>
                  {item.cancelled ? (<span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Cancelled</span>) 
                  : item.isCompleted ? (<span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Completed</span>) 
                  : (
                    <button onClick={() => cancelAppointment(item._id)} className="p-4 rounded-full hover:bg-red-100 transition-colors" title="Cancel Appointment">
                      <img className="w-12 h-12" src={assets.cancel_icon} alt="Cancel" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm p-3 bg-gray-50/70 rounded-lg">
                  <div><p className="text-gray-500 font-medium">Date & Time</p><p className="text-gray-800 font-semibold">{slotDateFormat(item.slotDate)}, {item.slotTime}</p></div>
                  <div>
                    <p className="text-gray-500 font-medium">Payment</p>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      item.payment 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {item.payment ? 'Online' : 'CASH'}
                    </span>
                  </div>
                  <div><p className="text-gray-500 font-medium">Fees</p><p className="text-amber-600 font-semibold">{currencySymbol}{item.amount}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default AllAppointments;