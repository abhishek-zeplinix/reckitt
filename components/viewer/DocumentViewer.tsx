import React, { useState, useMemo } from 'react';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';

interface DocumentViewerProps {
    fileUrl: string;
    visible: boolean;
    onHide: () => void;
    fileName?: string;
}

const DocumentViewer = ({ fileUrl, visible, onHide, fileName }: DocumentViewerProps) => {
    const [loading, setLoading] = useState(true);

    const fileType = useMemo(() => {
        const extension = fileUrl.split('.').pop()?.toLowerCase();
        if (!extension) return 'unknown';

        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
        if (extension === 'pdf') return 'pdf';
        if (['doc', 'docx'].includes(extension)) return 'doc';
        return 'unknown';
    }, [fileUrl]);


    const renderGoogleDocsViewer = (url: string) => (
        <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
            style={{ width: '100%', height: '80vh', border: 'none' }}
            onLoad={() => setLoading(false)}
            className="shadow-2"
        />
    );

    const renderContent = () => {
        switch (fileType) {
            case 'image':
                return (
                    <div className="flex justify-content-center">
                        <img
                            src={fileUrl}
                            alt={fileName || 'Document'}
                            style={{ maxWidth: '100%', maxHeight: '80vh' }}
                            onLoad={() => setLoading(false)}
                            className="shadow-2"
                        />
                    </div>
                );
            case 'pdf':
                return renderGoogleDocsViewer(fileUrl);
            case 'doc':
                return renderGoogleDocsViewer(fileUrl);
            default:
                return <div>Unsupported file type</div>;
        }
    };

    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            header={fileName || 'Document Viewer'}
            maximizable
            className="w-full md:w-8 lg:w-6"
            contentClassName="relative"
            style={{ maxWidth: '90vw' }}
        >
            {loading && (
                <div className="absolute top-50 left-50 z-1 flex align-items-center justify-content-center">
                    <ProgressSpinner />
                </div>
            )}
            {renderContent()}
        </Dialog>
    );
};

export default DocumentViewer;