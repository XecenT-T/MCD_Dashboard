import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../context/AuthContext';

interface IDCardModalProps {
    user: User;
    onClose: () => void;
}

const IDCardModal: React.FC<IDCardModalProps> = ({ user, onClose }) => {
    const navigate = useNavigate();

    const handleOpenPrintView = () => {
        onClose();
        navigate('/id-card-print');
    };

    // Old ref logic no longer needed for print view, but kept empty ref to avoid breaking potential other refs if any (none seen)
    // Actually we can just remove the ref and state since they were for html2canvas


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-md" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute -right-2 -top-10 text-white hover:text-gray-300 transition-colors"
                >
                    <span className="material-symbols-outlined text-3xl">close</span>
                </button>

                {/* Card Container - Inline Styles for Colors */}
                <div
                    className="rounded-2xl overflow-hidden relative font-sans"
                    style={{
                        width: '100%',
                        maxWidth: '380px',
                        margin: '0 auto',
                        backgroundColor: '#1e2330',
                        border: '1px solid rgba(55,65,81,0.5)',
                        boxShadow: 'none'
                    }}
                >
                    {/* Header */}
                    <div style={{ backgroundColor: '#2a3089', height: '128px', width: '100%', position: 'relative' }}>
                        {/* Profile Picture Wrapper */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-48px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '96px',
                            height: '96px',
                            borderRadius: '50%',
                            backgroundColor: '#374151',
                            padding: '4px',
                            border: '4px solid #1e2330',
                            boxSizing: 'border-box',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {user.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt={user.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    backgroundColor: '#4b5563',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '30px',
                                    fontWeight: 'bold'
                                }}>
                                    {user.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ paddingTop: '64px', paddingBottom: '32px', paddingLeft: '24px', paddingRight: '24px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px', margin: 0 }}>{user.name}</h2>

                        <div style={{
                            display: 'inline-block',
                            padding: '2px 12px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '4px',
                            marginTop: '4px',
                            backgroundColor: 'rgba(42,48,137,0.2)',
                            color: '#5c6ac4',
                            border: '1px solid rgba(42,48,137,0.3)'
                        }}>
                            {user.role}
                        </div>

                        {(user.role === 'worker' || user.role === 'official') && (
                            <div style={{
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontWeight: '500',
                                marginBottom: '24px',
                                color: '#9ca3af'
                            }}>
                                {user.role}
                            </div>
                        )}

                        <div style={{
                            backgroundColor: '#252b3b',
                            borderRadius: '12px',
                            padding: '16px',
                            textAlign: 'left',
                            border: '1px solid rgba(55,65,81,0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            <DetailItem icon="badge" label="Aadhar Card No." value={user.aadharCardNo || 'N/A'} />
                            <DetailItem icon="mail" label="Email" value={user.email || 'N/A'} />
                            <DetailItem icon="call" label="Phone" value={user.phoneNo || 'N/A'} />
                            <DetailItem icon="domain" label="Department" value={user.department || 'N/A'} />
                            <DetailItem icon="cake" label="Date of Birth" value={user.dob || 'N/A'} />
                        </div>

                        <div style={{
                            marginTop: '24px',
                            backgroundColor: '#0f392b',
                            border: '1px solid #165a41',
                            borderRadius: '8px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            color: '#00c986'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified_user</span>
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Face ID Registered</span>
                        </div>
                    </div>
                </div>

                {/* Download Action Button - Outside capture area */}
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={handleOpenPrintView}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all hover:scale-105"
                    >
                        <span className="material-symbols-outlined">print</span>
                        Open Full Print View
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
            padding: '10px',
            borderRadius: '8px',
            backgroundColor: '#303746',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
        </div>
        <div>
            <p style={{
                fontSize: '10px',
                color: '#6b7280',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                margin: 0,
                marginBottom: '2px'
            }}>{label}</p>
            <p style={{
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '14px',
                margin: 0
            }}>{value}</p>
        </div>
    </div>
);

export default IDCardModal;
