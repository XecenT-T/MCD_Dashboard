import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface FaceEnrollmentProps {
    onSuccess: () => void;
    onClose: () => void;
}

const FaceEnrollment: React.FC<FaceEnrollmentProps> = ({ onSuccess, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [initializing, setInitializing] = useState(true);
    const [status, setStatus] = useState<string>('Loading models...');
    const [canCapture, setCanCapture] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
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
                setStatus("Error loading face recognition models. Please refresh.");
            }
        };

        loadModels();
    }, []);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => {
                console.error("Error accessing webcam:", err);
                setStatus("Error accessing webcam. Please allow permissions.");
            });
    };

    const handleVideoPlay = () => {
        setInitializing(false);
        setStatus('Detecting face...');

        setInterval(async () => {
            if (!videoRef.current || !canvasRef.current) return;

            const displaySize = {
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight
            };
            faceapi.matchDimensions(canvasRef.current, displaySize);

            const detections = await faceapi.detectAllFaces(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptors();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                faceapi.draw.drawDetections(canvas, resizedDetections);
            }

            if (detections.length === 1) {
                setStatus('Face detected! Click "Enroll Face" to save.');
                setCanCapture(true);
            } else if (detections.length === 0) {
                setStatus('No face detected. Please look at the camera.');
                setCanCapture(false);
            } else {
                setStatus('Multiple faces detected. Please ensure only you are in frame.');
                setCanCapture(false);
            }
        }, 500);
    };

    const captureAndEnroll = async () => {
        if (!videoRef.current) return;

        setStatus('Enrolling...');
        const detections = await faceapi.detectSingleFace(videoRef.current)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detections) {
            const descriptor = Array.from(detections.descriptor);

            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    }
                };

                await api.post('/api/auth/enroll-face', { faceDescriptor: descriptor }, config);
                setStatus('Enrollment Successful!');
                setTimeout(onSuccess, 1500);
            } catch (err) {
                console.error(err);
                setStatus('Enrollment failed. Please try again.');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Setup Face ID</h2>
                    <p className="text-gray-600 dark:text-gray-400">Please position your face clearly in the frame.</p>
                </div>

                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        onPlay={handleVideoPlay}
                        className="w-full h-full object-cover"
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full"
                    />
                </div>

                <div className="flex flex-col gap-4">
                    <div className={`p-3 rounded-lg text-center text-sm font-medium ${canCapture ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        initializing ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                        {status}
                    </div>

                    <button
                        onClick={captureAndEnroll}
                        disabled={!canCapture}
                        className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all transform active:scale-[0.98] ${canCapture
                            ? 'bg-primary hover:bg-primary-dark shadow-lg shadow-primary/30'
                            : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                            }`}
                    >
                        Enroll Face
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FaceEnrollment;
