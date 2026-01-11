import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const IDCardPrint = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return <div>Loading...</div>;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
            {/* Action Bar - Hidden when printing */}
            <div className="w-full max-w-[210mm] flex justify-between items-center mb-6 no-print">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors"
                    >
                        <span className="material-symbols-outlined">print</span>
                        Print / Save as PDF
                    </button>
                </div>
            </div>

            {/* A4 Page Container */}
            <div className="bg-white shadow-2xl print:shadow-none w-[210mm] min-h-[297mm] p-12 print:p-0 mx-auto relative text-gray-900 font-sans print:w-full">

                {/* Formatting for Print */}
                <style>
                    {`
                        @media print {
                            @page { margin: 0; size: auto; }
                            body { background: white; -webkit-print-color-adjust: exact; }
                            .no-print { display: none !important; }
                            .print-container { box-shadow: none; margin: 0; width: 100%; height: 100%; border: none; }
                        }
                    `}
                </style>

                <div className="border-2 border-gray-800 p-1 h-full flex flex-col justify-between">
                    <div className="border border-gray-800 h-full p-8 relative">

                        {/* Header */}
                        <div className="flex items-start justify-center gap-6 mb-8 border-b-2 border-gray-800 pb-6">
                            {/* Logo Placeholder */}
                            <div className="w-24 h-24 flex-shrink-0">
                                <img
                                    src="https://mcdonline.nic.in/portal/assets/images/logo.png"
                                    alt="MCD Logo"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerText = 'MCD LOGO';
                                        (e.target as HTMLImageElement).parentElement!.className = "w-24 h-24 flex items-center justify-center border-2 border-gray-300 rounded-full font-bold text-gray-400 text-xs text-center";
                                    }}
                                />
                            </div>

                            <div className="text-center">
                                <h1 className="text-3xl font-bold uppercase tracking-wide text-gray-900 mb-2">Municipal Corporation of Delhi</h1>
                                <p className="text-sm font-bold text-gray-600 uppercase">Civic Centre, Minto Road, New Delhi - 110002</p>
                                <h2 className="text-2xl font-bold mt-4 uppercase underline decoration-2 underline-offset-4">Official Profile</h2>
                            </div>
                        </div>

                        {/* Details Section Header */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold uppercase border-b border-gray-400 pb-1 inline-block">Official Details</h3>
                        </div>

                        {/* Content Grid */}
                        <div className="flex gap-8">
                            {/* Left Column - Text Details */}
                            <div className="flex-grow space-y-4 text-sm">
                                <DetailRow label="Name of Official" value={user.name} />
                                <DetailRow label="Role / Designation" value={user.role} />
                                <DetailRow label="Department" value={user.department || 'N/A'} />
                                <DetailRow label="Employee ID" value={user.id || user._id || 'MCD-0000'} /> {/* Assuming ID exists */}
                                <DetailRow label="Date of Birth" value={user.dob || 'N/A'} />
                                <DetailRow label="Gender" value={user.gender || 'N/A'} />
                                <DetailRow label="Email" value={user.email || 'N/A'} />
                                <DetailRow label="Mobile No" value={user.phoneNo || 'N/A'} />
                                <DetailRow label="Aadhar Card No" value={user.aadharCardNo || 'N/A'} />
                                <DetailRow label="Face ID Status" value={user.isFaceRegistered ? "Registered" : "Not Registered"} />
                                <DetailRow label="Region" value="DELHI" />
                            </div>

                            {/* Right Column - Photo */}
                            <div className="w-48 flex-shrink-0">
                                <div className="border-2 border-gray-800 p-1 bg-white shadow-sm">
                                    {user.profileImage ? (
                                        <img
                                            src={user.profileImage}
                                            alt={user.name}
                                            className="w-full h-56 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-400 flex-col">
                                            <span className="material-symbols-outlined text-4xl">person</span>
                                            <span className="text-xs mt-2 uppercase font-bold">No Photo</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center mt-2">
                                    <p className="text-xs font-bold uppercase">{user.id || 'Official ID'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Signature Area */}
                        <div className="mt-24 pt-8 border-t border-gray-300 flex justify-between items-end px-8">
                            <div className="text-center">
                                <div className="h-12 w-32 border-b border-gray-400 mb-2"></div>
                                <p className="text-xs font-bold uppercase">Official Signature</p>
                            </div>
                            <div className="text-center">
                                <div className="w-24 h-24 mb-2 mx-auto opacity-80">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_of_Delhi_logo.svg/1200px-Government_of_Delhi_logo.svg.png"
                                        alt="Seal"
                                        className="w-full h-full object-contain grayscale"
                                    />
                                </div>
                                <p className="text-xs font-bold uppercase">Valid Issuing Authority</p>
                            </div>
                        </div>

                        {/* Bottom Disclaimer */}
                        <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-gray-500 uppercase">
                            This is a computer generated document and does not require physical signature.
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ label, value }: { label: string, value: string }) => (
    <div className="grid grid-cols-[160px_20px_1fr] items-start">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-900 font-bold">:</span>
        <span className="font-bold text-gray-900 uppercase">{value}</span>
    </div>
);

export default IDCardPrint;
