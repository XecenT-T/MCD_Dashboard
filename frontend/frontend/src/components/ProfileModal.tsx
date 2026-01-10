import React from 'react';
import { useAuth } from '../context/AuthContext';

import type { User } from '../context/AuthContext';

interface ProfileModalProps {
    onClose: () => void;
    user?: User | null; // Optional user prop for viewing other profiles
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, user: propUser }) => {
    const { user: authUser } = useAuth();
    const user = propUser || authUser;

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">
                {/* Header Background */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                </div>

                {/* Profile Image & Content */}
                <div className="px-6 pb-8 relative">
                    <div className="relative -mt-16 mb-4 flex justify-center">
                        <div className="size-32 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-white dark:bg-slate-700 flex items-center justify-center">
                            {user.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-5xl font-bold text-gray-400 dark:text-gray-500 uppercase">
                                    {user.name.charAt(0)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</h2>
                        <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 capitalize">
                                {user.role}
                            </span>
                            {user.post && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {user.post}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3">
                            <ProfileField icon="badge" label="Aadhar Card No." value={user.aadharCardNo || 'Not Provided'} />
                            <ProfileField icon="mail" label="Email" value={user.email || user.username} />
                            <ProfileField icon="call" label="Phone" value={user.phoneNo || 'Not provided'} />
                            {user.department && (
                                <ProfileField icon="domain" label="Department" value={user.department} />
                            )}
                            {user.dob && (
                                <ProfileField icon="cake" label="Date of Birth" value={new Date(user.dob).toLocaleDateString()} />
                            )}
                        </div>

                        {user.isFaceRegistered ? (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm justify-center bg-green-50 dark:bg-green-900/20 py-2 rounded-lg">
                                <span className="material-symbols-outlined text-[20px]">verified_user</span>
                                <span>Face ID Registered</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm justify-center bg-yellow-50 dark:bg-yellow-900/20 py-2 rounded-lg">
                                <span className="material-symbols-outlined text-[20px]">gpp_maybe</span>
                                <span>Face ID Not Setup</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileField = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
    <div className="flex items-center gap-3 text-sm">
        <div className="size-8 rounded-lg bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-gray-500 dark:text-gray-300">
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

export default ProfileModal;
