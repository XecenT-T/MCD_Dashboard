import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface FaceAuthenticationProps {
    onSuccess: () => void;
    onClose: () => void;
}

const FaceAuthentication: React.FC<FaceAuthenticationProps> = ({ onSuccess, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<string>('Initializing...');
    const { user, token } = useAuth();
    const [userDescriptor, setUserDescriptor] = useState<Float32Array | null>(null);

    useEffect(() => {
        // Fetch user's stored descriptor
        if (user && user.faceDescriptor) {
            setUserDescriptor(new Float32Array(user.faceDescriptor));
        }

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
                setStatus("Error loading models.");
            }
        };

        loadModels();
    }, [user]);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => {
                console.error("Error accessing webcam:", err);
                setStatus("Webcam access denied.");
            });
    };

    const handleVideoPlay = () => {
        setStatus('Verifying face...');

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

            // Draw detections
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                faceapi.draw.drawDetections(canvas, resizedDetections);
            }

            if (detections.length > 0) {
                // Check if any detected face matches stored user descriptor
                const faceMatcher = new faceapi.FaceMatcher(userDescriptor, 0.6); // 0.6 is threshold

                const bestMatch = detections.map(d => faceMatcher.findBestMatch(d.descriptor)).find(match => match.label !== 'unknown');

                if (bestMatch) {
                    clearInterval(intervalId);
                    setStatus('Verified! Marking attendance...');

                    // Call Mark Attendance API
                    try {
                        const config = {
                            headers: {
                                'Content-Type': 'application/json',
                                'x-auth-token': token
                            }
                        };
                        await api.post('/api/attendance/mark', {}, config);
                        setStatus('Attendance Marked Successfully!');
                        setTimeout(onSuccess, 1500);
                    } catch (err: any) {
                        console.error(err);
                        setStatus(err.response?.data?.msg || 'Attendance Marking Failed');
                    }
                } else {
                    setStatus('Face not recognized. Please try again.');
                }
            }
        }, 500);

        return () => clearInterval(intervalId);
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Attendance Check</h2>
                    <p className="text-gray-600 dark:text-gray-400">Verifying your identity...</p>
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

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-center font-medium">
                    {status}
                </div>
            </div>
        </div>
    );
};

export default FaceAuthentication;
