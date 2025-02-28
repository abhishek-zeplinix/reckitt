import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

const FeedbackRead = ({ closeFileDialog, isFileDialogVisible, openFile, selectedCheckedData, supplierScoreData }: any) => {

    return (
        <>
            <Dialog
                header="Feedback Details"
                visible={isFileDialogVisible}
                style={{ width: '50vw' }}
                className="feedback-dialog"
                footer={
                    <div className="flex justify-content-center p-3">
                        <Button
                            label="View Feedback Document"
                            style={{ backgroundColor: '#DF1740', border: 'none' }}
                            className="px-7 hover:text-white shadow-md"
                            onClick={() => openFile(selectedCheckedData?.file)}
                            icon="pi pi-file"
                        />
                    </div>
                }
                onHide={closeFileDialog}
            >

                <div className="w-full p-4">
                    <table className="w-full border-collapse border-1 border-gray-300 mb-6">
                        <tbody>
                            <tr className="border border-gray-300 bg-gray-50">
                                <td className="font-bold p-3 border border-gray-300 w-1/4">Section</td>
                                <td className="p-3 border border-gray-300">{selectedCheckedData?.sectionName}</td>
                            </tr>
                            <tr className="border border-gray-300">
                                <td className="font-bold p-3 border border-gray-300">Criteria</td>
                                <td className="p-3 border border-gray-300">{selectedCheckedData?.ratedCriteria}</td>
                            </tr>
                            <tr className="border border-gray-300 bg-gray-50">
                                <td className="font-bold p-3 border border-gray-300">Evaluation Score</td>
                                <td className="p-3 border border-gray-300">
                                    <span className="font-semibold">{selectedCheckedData?.score}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-6">
                        <div className="flex items-center mb-3">
                            <i className="pi pi-comments mr-2 text-primary-main"></i> 
                            <h3 className="font-bold text-lg m-0">Approver Comment</h3>
                        </div>
                        <div className="border border-blue-200 bg-red-50 p-4 rounded-lg shadow-sm">
                            {supplierScoreData[0]?.scoreApprovals?.approverComment ? (
                                <p className="m-0 leading-relaxed">
                                    {supplierScoreData[0]?.scoreApprovals?.approverComment}
                                </p>
                            ) : (
                                <p className="text-gray-500 italic m-0">No comment provided</p>
                            )}
                        </div>
                    </div>
                </div>
            </Dialog>

        </>
    );
}

export default FeedbackRead;