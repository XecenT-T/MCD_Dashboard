import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import * as faceapi from 'face-api.js';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface AttendanceRecord {
    _id: string;
    date: string;
    checkInTime: string;
    location: { lat: number; lng: number; address: string };
    status: string;
    method: string;
}

const Attendance = () => {
    const { user, token } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [locationStep, setLocationStep] = useState<'pending' | 'success'>('pending');
    const [faceStep, setFaceStep] = useState<'pending' | 'scanning' | 'success'>('pending');
    const [finalStep, setFinalStep] = useState<'pending' | 'success'>('pending');

    const [location, setLocation] = useState<{ lat: number; lng: number, address?: string } | null>(null);
    const [locationStatus, setLocationStatus] = useState<string>("Locating...");
    const [faceStatus, setFaceStatus] = useState<string>("Waiting for location...");
    const [userDescriptor, setUserDescriptor] = useState<Float32Array | null>(null);

    // Attendance Records
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [showRecords, setShowRecords] = useState(false);

    // Fetch attendance records
    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const res = await api.get('/api/attendance', {
                    headers: { 'x-auth-token': token }
                });
                setAttendanceRecords(res.data);
            } catch (err) {
                console.error('Error fetching attendance:', err);
            }
        };
        if (token) fetchRecords();
    }, [token, finalStep]);

    // 1. Load User Descriptor
    useEffect(() => {
        if (user && user.faceDescriptor) {
            setUserDescriptor(new Float32Array(user.faceDescriptor));
        }
    }, [user]);

    // 2. Geolocation Check with Strict Delhi Fallback
    const fetchLocation = async () => {
        setLocationStatus("Locating...");
        setLocationStep('pending');

        const useFallback = () => {
            // Default to Delhi (MCD Civic Centre) if GPS fails
            console.warn("GPS failed. Defaulting to Delhi.");
            const delhiLat = 28.6139;
            const delhiLng = 77.2090;

            setLocation({
                lat: delhiLat,
                lng: delhiLng,
                address: 'New Delhi, India (Default)'
            });
            setLocationStatus("GPS Failed. Defaulting to Delhi.");
            setLocationStep('success');
            setFaceStep('scanning');
        };

        if (!navigator.geolocation) {
            useFallback();
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 15000, // Increased timeout for better GPS chance
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                // Reverse Geocoding
                let address = 'Unknown Location';
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
                    const data = await res.json();
                    if (data && data.display_name) {
                        address = data.display_name.split(',').slice(0, 3).join(',');
                    }
                } catch (e) {
                    console.error("Geocoding failed", e);
                }

                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    address: address
                });
                setLocationStatus("Location Verified (GPS)");
                setLocationStep('success');
                setFaceStep('scanning');
            },
            (error) => {
                console.error("GPS Error:", error);
                useFallback();
            },
            options
        );
    };

    useEffect(() => {
        fetchLocation();
    }, []);

    // 3. Face Recognition Logic
    useEffect(() => {
        if (faceStep === 'scanning' && !userDescriptor) {
            setFaceStatus("Face ID not set up. Please register on Dashboard.");
            return;
        }

        if (faceStep !== 'scanning' || !userDescriptor) return;

        setFaceStatus("Loading AI models...");
        const loadModels = async () => {
            // Use CDN for better reliability
            const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
            try {
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                startVideo();
            } catch (err) {
                console.error("Error loading models:", err);
                setFaceStatus("Error loading AI models. Refresh page.");
            }
        };
        loadModels();
    }, [faceStep, userDescriptor]);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => {
                console.error(err);
                setFaceStatus("Camera access denied");
            });
    };

    const handleVideoPlay = () => {
        setFaceStatus('Scanning face...');
        const intervalId = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current || !userDescriptor) return;

            const displaySize = {
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight
            };
            faceapi.matchDimensions(canvasRef.current, displaySize);

            const detections = await faceapi.detectAllFaces(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptors();

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            if (detections.length > 0) {
                const faceMatcher = new faceapi.FaceMatcher(userDescriptor, 0.6);
                const bestMatch = detections.map(d => faceMatcher.findBestMatch(d.descriptor)).find(match => match.label !== 'unknown');

                if (bestMatch) {
                    clearInterval(intervalId);
                    markAttendance();
                }
            }
        }, 500);

        return () => clearInterval(intervalId);
    };

    const markAttendance = async () => {
        setFaceStep('success');
        setFinalStep('success');
        setFaceStatus('Verified! Marking...');

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            };
            const res = await api.post('/api/attendance/mark', { location }, config);

            // Instant update
            if (res.data.attendance) {
                setAttendanceRecords(prev => [res.data.attendance, ...prev]);
                alert("Attendance Marked Successfully!");
                setShowRecords(true); // Switch to records view
            }
        } catch (err: any) {
            console.error(err);
            setFaceStatus(err.response?.data?.msg || "Failed to mark attendance.");
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-x-hidden">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark px-6 py-3 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center rounded bg-primary/10 p-1.5 text-primary">
                        <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">MCD Official Portal</h2>
                </div>
                <div className="hidden md:flex flex-1 justify-center">
                    <nav className="flex items-center gap-8">
                        <button onClick={() => navigate('/dashboard')} className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors">Dashboard</button>
                        <button onClick={() => navigate('/payroll')} className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors">Payroll</button>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <span className="flex items-center justify-center h-6 w-6 text-xs font-bold text-gray-500 bg-gray-200 rounded-full">{user?.name?.charAt(0)}</span>
                        <span className="text-sm font-medium hidden sm:block">{user?.name}</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-8 md:px-8 lg:px-12 xl:px-40">
                <div className="mx-auto max-w-6xl flex flex-col gap-8">
                    {/* Page Heading */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                <button onClick={() => navigate('/dashboard')} className="hover:underline">Dashboard</button>
                                <span className="material-symbols-outlined text-base">chevron_right</span>
                                <span>Attendance</span>
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{t('daily_attendance')}</h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400 text-base max-w-2xl">
                            {t('verify_attendance_desc')}
                        </p>
                    </div>
                    {/* Toggle Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowRecords(false)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showRecords ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                        >
                            {t('mark_attendance')}
                        </button>
                        <button
                            onClick={() => setShowRecords(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showRecords ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                        >
                            {t('view_records')}
                        </button>
                    </div>
                    {/* </div> Removed premature closing tag */}

                    {showRecords ? (
                        /* Attendance Records Table */
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">history</span>
                                    {t('attendance_history')}
                                </h3>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{attendanceRecords.length} Records</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-In Time</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {attendanceRecords.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                    <span className="material-symbols-outlined text-4xl mb-2 block">event_busy</span>
                                                    No attendance records found
                                                </td>
                                            </tr>
                                        ) : (
                                            attendanceRecords.map((record) => (
                                                <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                                <span className="material-symbols-outlined">calendar_today</span>
                                                            </div>
                                                            <span className="font-medium text-slate-900 dark:text-white">{formatDate(record.date)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-slate-400 text-lg">schedule</span>
                                                            <span className="font-semibold text-slate-900 dark:text-white">{record.checkInTime || 'N/A'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-green-500 text-lg">location_on</span>
                                                            <div>
                                                                <p className="text-sm text-slate-900 dark:text-white">{record.location?.address || 'Office'}</p>
                                                                {record.location?.lat && (
                                                                    <p className="text-xs text-slate-400">
                                                                        {record.location.lat.toFixed(4)}, {record.location.lng.toFixed(4)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                            record.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                            <span className="material-symbols-outlined text-sm">
                                                                {record.status === 'Present' ? 'check_circle' : record.status === 'Late' ? 'schedule' : 'cancel'}
                                                            </span>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                                            <span className="material-symbols-outlined text-lg">{record.method === 'Face' ? 'face' : 'edit'}</span>
                                                            {record.method}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* Mark Attendance UI */
                        <>
                            {/* Stepper */}
                            <div className="relative">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 rounded-full z-0"></div>
                                <div className="relative z-10 flex justify-between w-full max-w-2xl mx-auto">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg ring-4 ring-background-light dark:ring-background-dark ${locationStep === 'success' ? 'bg-green-500 text-white' : 'bg-primary text-white'}`}>
                                            {locationStep === 'success' ? <span className="material-symbols-outlined text-xl font-bold">check</span> : <span className="text-sm font-bold">1</span>}
                                        </div>
                                        <span className={`text-sm font-semibold ${locationStep === 'success' ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}>{t('location_check')}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg ring-4 ring-background-light dark:ring-background-dark ${faceStep === 'success' ? 'bg-green-500 text-white' : faceStep === 'scanning' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                            {faceStep === 'success' ? <span className="material-symbols-outlined text-xl font-bold">check</span> : <span className="material-symbols-outlined filled">face</span>}
                                        </div>
                                        <span className={`text-sm font-bold ${faceStep === 'scanning' ? 'text-primary' : faceStep === 'success' ? 'text-green-600' : 'text-slate-400'}`}>{t('face_scan')}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg ring-4 ring-background-light dark:ring-background-dark ${finalStep === 'success' ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                            {finalStep === 'success' ? <span className="material-symbols-outlined text-xl font-bold">check</span> : <span className="text-sm font-bold">3</span>}
                                        </div>
                                        <span className={`text-sm font-medium ${finalStep === 'success' ? 'text-green-600' : 'text-slate-400'}`}>{t('confirmation')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Camera Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
                                <div className="lg:col-span-8 flex flex-col gap-4">
                                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary">videocam</span>
                                                {t('live_camera')}
                                            </h3>
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-red-500 animate-pulse">
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                REC
                                            </span>
                                        </div>
                                        <div className="relative bg-black aspect-video w-full flex items-center justify-center overflow-hidden">
                                            <video ref={videoRef} autoPlay muted onPlay={handleVideoPlay} className="w-full h-full object-cover" />
                                            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="relative w-64 h-80 border-2 border-primary/70 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(19,91,236,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary -mt-1 -ml-1 rounded-tl-xl"></div>
                                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary -mt-1 -mr-1 rounded-tr-xl"></div>
                                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary -mb-1 -ml-1 rounded-bl-xl"></div>
                                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary -mb-1 -mr-1 rounded-br-xl"></div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-6 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">face</span>
                                                {faceStatus}
                                            </div>
                                            {faceStatus.includes("ID not set") && (
                                                <button
                                                    onClick={() => navigate('/dashboard')}
                                                    className="absolute bottom-20 bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-colors pointer-events-auto flex items-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined">how_to_reg</span>
                                                    {t('setup_face_now')}
                                                </button>
                                            )}
                                        </div>
                                        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                <span className="material-symbols-outlined text-base align-text-bottom mr-1">info</span>
                                                Ensure your face is clearly visible and well-lit.
                                            </p>
                                            <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="lg:col-span-4 flex flex-col gap-6">
                                    {/* Location Card */}
                                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                            <h3 className="font-bold text-base flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-500">location_on</span>
                                                {t('location_verification')}
                                            </h3>
                                        </div>
                                        <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            {location ? (
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    scrolling="no"
                                                    src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
                                                ></iframe>
                                            ) : (
                                                <div className="text-slate-400 animate-pulse">Fetching Location...</div>
                                            )}
                                        </div>
                                        <div className={`p-4 ${locationStep === 'success' ? 'bg-green-50 dark:bg-green-900/10' : 'bg-yellow-50 dark:bg-yellow-900/10'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1 rounded-full ${locationStep === 'success' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                    <span className="material-symbols-outlined text-lg">{locationStep === 'success' ? 'verified' : 'pending'}</span>
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${locationStep === 'success' ? 'text-green-800' : 'text-yellow-800'}`}>{locationStatus}</p>
                                                    {location && <p className="text-xs text-slate-500">Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</p>}
                                                </div>
                                                <button onClick={fetchLocation} className="ml-auto text-xs bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-50 transition-colors">
                                                    Refresh
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Employee Details */}
                                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t('employee_details')}</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500">
                                                    <span className="material-symbols-outlined">badge</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Name</p>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-500">
                                                    <span className="material-symbols-outlined">schedule</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Date</p>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{new Date().toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <style>
                {`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                `}
            </style>
        </div>
    );
};

export default Attendance;
