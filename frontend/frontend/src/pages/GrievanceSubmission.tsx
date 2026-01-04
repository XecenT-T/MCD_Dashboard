import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const GrievanceSubmission = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState(''); // Stores text notes
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    // Simulate recording time
    const [timer, setTimer] = useState("00:00");

    const toggleRecording = () => {
        if (!isRecording) {
            setIsRecording(true);
            setTimer("00:01");
            // Simulate timer just for UI feel
        } else {
            setIsRecording(false);
            setTimer("00:00");
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            };
            // For now verify strictly just the text data submission as voice blob handling would need AWS S3/Cloudinary
            // We use a dummy title since the new design focuses on voice
            const payload = {
                title: title || "Voice Grievance",
                description: description || "[Voice Recording Attached]"
            };

            await api.post('/api/grievances', payload, config);
            alert("Grievance Submitted Successfully!");
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert("Error submitting grievance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Voice Grievance">
            <div className="flex flex-col gap-3 mb-8">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 mb-2 text-sm">
                    <button onClick={() => navigate('/dashboard')} className="text-slate-500 dark:text-slate-400 hover:text-primary font-medium">Dashboard</button>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">/</span>
                    <span className="text-slate-900 dark:text-white font-medium">New Voice Submission</span>
                </div>

                <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">Voice Grievance Submission</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-normal max-w-3xl">
                    Press the microphone button and speak clearly to record your complaint. You can select your preferred language below.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Main Recorder */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Recorder Card */}
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-border-dark p-6 sm:p-8">
                        {/* Language Selector */}
                        <div className="mb-8">
                            <label className="flex flex-col w-full max-w-xs">
                                <span className="text-slate-900 dark:text-white text-base font-medium leading-normal pb-2">Select Language</span>
                                <div className="relative">
                                    <select
                                        value={selectedLanguage}
                                        onChange={(e) => setSelectedLanguage(e.target.value)}
                                        className="flex w-full appearance-none rounded-lg text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 px-4 text-base font-normal focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow cursor-pointer"
                                    >
                                        <option value="en">English</option>
                                        <option value="hi">Hindi (हिंदी)</option>
                                        <option value="ur">Urdu (اردو)</option>
                                        <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Audio Visualizer Mockup */}
                        <div className="flex items-center justify-center h-32 mb-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 relative overflow-hidden group">
                            {!isRecording ? (
                                <span className="absolute text-slate-400 dark:text-slate-500 text-sm font-medium z-10 transition-opacity">
                                    Audio waveform will appear here
                                </span>
                            ) : (
                                <div className="flex items-end gap-1 h-12 opacity-80 transition-opacity duration-300 animate-pulse">
                                    <div className="w-2 bg-primary/40 rounded-full h-4 animate-[bounce_1s_infinite_100ms]"></div>
                                    <div className="w-2 bg-primary/60 rounded-full h-8 animate-[bounce_1s_infinite_200ms]"></div>
                                    <div className="w-2 bg-primary/80 rounded-full h-5 animate-[bounce_1s_infinite_300ms]"></div>
                                    <div className="w-2 bg-primary rounded-full h-10 animate-[bounce_1s_infinite_150ms]"></div>
                                    <div className="w-2 bg-primary rounded-full h-6 animate-[bounce_1s_infinite_250ms]"></div>
                                    <div className="w-2 bg-primary rounded-full h-12 animate-[bounce_1s_infinite_350ms]"></div>
                                    <div className="w-2 bg-primary rounded-full h-8 animate-[bounce_1s_infinite_100ms]"></div>
                                    <div className="w-2 bg-primary rounded-full h-4 animate-[bounce_1s_infinite_200ms]"></div>
                                    <div className="w-2 bg-primary/80 rounded-full h-7 animate-[bounce_1s_infinite_300ms]"></div>
                                    <div className="w-2 bg-primary/60 rounded-full h-3 animate-[bounce_1s_infinite_150ms]"></div>
                                    <div className="w-2 bg-primary/40 rounded-full h-5 animate-[bounce_1s_infinite_250ms]"></div>
                                </div>
                            )}
                        </div>

                        {/* Recording Controls */}
                        <div className="flex flex-col items-center gap-6">
                            <div className={`text-3xl font-mono font-medium tracking-widest ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                                {isRecording ? "00:12" : "00:00"}
                            </div>

                            {/* Main Action Button */}
                            <div className="relative group">
                                <div className={`absolute inset-0 rounded-full bg-primary/20 ${isRecording ? 'animate-ping opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
                                <button
                                    onClick={toggleRecording}
                                    className={`relative flex items-center justify-center size-20 rounded-full text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 z-10 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
                                >
                                    <span className="material-symbols-outlined !text-4xl">{isRecording ? 'stop' : 'mic'}</span>
                                </button>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 text-sm">{isRecording ? "Tap stop to finish recording" : "Tap microphone to start recording"}</p>

                            {/* Secondary Controls */}
                            <div className={`flex gap-4 mt-2 transition-opacity ${!isRecording && timer !== "00:00" ? 'opacity-100 pointer-events-auto' : 'opacity-50 grayscale pointer-events-none'}`}>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <span className="material-symbols-outlined !text-lg">play_arrow</span>
                                    Preview
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <span className="material-symbols-outlined !text-lg">delete</span>
                                    Retake
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Additional Details & Submit */}
                <div className="flex-1 lg:max-w-md flex flex-col gap-6">
                    <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-border-dark p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Additional Details</h3>
                        <div className="flex flex-col gap-4">
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">Grievance Title</span>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Brief title"
                                    type="text"
                                />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">Additional Notes</span>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full resize-none rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Type any extra information here if you couldn't say it..."
                                    rows={5}
                                ></textarea>
                            </label>
                        </div>
                    </div>

                    {/* Guidelines Card */}
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10 p-5">
                        <div className="flex gap-3">
                            <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                            <div className="flex flex-col gap-1">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recording Tips</h4>
                                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                    <li>Find a quiet place to record.</li>
                                    <li>Speak clearly and at a normal pace.</li>
                                    <li>Max recording time is 2 minutes.</li>
                                    <li>Keep the phone close if using mobile.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Submit Action */}
                    <div className="pt-2">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white h-14 text-base font-bold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            <span>{loading ? 'Sending...' : 'Submit Grievance'}</span>
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default GrievanceSubmission;
