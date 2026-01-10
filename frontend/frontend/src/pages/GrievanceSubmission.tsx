import { useState, useEffect, useRef } from 'react';
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
    const [timer, setTimer] = useState(0);
    const [recognition, setRecognition] = useState<any>(null);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(true);
    const [isRefining, setIsRefining] = useState(false); // New state for refinement loading
    const [audioLevels, setAudioLevels] = useState<number[]>(new Array(12).fill(10)); // Visualizer data

    // Refs for control
    const shouldKeepRecording = useRef(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = true; // Use continuous
            rec.interimResults = true;

            rec.onresult = (event: any) => {
                let finalTranscript = '';
                let currentInterim = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        currentInterim += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setDescription(prev => prev + (prev ? ' ' : '') + finalTranscript);
                }
                setInterimTranscript(currentInterim);
            };

            rec.onend = () => {
                // Auto-restart logic
                if (shouldKeepRecording.current) {
                    try {
                        rec.start();
                    } catch (e) {
                        console.error("Restart failed", e);
                        setIsRecording(false);
                        stopVisualizer();
                    }
                } else {
                    setIsRecording(false);
                    stopVisualizer();
                }
            };

            rec.onerror = (event: any) => {
                // Ignore 'no-speech' errors as we want to keep listening
                if (event.error === 'no-speech') {
                    return;
                }
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    shouldKeepRecording.current = false;
                    setIsRecording(false);
                    stopVisualizer();
                }
            };

            setRecognition(rec);

            return () => {
                rec.onend = null; // Prevent restart loops on unmount
                rec.stop();
                stopVisualizer(); // Ensure visualizer is stopped on unmount
            };
        } else {
            setIsSupported(false);
        }
    }, []);

    // Visualizer Logic
    const startVisualizer = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64; // Small size for fewer bars

            const microphone = audioCtx.createMediaStreamSource(stream);
            microphone.connect(analyser);

            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;
            microphoneRef.current = microphone;
            mediaStreamRef.current = stream;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateVisualizer = () => {
                if (!shouldKeepRecording.current || !analyserRef.current) {
                    // If recording stopped or analyser is gone, stop the loop
                    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
                    return;
                }

                analyserRef.current.getByteFrequencyData(dataArray);

                // Extract a subset of frequencies for the visualizer (12 bars)
                const relevantData = [];
                // Simple sampling
                for (let i = 0; i < 12; i++) {
                    const val = dataArray[i * 2] || 0; // Take every 2nd bin
                    relevantData.push(Math.max(10, val / 2)); // Scale down and min height
                }

                setAudioLevels(relevantData);
                rafIdRef.current = requestAnimationFrame(updateVisualizer);
            };

            updateVisualizer();

        } catch (err) {
            console.error("Visualizer setup failed", err);
            // If visualizer fails, don't block speech recognition
        }
    };

    const stopVisualizer = () => {
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
        if (microphoneRef.current) {
            microphoneRef.current.disconnect();
            microphoneRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        // Reset levels
        setAudioLevels(new Array(12).fill(10));
    };

    const toggleRecording = async () => {
        if (!isSupported) {
            alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
            return;
        }

        if (!recognition) return;

        if (!isRecording) {
            const langMap: Record<string, string> = {
                'en': 'en-IN',
                'hi': 'hi-IN',
                'ur': 'ur-IN',
                'pa': 'pa-IN'
            };
            recognition.lang = langMap[selectedLanguage] || 'en-IN';

            shouldKeepRecording.current = true;
            setIsRecording(true);
            setTimer(0);
            setInterimTranscript('');

            try {
                recognition.start();
                startVisualizer();
            } catch (err) {
                console.error("Failed to start", err);
                setIsRecording(false);
                shouldKeepRecording.current = false;
                stopVisualizer();
            }
        } else {
            shouldKeepRecording.current = false;
            recognition.stop();
            // isRecording set to false in onEnd
            // visualizer stopped in onEnd

            // Auto-Refine Logic
            if (description.trim().length > 5) { // Only refine if there's substantial text
                setIsRefining(true);
                try {
                    const config = {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        }
                    };
                    // Wait a moment for final transcript to settle
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const res = await api.post('/api/chat/refine', {
                        text: description,
                        language: selectedLanguage
                    }, config);

                    if (res.data.refinedText) {
                        setDescription(res.data.refinedText);
                    }
                } catch (error) {
                    console.error("Refinement failed", error);
                } finally {
                    setIsRefining(false);
                }
            }
        }
    };

    // Timer effect
    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        if (!title.trim() && !description.trim()) {
            alert("Please provide at least a title or a description.");
            return;
        }
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

                {!isSupported && (
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 border border-red-200" role="alert">
                        <span className="font-medium">Browser Verified:</span> Speech Recognition is not supported in this browser. Please use <b>Google Chrome</b>, <b>Microsoft Edge</b>, or <b>Safari</b>.
                    </div>
                )}
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

                        {/* Audio Visualizer */}
                        <div className="flex items-center justify-center h-32 mb-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 relative overflow-hidden group">
                            {!isRecording ? (
                                <span className="absolute text-slate-400 dark:text-slate-500 text-sm font-medium z-10 transition-opacity">
                                    Audio waveform will appear here
                                </span>
                            ) : (
                                <div className="flex flex-col items-center gap-3 w-full px-6">
                                    {/* Real-Time Bars */}
                                    <div className="flex items-end gap-1.5 h-16 transform transition-all">
                                        {audioLevels.map((val, idx) => (
                                            <div
                                                key={idx}
                                                style={{ height: `${Math.min(val, 64)}px` }}
                                                className="w-3 bg-primary rounded-full transition-all duration-75"
                                            ></div>
                                        ))}
                                    </div>
                                    {interimTranscript && (
                                        <p className="text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-2 italic text-center line-clamp-2">
                                            "{interimTranscript}..."
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Refinement Indicator */}
                            {isRefining && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-primary text-3xl animate-spin">autorenew</span>
                                    <p className="text-sm font-bold text-primary mt-2">Polishing your text with AI...</p>
                                </div>
                            )}
                        </div>

                        {/* Recording Controls */}
                        <div className="flex flex-col items-center gap-6">
                            <div className={`text-3xl font-mono font-medium tracking-widest ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                                {formatTime(timer)}
                            </div>

                            {/* Main Action Button */}
                            <div className="relative group">
                                <div className={`absolute inset-0 rounded-full bg-primary/20 ${isRecording ? 'animate-ping opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
                                <button
                                    onClick={toggleRecording}
                                    disabled={!isSupported}
                                    className={`relative flex items-center justify-center size-20 rounded-full text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 z-10 ${!isSupported ? 'bg-slate-300 cursor-not-allowed' : isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
                                >
                                    <span className="material-symbols-outlined !text-4xl">{isRecording ? 'stop' : 'mic'}</span>
                                </button>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                {!isSupported ? "Microphone unavailable" : isRecording ? "Tap stop to finish recording" : "Tap microphone to start recording"}
                            </p>

                            {/* Secondary Controls */}
                            <div className={`flex gap-4 mt-2 transition-opacity ${!isRecording && timer !== 0 ? 'opacity-100 pointer-events-auto' : 'opacity-50 grayscale pointer-events-none'}`}>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <span className="material-symbols-outlined !text-lg">play_arrow</span>
                                    Preview
                                </button>
                                <button onClick={() => { setTimer(0); setDescription(''); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <span className="material-symbols-outlined !text-lg">delete_sweep</span>
                                    Clear
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
        </DashboardLayout >
    );
};

export default GrievanceSubmission;
