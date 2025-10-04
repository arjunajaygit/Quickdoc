import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Reschedule = () => {
    const { appointmentId } = useParams();
    // Reverted the change here - we will define the function locally instead
    const { doctors, backendUrl, token, getDoctosData } = useContext(AppContext);
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [docInfo, setDocInfo] = useState(null);
    const [docSlots, setDocSlots] = useState([]);
    const [slotIndex, setSlotIndex] = useState(0);
    const [slotTime, setSlotTime] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // THE FIX: Define the function directly in the component
    const slotDateFormat = (slotDate) => {
        if (!slotDate) return '';
        const dateArray = slotDate.split('_');
        return `${dateArray[0]} ${months[Number(dateArray[1]) - 1]} ${dateArray[2]}`;
    };

    const fetchAppointmentDetails = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/appointment/${appointmentId}`, { headers: { token } });
            if (data.success) {
                setAppointment(data.appointment);
            } else {
                toast.error(data.message);
                navigate('/my-appointments');
            }
        } catch (error) {
            toast.error("Failed to load appointment details.");
            navigate('/my-appointments');
        }
    };

    useEffect(() => {
        if (appointment && doctors.length > 0) {
            const doctor = doctors.find(doc => doc._id === appointment.docId);
            setDocInfo(doctor);
        }
    }, [appointment, doctors]);
    
    useEffect(() => {
        if (docInfo) {
            getAvailableSlots();
            setIsLoading(false);
        }
    }, [docInfo]);
    
    useEffect(() => {
        if (token) {
            fetchAppointmentDetails();
        } else {
            navigate('/login');
        }
    }, [token, appointmentId]);

    const generateTimeSlots = (date, startTime, endTime) => {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        const dayStart = new Date(date);
        dayStart.setHours(startHour, startMinute, 0, 0);
        
        const dayEnd = new Date(date);
        dayEnd.setHours(endHour, endMinute, 0, 0);

        const breakStart = new Date(date);
        breakStart.setHours(12, 0, 0, 0);
        const breakEnd = new Date(date);
        breakEnd.setHours(13, 0, 0, 0);

        let currentSlot = new Date(dayStart);
        const slots = [];

        if (date.toDateString() === new Date().toDateString()) {
            const now = new Date();
            if (currentSlot < now) {
                currentSlot = new Date(now);
                const minutes = currentSlot.getMinutes();
                currentSlot.setMinutes(minutes + (15 - (minutes % 15)));
                currentSlot.setSeconds(0);
                currentSlot.setMilliseconds(0);
            }
        }

        while (currentSlot < dayEnd) {
            if (currentSlot >= breakStart && currentSlot < breakEnd) {
                currentSlot = new Date(breakEnd);
                continue;
            }

            const formattedTime = currentSlot.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            const slotDateStr = `${currentSlot.getDate()}_${currentSlot.getMonth() + 1}_${currentSlot.getFullYear()}`;
            
            let isAvailable = !docInfo.slots_booked[slotDateStr]?.includes(formattedTime);

            if (appointment.slotDate === slotDateStr && appointment.slotTime === formattedTime) {
                isAvailable = true;
            }

            if (isAvailable) {
                slots.push({
                    datetime: new Date(currentSlot),
                    time: formattedTime,
                    displayMonth: months[currentSlot.getMonth()]
                });
            }

            currentSlot.setMinutes(currentSlot.getMinutes() + 15);
        }
        return slots;
    };

    const getAvailableSlots = () => {
        if (!docInfo) return;

        setDocSlots([]);
        const today = new Date();
        const slotsForWeek = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const timeSlots = generateTimeSlots(
                date,
                docInfo.startTime || '09:00',
                docInfo.endTime || '17:00'
            );
            slotsForWeek.push(timeSlots);
        }
        setDocSlots(slotsForWeek);
    };

    const handleReschedule = async () => {
        if (!slotTime) {
            toast.warning('Please select a new time slot.');
            return;
        }

        const date = docSlots[slotIndex][0].datetime;
        const newSlotDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;

        if(newSlotDate === appointment.slotDate && slotTime === appointment.slotTime) {
            toast.info("This is the currently booked slot. Please select a different one.");
            return;
        }

        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/reschedule-appointment`,
                { appointmentId, newSlotDate, newSlotTime: slotTime },
                { headers: { token } }
            );

            if (data.success) {
                toast.success(data.message);
                getDoctosData();
                navigate('/my-appointments');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reschedule.");
        }
    };

    if (isLoading || !docInfo || !appointment) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600"></div>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-amber-100">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Reschedule Appointment</h1>
                <p className="text-gray-600 mb-6">With Dr. {docInfo.name}</p>

                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800">Current Appointment:</h3>
                    <p className="text-gray-700">{slotDateFormat(appointment.slotDate)} at {appointment.slotTime}</p>
                </div>
                
                <div className="mb-6">
                    <h3 className="text-gray-700 font-medium mb-3">Select a New Date</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {docSlots.map((item, index) => (
                            item.length > 0 && <div 
                                key={index}
                                onClick={() => setSlotIndex(index)}
                                className={`flex flex-col items-center justify-center min-w-20 h-20 rounded-xl cursor-pointer transition-colors ${
                                    slotIndex === index 
                                        ? 'bg-amber-600 text-white' 
                                        : 'bg-amber-50 text-gray-700 hover:bg-amber-100'
                                }`}
                            >
                                <span className="text-sm font-medium">{item[0]?.displayMonth}</span>
                                <span className="text-sm font-medium">{daysOfWeek[item[0].datetime.getDay()]}</span>
                                <span className="text-lg font-semibold">{item[0].datetime.getDate()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-gray-700 font-medium mb-3">Available Time Slots</h3>
                    {docSlots[slotIndex]?.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {docSlots[slotIndex].map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSlotTime(item.time)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        item.time === slotTime
                                            ? 'bg-amber-600 text-white'
                                            : 'bg-amber-50 text-gray-700 hover:bg-amber-100'
                                    }`}
                                >
                                    {item.time.toLowerCase()}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No available slots for this day.</p>
                    )}
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate('/my-appointments')}
                        className="w-full py-3 rounded-xl font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleReschedule}
                        disabled={!slotTime}
                        className={`w-full py-3 rounded-xl font-medium text-white transition-colors ${
                            slotTime 
                                ? 'bg-amber-600 hover:bg-amber-700 shadow-md'
                                : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        {slotTime ? 'Confirm Reschedule' : 'Select a New Slot'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reschedule;