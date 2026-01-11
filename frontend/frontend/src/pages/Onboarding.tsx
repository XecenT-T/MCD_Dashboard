import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

// Reuse FaceEnrollment logic (or import it if refactored)
// For speed, I'll build a custom simplified flow or import the component. 
// Since FaceEnrollment is a component that might be tied to Attendance, let's create a minimal version here or reuse.
// Actually, `FaceEnrollment` is not exported as a standalone component in the file list I've seen, it was part of `Attendance.tsx` logic or a separate file. 
// I'll check if I can import `FaceEnrollment` from `components/FaceEnrollment.tsx` if it exists, or build it.
// Checking file list... I don't see `components/FaceEnrollment.tsx` in recent file views, but I can check. 
// Instead of risking import error, I'll implement the Face Enrollment logic here using `face-api.js` similar to `Attendance.tsx`.
// Wait, for aesthetic onboarding, I should make it look good.

import * as faceapi from 'face-api.js';

const Onboarding = () => {
    const { reloadUser } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    // LanguageContext only has toggle. I might need to update LanguageContext to allow setting specific language.
    // For now, I can toggle if it's not the target.

    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Language, 2: Face ID
    const [loading, setLoading] = useState(false);
    const [faceEnrolled, setFaceEnrolled] = useState(false);

    // Face API State
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [captureVideo, setCaptureVideo] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const streamRef = React.useRef<MediaStream | null>(null);
    const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            try {
                console.log("Loading Face API models...");
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                console.log("Models loaded successfully");
                setModelsLoaded(true);
            } catch (err) {
                console.error("Failed to load Face API models:", err);
                alert("Failed to load AI models. Please refresh or check console.");
            }
        };
        loadModels();
    }, []);

    const cleanupCamera = () => {
        if (streamRef.current) {
            console.log("Stopping all tracks");
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const startVideo = () => {
        console.log("Starting video...");
        cleanupCamera(); // Ensure clean start
        setCaptureVideo(true);
        navigator.mediaDevices
            .getUserMedia({ video: { width: 300 } })
            .then(stream => {
                console.log("Stream received");
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Camera Error:", err);
                alert(`Failed to access camera: ${err.message}. Ensure permissions are granted.`);
                setCaptureVideo(false);
            });
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const startDetection = async () => {
            if (captureVideo && videoRef.current && canvasRef.current && !faceDescriptor) {
                // Ensure video is playing
                if (videoRef.current.paused || videoRef.current.ended) return;

                const displaySize = {
                    width: videoRef.current.videoWidth || 300,
                    height: videoRef.current.videoHeight || 300
                };

                // Match dimensions only if they differ to avoid flickering
                if (canvasRef.current.width !== displaySize.width) {
                    faceapi.matchDimensions(canvasRef.current, displaySize);
                }

                try {
                    const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
                        .withFaceLandmarks()
                        .withFaceDescriptors();

                    const resizedDetections = faceapi.resizeResults(detections, displaySize);

                    // Draw logic
                    const ctx = canvasRef.current.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, displaySize.width, displaySize.height);
                        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                    }

                    if (detections.length > 0) {
                        console.log("Face detected!", detections[0].descriptor);
                        setFaceDescriptor(detections[0].descriptor);
                        // Interval will be cleared by cleanup function as effect re-runs or component unmounts
                        // But since we set state, we likely want to stop detecting immediately
                        clearInterval(interval);
                    }
                } catch (e) {
                    console.error("Detection error:", e);
                }
            }
        };

        if (captureVideo && modelsLoaded) {
            interval = setInterval(startDetection, 100);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [captureVideo, modelsLoaded, faceDescriptor]); // Re-run if descriptor changes (to stop detection)

    const handleLanguageSelect = (lang: 'en' | 'hi' | 'pa' | 'mr' | 'ta' | 'te' | 'bn') => {
        setLanguage(lang);
    };

    const handleNext = () => {
        if (step === 1) {
            setStep(2);
        } else {
            finishOnboarding();
        }
    };

    const enrollFace = async () => {
        if (!faceDescriptor) {
            console.error("No face descriptor found");
            alert("No face detected to enroll. Please retry capture.");
            return;
        }
        try {
            console.log("Enrolling face...", faceDescriptor);
            setLoading(true);
            // faceDescriptor is a Float32Array, axios/JSON handles conversion to array usually, but explicit Array.from is safer
            const descriptorArray = Array.from(faceDescriptor);

            const res = await api.post('/api/auth/enroll-face', { faceDescriptor: descriptorArray });
            console.log("Enrollment response:", res.data);

            setFaceEnrolled(true);
            setLoading(false);
            alert(t('face_enrolled_success'));
        } catch (err: any) {
            console.error("Enrollment Error:", err);
            setLoading(false);
            alert(`${t('error_creating')}: ${err.response?.data?.msg || err.message}`);
        }
    };

    // Stop video when unmounting or finished
    useEffect(() => {
        return () => {
            cleanupCamera();
        };
    }, []);

    const finishOnboarding = async () => {
        try {
            setLoading(true);
            await api.post('/api/auth/complete-onboarding', { language });
            await reloadUser(); // Reload to get isOnboarded = true
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert("Failed to complete onboarding");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-surface-dark rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    {/* Progress */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                        <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                        {step === 1 ? t('choose_language_title') : t('register_face_id')}
                    </h1>
                    <p className="text-text-muted text-center mb-8">
                        {step === 1 ? t('select_lang_desc') : t('register_face_id')}
                    </p>

                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { code: 'en', label: 'English', flag: '🇺🇸' },
                                { code: 'hi', label: 'Hindi (हिंदी)', flag: '🇮🇳' },
                                { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🇮🇳' },
                                { code: 'mr', label: 'Marathi (मराठी)', flag: '🇮🇳' },
                                { code: 'ta', label: 'Tamil (தமிழ்)', flag: '🇮🇳' },
                                { code: 'te', label: 'Telugu (తెలుగు)', flag: '🇮🇳' },
                                { code: 'bn', label: 'Bengali (বাংলা)', flag: '🇮🇳' },
                            ].map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageSelect(lang.code as any)}
                                    className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${language === lang.code ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{lang.flag}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{lang.label}</span>
                                    </div>
                                    {language === lang.code && <span className="material-symbols-outlined text-primary">check_circle</span>}
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col items-center gap-4">
                            {!captureVideo && !faceEnrolled && (
                                <button onClick={startVideo} disabled={!modelsLoaded} className={`btn-primary w-full py-3 flex items-center justify-center gap-2 ${!modelsLoaded ? 'opacity-50 cursor-wait' : ''}`}>
                                    <span className="material-symbols-outlined">camera_alt</span>
                                    {modelsLoaded ? t('start_camera') : t('loading_models')}
                                </button>
                            )}

                            {captureVideo && !faceDescriptor && (
                                <div className="relative w-[300px] h-[300px] rounded-2xl overflow-hidden border-4 border-primary shadow-lg">
                                    <video ref={videoRef} width="300" height="300" autoPlay muted className="object-cover w-full h-full" />
                                    <canvas ref={canvasRef} className="absolute top-0 left-0" />
                                </div>
                            )}

                            {faceDescriptor && !faceEnrolled && (
                                <div className="text-center space-y-4">
                                    <div className="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <span className="material-symbols-outlined text-4xl">check</span>
                                    </div>
                                    <p className="font-medium text-green-600">{t('face_captured')}</p>
                                    <button onClick={enrollFace} disabled={loading} className="btn-primary w-full">
                                        {loading ? t('registering') : t('confirm_enrollment')}
                                    </button>
                                    <button onClick={() => {
                                        cleanupCamera(); // Stop camera
                                        setCaptureVideo(false); // Go back to start state
                                        setFaceDescriptor(null);
                                    }} className="text-text-muted hover:text-red-500 text-sm">{t('retake')}</button>
                                </div>
                            )}

                            {faceEnrolled && (
                                <div className="text-center space-y-4 animate-in zoom-in duration-300">
                                    <div className="size-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
                                        <span className="material-symbols-outlined text-5xl">verified_user</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('all_set')}</h3>
                                    <p className="text-text-muted">{t('face_registered_msg')}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                        <button
                            onClick={handleNext}
                            disabled={loading || (step === 2 && !faceEnrolled)}
                            className={`px-6 py-2 rounded-lg font-bold transition-all ${(step === 2 && !faceEnrolled)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5'
                                }`}
                        >
                            {step === 1 ? t('next') : t('finish_setup')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
