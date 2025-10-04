import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';

const AddDoctor = () => {
    const [docImg, setDocImg] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [experience, setExperience] = useState('1 Year');
    const [fees, setFees] = useState('');
    const [about, setAbout] = useState('');
    const [caseHistory, setCaseHistory] = useState('');
    const [speciality, setSpeciality] = useState('General physician');
    const [degree, setDegree] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { backendUrl } = useContext(AppContext);
    const { aToken } = useContext(AdminContext);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            if (!docImg) {
                toast.error('Doctor\'s image is required.');
                setIsLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('image', docImg);
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('experience', experience);
            formData.append('fees', Number(fees));
            formData.append('about', about);
            formData.append('caseHistory', caseHistory);
            formData.append('speciality', speciality);
            formData.append('degree', degree);
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }));

            const { data } = await axios.post(`${backendUrl}/api/admin/add-doctor`, formData, { headers: { aToken } });
            
            if (data.success) {
                toast.success(data.message);
                // Reset form
                setDocImg(null);
                setName('');
                setPassword('');
                setEmail('');
                setAddress1('');
                setAddress2('');
                setDegree('');
                setAbout('');
                setCaseHistory('');
                setFees('');
                setSpeciality('General physician');
                setExperience('1 Year');
                event.target.reset();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const FormField = ({ label, children }) => (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
            {children}
        </div>
    );

    const Section = ({ title, children }) => (
        <div className="mt-8">
            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-start">
                    <span className="bg-white pr-3 text-lg font-medium text-gray-800">{title}</span>
                </div>
            </div>
            <div className="mt-6">{children}</div>
        </div>
    );
    
    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
            {/* The old hacky classes have been removed from the form element */}
            <form onSubmit={onSubmitHandler} className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 bg-amber-100 text-amber-600 rounded-lg p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Add New Doctor</h1>
                </div>
                
                <Section title="Basic Information">
                    <div className="flex items-center gap-6">
                        <label htmlFor="doc-img" className="cursor-pointer group flex-shrink-0">
                            <div className="relative">
                                <img 
                                    className="w-28 h-28 rounded-full object-cover border-4 border-white ring-2 ring-gray-200 group-hover:ring-amber-500 transition-all" 
                                    src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} 
                                    alt="Doctor preview" 
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                </div>
                            </div>
                        </label>
                        <div className="flex flex-col justify-center">
                            <p className="text-gray-700 font-semibold">Doctor's Photograph</p>
                            <p className="text-sm text-gray-500 mt-1">Click to upload a high-quality image (JPG, PNG).</p>
                        </div>
                        <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" accept="image/*" className="hidden" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-6">
                        <FormField label="Full Name"><input onChange={e => setName(e.target.value)} value={name} className="input-style" type="text" placeholder="Dr. John Smith" required /></FormField>
                        <FormField label="Degree"><input onChange={e => setDegree(e.target.value)} value={degree} className="input-style" type="text" placeholder="MBBS, MD" required /></FormField>
                        <FormField label="Email Address"><input onChange={e => setEmail(e.target.value)} value={email} className="input-style" type="email" placeholder="doctor@example.com" required /></FormField>
                        <FormField label="Password"><input onChange={e => setPassword(e.target.value)} value={password} className="input-style" type="password" placeholder="••••••••" required /></FormField>
                    </div>
                </Section>

                <Section title="Professional Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                        <FormField label="Speciality">
                            <select onChange={e => setSpeciality(e.target.value)} value={speciality} className="input-style">
                                <option value="General physician">General Physician</option><option value="Gynecologist">Gynecologist</option><option value="Dermatologist">Dermatologist</option><option value="Pediatricians">Pediatrician</option><option value="Neurologist">Neurologist</option><option value="Gastroenterologist">Gastroenterologist</option>
                            </select>
                        </FormField>
                        <FormField label="Years of Experience">
                            <select onChange={e => setExperience(e.target.value)} value={experience} className="input-style">
                                {[...Array(20).keys()].map(i => <option key={i+1} value={`${i+1} Year`}>{i+1} {i+1 === 1 ? 'Year' : 'Years'}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Consultation Fee">
                            <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-gray-500 sm:text-sm">₹</span></div><input onChange={e => setFees(e.target.value)} value={fees} className="input-style pl-7" type="number" placeholder="500" required /></div>
                        </FormField>
                    </div>
                    <div className="mt-5">
                        <FormField label="Address">
                            <input onChange={e => setAddress1(e.target.value)} value={address1} className="input-style mb-2" type="text" placeholder="Street Address / Building Name" required />
                            <input onChange={e => setAddress2(e.target.value)} value={address2} className="input-style" type="text" placeholder="City, State, PIN Code" />
                        </FormField>
                    </div>
                </Section>

                <Section title="Detailed Summary">
                    <div className="grid grid-cols-1 gap-5">
                        <FormField label="About Doctor (Professional Summary)">
                            <textarea onChange={e => setAbout(e.target.value)} value={about} className="input-style min-h-28" rows="4" placeholder="Write a brief professional summary to be displayed on the profile..."></textarea>
                        </FormField>
                        <FormField label="Case History & Notable Achievements">
                            <textarea onChange={e => setCaseHistory(e.target.value)} value={caseHistory} className="input-style min-h-28" rows="4" placeholder="Detail notable cases, research, published papers, or awards..."></textarea>
                        </FormField>
                    </div>
                </Section>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                    <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                        {isLoading ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing...</>
                        ) : (
                            <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>Add Doctor</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddDoctor;