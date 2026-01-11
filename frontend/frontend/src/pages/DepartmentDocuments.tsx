import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

interface Document {
    id: string;
    title: string;
    date: string;
    type: string;
    size: string;
    content?: string;
}

const DepartmentDocuments = () => {
    const { user, token } = useAuth();
    const { t } = useLanguage();
    // removed duplicate user declaration
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const config = { headers: { 'x-auth-token': token } };
                const res = await api.get('/api/documents', config);
                setDocuments(res.data);
            } catch (err) {
                console.error("Error fetching documents", err);
            }
        };
        fetchDocs();
    }, [token]);

    const handlePrint = (doc: Document) => {
        // Simulate printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${doc.title}</title>
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                            h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 30px; font-size: 24px; }
                            .meta { color: #64748b; margin-bottom: 40px; font-size: 14px; background: #f8fafc; padding: 15px; border-radius: 8px; }
                            .meta p { margin: 5px 0; }
                            .content { line-height: 1.8; font-size: 16px; white-space: pre-wrap; font-family: monospace; background: #fff; padding: 10px; border: 1px solid #eee; }
                            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: right; color: #64748b; font-size: 12px; }
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
                            ${doc.content ? doc.content : 'No content available. Please contact support.'}
                        </div>
                        
                        <div class="footer">
                             <p>Municipal Corporation of Delhi</p>
                             <p>Official Document - Generated on ${new Date().toLocaleString()}</p>
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
        <DashboardLayout title={t('dept_documents')}>
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="bg-[#1e293b] rounded-xl shadow-lg border border-gray-700/50 p-6 shadow-black/20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-400">domain</span>
                                {t(`dept_${(user?.department || 'Sanitation').toLowerCase()}`) || user?.department} {t('department_suffix')}
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                {t('dept_docs_desc')}
                            </p>
                        </div>
                        <div className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-semibold border border-blue-500/20 shadow-sm shadow-blue-500/10">
                            {t('total_docs')}: {documents.length}
                        </div>
                    </div>
                </div>

                {/* Documents List */}
                <div className="bg-[#1e293b] rounded-xl shadow-lg border border-gray-700/50 overflow-hidden shadow-black/20">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-800/50 border-b border-gray-700/50">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('doc_name')}</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('doc_date')}</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('doc_type')}</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider text-right">{t('doc_actions')}</th>
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
                                                {t(`doc_type_${doc.type.toLowerCase().replace(/\s/g, '_')}`) || doc.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handlePrint(doc)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all"
                                                    title={t('print_doc')}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">print</span>
                                                </button>
                                                <button
                                                    onClick={() => handleView(doc)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all"
                                                    title={t('view_doc')}
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
                                        {t('viewing_doc')} <strong>{selectedDoc.title}</strong>
                                    </p>
                                    <p className="text-sm text-text-muted mt-1">
                                        {t('doc_placeholder')}
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
                                <button
                                    onClick={() => handlePrint(selectedDoc)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">print</span>
                                    {t('print')}
                                </button>
                                <button
                                    onClick={() => handlePrint(selectedDoc)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
                                >
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    {t('download')}
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
