import React, { useContext, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import CustomDialogBox from '../dialog-box/CustomDialogBox';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { useAuth } from '@/layout/context/authContext';
import TableSkeletonSimple from '../skeleton/TableSkeletonSimple';
import { useAppContext } from '@/layout/AppWrapper';
import DocumentViewer from '../viewer/DocumentViewer';

const SupplierFeedbackTable = ({ data, loading, onSubmit, setUploadLoading }: any) => {
    const [uploadedFiles, setUploadedFiles] = useState<any>({});
    const [fileNames, setFileNames] = useState<any>({}); // Track file names
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isShowSplit, setIsShowSplit] = useState(false);

    //for doc viewer
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
    const [showViewer, setShowViewer] = useState(false);

    const { isLoading, setAlert } = useAppContext();

    const { layoutState } = useContext(LayoutContext);
    const { isSupplier } = useAuth();

    const handleFileUpload = (scoreCheckedDataId: any) => (event: any) => {
        const file: any = event.files[0];

        if (!event || !event.files || event.files.length === 0) {
            return;
        }

        if (!file) {
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setAlert('error', 'File size exceeds 2MB limit');
            return;
        }

        // Validate file type (PDF, images, DOC/DOCX)
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.type)) {
            setAlert('error', 'Only PDF, images (JPEG, PNG), and DOC/DOCX files are allowed')
            return;
        }


        setUploadedFiles((prev: any) => ({
            ...prev,
            [scoreCheckedDataId]: file
        }));
        setFileNames((prev: any) => ({
            ...prev,
            [scoreCheckedDataId]: file.name // store the file name
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);

        // prepare the data array in the desired format
        const scoreCheckedDataIds = Object.keys(uploadedFiles).map(id => ({
            scoreCheckedDataId: parseInt(id, 10)
        }));

        // convert the data array to a JSON string
        const scoreCheckedDataIdsJson = JSON.stringify(scoreCheckedDataIds);

        // prepare the array of files in the same order as the scoreCheckedDataId values
        const filesArray = Object.keys(uploadedFiles).map(id => uploadedFiles[id]);

        // create FormData and append the JSON string and files array
        const formData = new FormData();
        formData.append('data', scoreCheckedDataIdsJson);
        filesArray.forEach((file, index) => {
            formData.append('files', file);
        });

        try {

            await onSubmit(formData);
            setUploadedFiles({});
            setFileNames({}); // Clear file names after submission
            setUploadLoading(false)
        } catch (error) {
            console.error('Error submitting files:', error);
        } finally {
            setSubmitting(false);
            setShowConfirmDialog(false);
        }
    };

    const onError = (event: any) => {
        const { files, messages } = event;

        if (messages?.[0]?.detail.includes('2 MB')) {
            setAlert('error', 'File size exceeds 2MB limit');
        } else if (!files[0].type.match(/(image.*|application\/pdf)/)) {
            setAlert('error', 'Please upload only images or PDF files');
        } else {
            setAlert('error', 'An error occurred while uploading the file');
        }
    };

    const fileUploadTemplate = (rowData: any) => {
        const hasFile = uploadedFiles[rowData.scoreCheckedDataId];
        const fileName = fileNames[rowData.scoreCheckedDataId];

        // if there's an existing file, show the download link
        if (rowData.file) {
            return (
                <Button
                label="View File"
                className="p-button-link text-blue-500 p-button-sm"
                onClick={() => {
                    setSelectedFile(rowData.file);
                    setSelectedFileName(rowData.fileName || 'Document');
                    setShowViewer(true);
                }}
            />
            );
        }

        return (
            <div className="flex align-items-center gap-2">
                <FileUpload
                    mode="basic"
                    auto
                    chooseLabel="Upload"
                    className={`p-button-${hasFile ? 'success' : 'primary'} p-button-sm`}
                    onSelect={handleFileUpload(rowData.scoreCheckedDataId)}
                    accept="image/*,application/pdf"
                    onError={onError}
                    disabled={!isSupplier()}
                />
                {fileName && (
                    <span className="text-sm text-500 text-yellow-700">
                        {fileName.length > 20 ? `${fileName.substring(0, 20)}...` : fileName}
                    </span>
                )}
            </div>
        );
    };



    const renderHeader = () => (
        <div className="flex justify-content-between">
            <span className="p-input-icon-left flex align-items-center">
                <h3 className="mb-0">Supplier Feedback</h3>
            </span>
            <div className="p-input-icon-left flex align-items-left flex-column text-sm font-bold">
                <div> Allowed Formats: <span className='text-red-500'>jpeg, png, pdf, doc, docx</span></div>
                <div>Max File Size:  <span className='text-red-500'>2 MB</span></div>
            </div>
        </div>
    );


    return (
        <div className="grid">
            <div className="col-12">
                <div className={`panel-container ${isShowSplit ? (layoutState.isMobile ? 'mobile-split' : 'split') : ''}`}>
                    <div className="left-panel mb-0">
                        <div className="header">{renderHeader()}</div>
                        {isLoading ? <TableSkeletonSimple columns={7} rows={7} /> :

                            <div className="bg-[#ffffff] border border-1 p-3 mt-4 shadow-lg flex flex-column gap-3" style={{ borderColor: '#CBD5E1', borderRadius: '10px' }}>

                                <div>
                                    <DataTable
                                        value={data?.scoreApprovals?.checkedData || []}
                                        tableStyle={{ minWidth: '50rem' }}
                                        sortField="scoreCheckedDataId"
                                        sortOrder={1}
                                    >
                                        <Column field="sectionName" header="Section" />
                                        {/* <Column field="scoreCheckedDataId" header="scoreCheckedDataId" /> */}
                                        <Column field="ratedCriteria" header="Criteria" />
                                        <Column field="ratio" header="Ratio" />
                                        <Column field="evaluation" header="Evaluation" />
                                        <Column field="score" header="Score" />
                                        {/* <Column field="file"
                                            header="Uploaded Document"
                                            body={fileDownloadTemplate}
                                        /> */}
                                        <Column
                                            body={fileUploadTemplate}
                                            header="Upload File"
                                            style={{ width: '200px', placeItems: 'start'}}
                                        />
                                    </DataTable>
                                </div>

                                <div className='flex justify-content-end mr-2'>
                                    <Button
                                        label="Submit Feedback"
                                        icon="pi pi-upload"
                                        onClick={() => setShowConfirmDialog(true)}
                                        disabled={Object.keys(uploadedFiles).length === 0 || submitting}
                                        visible={isSupplier()}
                                    />
                                </div>
                            </div>
                        }
                    </div>
                </div>

                <CustomDialogBox
                    visible={showConfirmDialog}
                    onHide={() => setShowConfirmDialog(false)}
                    onConfirm={handleSubmit}
                    onCancel={() => setShowConfirmDialog(false)}
                    header="Confirm Submission"
                    message="Are you sure you want to submit all uploaded files?"
                    subMessage="This action cannot be undone."
                    confirmLabel="Submit"
                    cancelLabel="Cancel"
                    icon="pi pi-upload"
                    iconColor="#DF1740"
                    loading={loading}
                />

                {selectedFile && (
                    <DocumentViewer
                        fileUrl={selectedFile}
                        fileName={selectedFileName || undefined}
                        visible={showViewer}
                        onHide={() => {
                            setShowViewer(false);
                            setSelectedFile(null);
                            setSelectedFileName(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default SupplierFeedbackTable;