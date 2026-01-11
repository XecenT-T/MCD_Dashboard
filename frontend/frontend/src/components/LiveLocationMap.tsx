import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet Default Icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export interface GenericAttendanceRecord {
    _id: string;
    checkInTime: string;
    location: { lat: number; lng: number, address: string };
    user: { _id: string, name: string, role: string };
    status: string;
}

interface LiveLocationMapProps {
    attendanceData: GenericAttendanceRecord[];
    loading?: boolean;
    height?: string; // Optional height override
}

const LiveLocationMap: React.FC<LiveLocationMapProps> = ({ attendanceData, loading = false, height = "h-[calc(100vh-140px)]" }) => {
    const [defaultCenter] = useState<[number, number]>([28.6139, 77.2090]); // Delhi

    return (
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${height}`}>
            {/* Map Section - Takes up 2 columns */}
            <div className="lg:col-span-2 h-full bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative z-0 flex flex-col">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 z-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                )}

                <MapContainer center={defaultCenter} zoom={11} scrollWheelZoom={true} className="flex-1 w-full z-10">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {attendanceData.map((record) => (
                        record.location && record.location.lat && record.location.lng ? (
                            <Marker key={record._id} position={[record.location.lat, record.location.lng]}>
                                <Popup>
                                    <div className="p-2 min-w-[150px]">
                                        <h3 className="font-bold text-gray-900">{record.user.name}</h3>
                                        <p className="text-sm text-gray-500">{record.user.role}</p>
                                        <p className="text-xs text-gray-400 mt-1">{record.checkInTime}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ) : null
                    ))}
                </MapContainer>
            </div>

            {/* Worker List Section - Takes up 1 column */}
            <div className="h-full bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">groups</span>
                        Present Workers
                        <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{attendanceData.length}</span>
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-50 text-gray-400 rounded-lg">
                                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : attendanceData.length > 0 ? (
                        attendanceData.map((record) => (
                            <div key={record._id} className="group flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-primary/5 transition-colors cursor-default">
                                <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                                    {record.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">{record.user.name}</h3>
                                        <span className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{record.checkInTime}</span>
                                    </div>
                                    <p className="text-xs text-primary font-medium mb-1">{record.user.role}</p>
                                    <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">location_on</span>
                                        <span className="line-clamp-2 leading-tight">{record.location.address || "Location unavailable"}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-4">
                            <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                            <p>No workers have marked attendance yet today.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveLocationMap;
