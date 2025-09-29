import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [shiftFilter, setShiftFilter] = useState(null);
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  const applyFilter = () => {
    let filtered = doctors;
    
    // Apply speciality filter if exists
    if (speciality) {
      filtered = filtered.filter(doc => doc.speciality === speciality);
    }

    // Apply shift filter if selected
    if (shiftFilter === 'morning') {
      filtered = filtered.filter(doc => {
        if (!doc.startTime || !doc.endTime) return false;
        const [startHour] = doc.startTime.split(':').map(Number);
        const [endHour] = doc.endTime.split(':').map(Number);
        return (startHour < 18 && endHour >= 9) || endHour <= 18;
      });
    } else if (shiftFilter === 'night') {
      filtered = filtered.filter(doc => {
        if (!doc.startTime || !doc.endTime) return false;
        const [startHour] = doc.startTime.split(':').map(Number);
        const [endHour] = doc.endTime.split(':').map(Number);
        return (startHour < 18 && endHour >= 21) || startHour >= 18;
      });
    }

    setFilterDoc(filtered);
  };

  useEffect(() => {
    applyFilter();
  }, [doctors, speciality, shiftFilter]);

  return (
    <div className="p-4">
      <p className='text-gray-600 mb-4'>Browse through the doctors specialist.</p>
      
      {/* Shift Filter Buttons */}
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setShiftFilter(shiftFilter === 'morning' ? null : 'morning')}
          className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            shiftFilter === 'morning' 
              ? 'bg-amber-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Morning Shift
        </button>
        <button 
          onClick={() => setShiftFilter(shiftFilter === 'night' ? null : 'night')}
          className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            shiftFilter === 'night' 
              ? 'bg-amber-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Night Shift
        </button>
      </div>

      <div className='flex flex-col md:flex-row gap-6'>
        {/* Speciality Filters */}
        <div className='w-full md:w-64'>
          <button 
            onClick={() => setShowFilter(!showFilter)} 
            className={`md:hidden py-2 px-4 mb-4 w-full rounded-md text-sm font-medium ${
              showFilter ? 'bg-amber-600 text-white' : 'bg-gray-100'
            }`}
          >
            {showFilter ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <div className={`${showFilter ? 'block' : 'hidden'} md:block space-y-2`}>
            {[
              'General physician', 
              'Gynecologist', 
              'Dermatologist',
              'Pediatricians',
              'Neurologist',
              'Gastroenterologist'
            ].map(spec => (
              <button
                key={spec}
                onClick={() => speciality === spec ? navigate('/doctors') : navigate(`/doctors/${spec}`)}
                className={`w-full text-left py-2 px-4 rounded-md text-sm transition-colors ${
                  speciality === spec 
                    ? 'bg-amber-100 text-amber-800 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
        
        {/* Doctors List */}
        <div className='flex-1'>
          {filterDoc.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {filterDoc.map((item) => (
                <div 
                  key={item._id}
                  onClick={() => {
                    navigate(`/appointment/${item._id}`);
                    window.scrollTo(0, 0);
                  }} 
                  className='border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all'
                >
                  <img 
                    className='w-full h-48 object-cover bg-gray-100' 
                    src={item.image} 
                    alt={item.name} 
                  />
                  <div className='p-4'>
                    <div className={`flex items-center gap-2 ${
                      item.available ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        item.available ? 'bg-green-500' : 'bg-gray-400'
                      }`}></span>
                      <span className='text-sm'>
                        {item.available ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    <h3 className='text-lg font-semibold mt-1 text-gray-800'>{item.name}</h3>
                    <p className='text-gray-600 text-sm'>{item.speciality}</p>
                    <p className='text-gray-500 text-xs mt-2'>
                      Hours: {item.startTime || '09:00'} - {item.endTime || '17:00'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-10 text-gray-500'>
              No doctors found matching your filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;