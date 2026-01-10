import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface Document {
    id: string;
    title: string;
    date: string;
    type: string;
    size: string;
}

const DepartmentDocuments = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

    // Mock data - in a real app this would come from an API based on user.department
    const documents: Document[] = [
        { id: '1', title: 'Safety Guidelines 2024', date: '2024-01-01', type: 'PDF', size: '2.4 MB' },
        { id: '2', title: 'Shift Schedule - January', date: '2024-01-05', type: 'PDF', size: '1.1 MB' },
        { id: '3', title: 'Equipment Checklist', date: '2023-12-15', type: 'DOCX', size: '0.5 MB' },
        { id: '4', title: 'Start of Year Protocol', date: '2024-01-02', type: 'PDF', size: '3.0 MB' },
        { id: '5', title: 'Holiday List 2024', date: '2023-12-20', type: 'PDF', size: '0.8 MB' },
    ];

    const handlePrint = (doc: Document) => {
        // Simulate printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${doc.title}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 40px; }
                            h1 { color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
                            .meta { color: #666; margin-bottom: 30px; }
                            .content { line-height: 1.6; }
                        </style>
                    </head>
                    <body>
                        <h1>${doc.title}</h1>
                        <div class="meta">
                            <p><strong>Date:</strong> ${doc.date}</p>
                            <p><strong>Department:</strong> ${user?.department || 'General MCD'}</p>
                            <p><strong>Document ID:</strong> ${doc.id}</p>
                        </div>
                        <div class="content">
                            <p>This is a placeholder for the content of <strong>${doc.title}</strong>.</p>
                            <p>In a real application, this would render the actual PDF or document content.</p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                            <br/>
                            <p>Approved By: ________________________</p>
                        </div>
                        <script>
                            window.onload = function() { window.print(); }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleView = (doc: Document) => {
        setSelectedDoc(doc);
    };

    return (
        <DashboardLayout title="Department Documents">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="bg-[#1e293b] rounded-xl shadow-lg border border-gray-700/50 p-6 shadow-black/20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-400">domain</span>
                                {user?.department || 'Sanitation'} Department
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Access and manage all official documents for your department.
                            </p>
                        </div>
                        <div className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-semibold border border-blue-500/20 shadow-sm shadow-blue-500/10">
                            Total Documents: {documents.length}
                        </div>
                    </div>
                </div>

                {/* Documents List */}
                <div className="bg-[#1e293b] rounded-xl shadow-lg border border-gray-700/50 overflow-hidden shadow-black/20">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-800/50 border-b border-gray-700/50">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Document Name</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr
                                        key={doc.id}
                                        className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors last:border-0 group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3" onClick={() => handleView(doc)}>
                                                <div className="p-2.5 bg-red-500/10 text-red-400 rounded-lg cursor-pointer group-hover:bg-red-500/20 transition-colors">
                                                    <span className="material-symbols-outlined text-[24px]">
                                                        {doc.type === 'PDF' ? 'picture_as_pdf' : 'description'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-200 cursor-pointer group-hover:text-blue-400 transition-colors text-sm">
                                                        {doc.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{doc.size}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 font-medium">
                                            {doc.date}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="px-2.5 py-1 rounded-md bg-gray-800 text-xs font-bold text-gray-400 border border-gray-700">
                                                {doc.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handlePrint(doc)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all"
                                                    title="Print Document"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">print</span>
                                                </button>
                                                <button
                                                    onClick={() => handleView(doc)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all"
                                                    title="View Document"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* View Modal */}
                {selectedDoc && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDoc(null)}>
                        <div
                            className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-border-dark flex items-center justify-between">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{selectedDoc.title}</h3>
                                <button
                                    onClick={() => setSelectedDoc(null)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-8 text-center space-y-4">
                                <div className="size-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
                                    <span className="material-symbols-outlined text-[40px]">
                                        {selectedDoc.type === 'PDF' ? 'picture_as_pdf' : 'description'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        You are viewing <strong>{selectedDoc.title}</strong>
                                    </p>
                                    <p className="text-sm text-text-muted mt-1">
                                        This is a placeholder for the actual document viewer.
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
                                <button
                                    onClick={() => handlePrint(selectedDoc)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">print</span>
                                    Print
                                </button>
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
                                >
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DepartmentDocuments;
