import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
// --- IMPORTS FOR EMAIL NOTIFICATION ---
import { sendEmail } from '../services/emailService.js';
import { appointmentCancelled } from '../utils/emailTemplates.js';
// --- END IMPORTS ---

// API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body
        // Fetch the appointment details BEFORE updating, so we can use them for the email.
        const appointment = await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // --- EMAIL NOTIFICATION ---
        // Check if the appointment was found and updated successfully
        if (appointment) {
            try {
                const { userData, docData, slotDate, slotTime } = appointment;
                
                // 1. Prepare and send email to the Patient
                const patientEmailContent = appointmentCancelled(userData.name, docData.name, slotDate.replace(/_/g, '/'), slotTime);
                sendEmail({
                    from: process.env.GMAIL_EMAIL,
                    to: userData.email,
                    subject: patientEmailContent.subject,
                    html: patientEmailContent.html,
                });

                // 2. Prepare and send email to the Doctor
                const doctorEmailContent = appointmentCancelled(`Dr. ${docData.name}`, `Patient: ${userData.name}`, slotDate.replace(/_/g, '/'), slotTime);
                sendEmail({
                    from: process.env.GMAIL_EMAIL,
                    to: docData.email,
                    subject: 'An Appointment has been Cancelled by Admin',
                    html: doctorEmailContent.html,
                });

            } catch (emailError) {
                // Log any errors that occur during email sending, but don't stop the main response
                console.error("Failed to send cancellation emails:", emailError);
            }
        }
        // --- END NOTIFICATION ---

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API for adding Doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, caseHistory, fees, address } = req.body
        const imageFile = req.file

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            caseHistory,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        res.json({ success: true, message: 'Doctor Added' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        // Calculate total earnings from completed or paid appointments
        let totalEarnings = 0;
        appointments.forEach((appointment) => {
            if (appointment.isCompleted || appointment.payment) {
                totalEarnings += appointment.amount;
            }
        });

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            earnings: totalEarnings,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to delete a doctor
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        
        const doctor = await doctorModel.findById(id);
        if (doctor?.image) {
            const publicId = doctor.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        const deletedDoctor = await doctorModel.findByIdAndDelete(id);
        
        if (!deletedDoctor) {
            return res.status(404).json({ 
                success: false, 
                message: 'Doctor not found' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Doctor deleted successfully' 
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
}
const updateDoctorFee = async (req, res) => {
    try {
        const { doctorId, fees } = req.body;
        if (!doctorId || fees === undefined) {
            return res.status(400).json({ success: false, message: "Doctor ID and fee are required." });
        }

        if (isNaN(fees) || Number(fees) < 0) {
            return res.status(400).json({ success: false, message: "Please enter a valid fee." });
        }

        const updatedDoctor = await doctorModel.findByIdAndUpdate(
            doctorId,
            { fees: Number(fees) },
            { new: true }
        );

        if (!updatedDoctor) {
            return res.status(404).json({ success: false, message: "Doctor not found." });
        }

        res.json({ success: true, message: "Fee updated successfully.", doctor: updatedDoctor });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export {
    loginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    addDoctor,
    allDoctors,
    adminDashboard,
    deleteDoctor,
    updateDoctorFee
}