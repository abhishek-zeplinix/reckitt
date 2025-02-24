import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useState, useEffect, useRef } from 'react';
import CapaRequiredTable from './CapaRequiredTable';
import { Badge } from 'primereact/badge';
import { Skeleton } from 'primereact/skeleton';
import { getBackgroundColor } from '@/utils/utils';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { useAuth } from '@/layout/context/authContext';
import { PostCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import { genericTextSchema } from '@/utils/validationSchemas';
import { z } from 'zod';
import CustomDialogBox from '../dialog-box/CustomDialogBox';
import TableSkeletonSimple from '../skeleton/TableSkeletonSimple';
import CapaRequiredTableApprover from './CapaRequiredTableApprover';

const SupplierEvaluationTableApprover = ({
  selectedPeriod,
  category,
  departmentId,
  onSuccess,
  supplierScoreData,
  isEvaluatedData,
  isTableLoading,
  catId,
  subCatId
}: any) => {

  const [tableData, setTableData] = useState<any>(supplierScoreData);
  const [selectedEvaluations, setSelectedEvaluations] = useState<any>({});
  const [currentPercentages, setCurrentPercentages] = useState<any>({});
  const [displayPercentages, setDisplayPercentages] = useState<any>({});
  const [totalScore, setTotalScore] = useState<any>(0);
  const [comments, setComments] = useState('');
  const [capaData, setCapaData] = useState<any[]>([]);
  const [capaDataCount, setCapaDataCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState<any>('pending');
  const [initializing, setInitializing] = useState(true);
  const [noData, setNoData] = useState(false);
  const [checkedCriteria, setCheckedCriteria] = useState<any[]>([]);
  const [approverComment, setApproverComment] = useState('');
  const [isRejectDialogVisible, setIsRejectDialogVisible] = useState(false);
  const [isApprovalDialogVisible, setIsApprovalDialogVisible] = useState(false);

  //validation
  const [rejectionError, setRejectionError] = useState('');
  const [remainingChars, setRemainingChars] = useState(250);

  const [approvalStatusDisplay, setApprovalStatusDisplay] = useState<string | null>(null);
  const [isAlreadyApprovedOrRejected, setIsAlreadyApprovedOrRejected] = useState(false); // to control button visibility

  const { userId } = useAuth();
  const { setAlert, setLoading, isLoading } = useAppContext();

  useEffect(() => {
    setApproverComment('')
    setRemainingChars(250)
    setTableData([])

    const initialize = async () => {
      setInitializing(true);
      setIsCompleted('pending');
      setApprovalStatusDisplay(null); // reset status on re-initialization
      setIsAlreadyApprovedOrRejected(false);

      try {

        if (supplierScoreData) {
          const status = supplierScoreData[0]?.status;

          status === undefined ? setIsCompleted('pending') : setIsCompleted(status);

          if (status?.toLowerCase() === 'completed') {
            setNoData(false)
            setTableData(supplierScoreData[0]);
            setTotalScore(supplierScoreData[0].totalScore)
            initializeCompletedData();

          } else {
            setNoData(true)
          }

          if (supplierScoreData[0]?.scoreApprovals) {
            const approverStatus = supplierScoreData[0]?.scoreApprovals?.approvalStatus;
            const approverComment = supplierScoreData[0]?.scoreApprovals?.approverComment;
            if (approverStatus) {
              setApprovalStatusDisplay(approverStatus); // Set the status for display
              setIsAlreadyApprovedOrRejected(true); // Disable buttons
            }

            if (approverComment) {
              setApproverComment(approverComment);
            }

            setCheckedCriteria(supplierScoreData[0]?.scoreApprovals.checkedData || []); // Ensure default to empty array if undefined

          } else {
            setCheckedCriteria([]); // Initialize to empty if no scoreApprovals data yet
          }

        }

      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, [category, supplierScoreData]);


  useEffect(() => {
    if (supplierScoreData) {
      if (supplierScoreData[0]?.scoreApprovals?.checkedData) {
        setCheckedCriteria(supplierScoreData[0]?.scoreApprovals.checkedData);
      } else {
      }
    }
  }, [supplierScoreData]);



  useEffect(() => {

    if (tableData?.sections) {
      const defaultChecked: any[] = [];

      tableData.sections.forEach((section: any, sectionIndex: number) => {
        section.ratedCriteria.forEach((criteria: any, criteriaIndex: number) => {
          const key = `${sectionIndex}-${criteriaIndex}`;
          const selectedEval = selectedEvaluations[key];
          const evaluation = criteria.evaluations.find((e: any) => e.criteriaEvaluation === selectedEval);
          const score = evaluation?.score;

          if (score && Number(score) < 5) {
            const criteriaData = { // Create criteriaData object here to reuse
              sectionName: section.sectionName,
              ratedCriteria: criteria.criteriaName,
              ratio: displayPercentages[key],
              evaluation: selectedEval,
              score: score
            };
            defaultChecked.push(criteriaData);
          }
        });
      });


      // Only set defaultChecked if checkedCriteria is currently empty or hasn't been explicitly set from backend
      if (checkedCriteria.length === 0) { // Check if it's empty, meaning not initialized by backend data yet

        setCheckedCriteria(defaultChecked);
      } else {
      }
    }
  }, [tableData]); // ADD checkedCriteria to dependency array



  const isCapaRulesVisibleOnInitialRender = Object.entries(selectedEvaluations).some(([key, value]) => value !== undefined && value !== '');


  const initializeCompletedData = () => {
    if (!supplierScoreData[0]?.sections) return;

    const initialEvals: any = {};
    const initialPercentages: any = {};
    let initialEvaluatedCount = 0;

    supplierScoreData[0].sections.forEach((section: any, sIndex: number) => {
      section.ratedCriteria.forEach((criteria: any, cIndex: number) => {
        const key = `${sIndex}-${cIndex}`;

        if (criteria.evaluations?.[0]) {
          initialEvals[key] = criteria.evaluations[0].criteriaEvaluation;
          initialPercentages[key] = criteria.evaluations[0][category] ?? 0;

          if (criteria.evaluations[0].criteriaEvaluation !== '') {
            initialEvaluatedCount++;
          }
        }
      });
    });

    setSelectedEvaluations(initialEvals);
    setCurrentPercentages(initialPercentages);
    setDisplayPercentages(initialPercentages)
    // setDisplayPercentages(distributeRoundedPercentages(initialPercentages));
    setComments(supplierScoreData[0]?.comments || '');

    if (supplierScoreData[0]?.capa) {
      setCapaData(supplierScoreData[0].capa);
    }
  };


  const handleCapaDataChange = (data: any[]) => {


  };

  const getSeverity = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'IN PROGRESS':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'info';
      default:
        return 'info'; // Default severity if needed
    }
  };

  const handleCheckboxChange = (section: any, criteria: any, sectionIndex: number, criteriaIndex: number) => {
    const key = `${sectionIndex}-${criteriaIndex}`;
    const selectedEval = selectedEvaluations[key];
    const evaluation = criteria.evaluations.find((e: any) => e.criteriaEvaluation === selectedEval);
    const score = evaluation?.score || '';

    const criteriaData = {
      sectionName: section.sectionName,
      ratedCriteria: criteria.criteriaName,
      ratio: displayPercentages[key],
      evaluation: selectedEval,
      score: score
    };

    setCheckedCriteria(prev => {
      const exists = prev.some(item =>
        item.sectionName === criteriaData.sectionName &&
        item.ratedCriteria === criteriaData.ratedCriteria
      );

      if (exists) {
        // only remove if it was manually unchecked and not a default selection (score < 5)
        // if (Number(score) >= 5) {
        return prev.filter(item =>
          !(item.sectionName === criteriaData.sectionName &&
            item.ratedCriteria === criteriaData.ratedCriteria)
        );
        // }
        // return prev;
      } else {
        return [...prev, criteriaData];
      }
    });
  };


  if (initializing || !tableData) {
    return (
      <div className="w-full p-4">
        <div className="mb-2">
          <Skeleton width="100px" height="30px" className="mb-2" />
        </div>
        <div className="border rounded-lg p-4">
          <Skeleton width="100%" height="400px" />
        </div>
      </div>
    );
  }


  if (noData) {
    return (
      <div className="w-full p-4 text-center">
        <div className="text-gray-500">Evaluation is in progress / pending by evaluator</div>
      </div>
    );
  }

  const handleApprove = () => {
    setIsApprovalDialogVisible(true);
  };
  const handleApprovalConfirm = async () => {
    await handleSubmit("Approved");
    setIsApprovalDialogVisible(false);

  };

  const handleRejectDialogOpen = () => {
    setIsRejectDialogVisible(true);
  };

  const closeRejectDialog = () => {
    setIsRejectDialogVisible(false);
  };

  const handleReject = (keepData: boolean) => {
    handleSubmit("Rejected", keepData);
    closeRejectDialog();
  };

  const handleSubmit = async (status: string, keepData?: boolean) => {
    setLoading(true);
    const payload = {
      approverId: userId,
      supplierScoreId: tableData?.supplierScoreId,
      depId: Number(departmentId),
      catId: Number(catId),
      subCatId: Number(subCatId),
      approvalStatus: status,
      approverComment: approverComment,
      checkedData: checkedCriteria,
      ...(status === "Rejected" && { keepData }) // conditionally add keepData for Rejected status
    };

    try {
      const response = await PostCall('/company/score-approval', payload);
      if (response.code === 'SUCCESS') {
        setLoading(false);
        onSuccess();
        setAlert('success', `Evaluation has been ${status.toLowerCase()} successfully`);
      } else {
        setAlert('error', 'Something went wrong!!');
      }
    } catch (error) {
      setAlert('error', 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isTableLoading ? <TableSkeletonSimple columns={5} rows={12} /> :

        <div className=" w-full shadow-sm mt-3 overflow-x-auto">

          <div className="min-w-[800px]">
            <div className='flex justify-content-start'>
              <Badge value={isCompleted?.toUpperCase()} severity={getSeverity(isCompleted)} className="mr-3 mb-2" />
            </div>


            <table className="min-w-full bg-white border">
              <thead>
                <tr style={{ backgroundColor: '#E9EFF6' }}>
                  <th className="px-4 py-3 text-left text-md font-bold text-black">Section Name</th>
                  <th className="px-4 py-3 text-left text-md font-bold text-black">Rated Criteria</th>
                  <th className="px-4 py-3 text-left text-md font-bold text-black">Ratio (100%)</th>
                  <th className="px-4 py-3 text-left text-md font-bold text-black">Evaluation</th>
                  <th className="px-4 py-3 text-left text-md font-bold text-black">Score</th>
                </tr>
              </thead>

              <tbody>
                {tableData?.sections?.map((section: any, sectionIndex: any) => (
                  <>
                    <tr key={`section-${sectionIndex}`}>
                      {sectionIndex !== 0 && (
                        <td colSpan={5}>
                          <hr />
                        </td>
                      )}
                    </tr>

                    {section?.ratedCriteria?.map((criteria: any, criteriaIndex: any) => {
                      const key = `${sectionIndex}-${criteriaIndex}`;
                      const selectedEval = selectedEvaluations[key];
                      const currentPercentage = currentPercentages[key];


                      //if no evaluation is selected, 'NA' will be assigned to score by default
                      const score = criteria.evaluations.find((evaluation: any) => evaluation.criteriaEvaluation === selectedEval)?.score || 'empty';

                      return (
                        <tr key={`criteria-${key}`} className="border-b hover:bg-gray-50">
                          {criteriaIndex === 0 && (
                            <td
                              className="px-4 py-2 text-md text-black-800"
                              rowSpan={section.ratedCriteria.length}
                            // style={{ verticalAlign: "top" }} //commnet this line if you want to show it at middle
                            >
                              {section.sectionName}
                            </td>
                          )}

                          <td className="px-4 py-2 text-md text-gray-500">

                            <Checkbox
                              onChange={() => handleCheckboxChange(
                                section,
                                criteria,
                                sectionIndex,
                                criteriaIndex
                              )}
                              checked={
                                checkedCriteria.some(item =>
                                  item.sectionName === section.sectionName &&
                                  item.ratedCriteria === criteria.criteriaName
                                )
                              }
                              className='mx-2'
                              disabled={isAlreadyApprovedOrRejected}
                            />


                            {criteria.criteriaName}
                          </td>


                          <td className="px-4 py-2">
                            <InputText
                              type="text"
                              value={currentPercentage === 'NA' ? 'NA' : displayPercentages[key] + '%'}
                              size={1}
                              readOnly
                              className='m-auto text-center'
                            />

                          </td>



                          <td className="px-4 py-2">
                            <Dropdown
                              value={selectedEval}
                              options={[
                                // { label: "-- Select an Evaluation --", value: "" }, // for defaukt option, so user can select default again..
                                ...criteria.evaluations.map((evaluation: any) => ({
                                  label: evaluation.criteriaEvaluation,
                                  value: evaluation.criteriaEvaluation,
                                }))
                              ]}
                              placeholder="-- Select an Evaluation --"
                              className="w-full md:w-14rem"
                              showClear
                              disabled={isCompleted?.toLowerCase() === 'completed'}

                            />
                          </td>


                          <td className="px-4 py-2">
                            {score === 'NA' ? (
                              <InputText type="text" size={1} value={score} readOnly className="m-auto bg-gray-400 font-bold border-none text-white text-center" />
                            ) : Number(score) >= 9 ? (
                              <InputText type="text" size={1} value={score} readOnly className="m-auto excellent font-bold border-none text-white text-center" />
                            ) : Number(score) >= 7 ? (
                              <InputText type="text" size={1} value={score} readOnly className="m-auto good font-bold border-none text-white text-center" />
                            ) : score >= 'empty' ? (
                              <InputText type="text" size={1} value="" readOnly className="m-auto bg-white text-center text-transparent" />
                            ) : Number(score) >= 5 ? (
                              <InputText type="text" size={1} value={score} readOnly className="m-auto improvement font-bold border-none text-white text-center" />
                            ) : (
                              <InputText type="text" size={1} value={score} readOnly className="m-auto critical font-bold border-none text-white text-center" />
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </>
                ))}

                <tr style={{ backgroundColor: getBackgroundColor(totalScore) }}>
                  <td colSpan={4} className="px-4 py-3 text-right text-white font-bold">
                    Total Score:
                  </td>
                  <td className="px-4 py-3 font-bold text-lg text-white">{totalScore}</td>
                </tr>
              </tbody>

            </table>

          </div>


          <div className="flex flex-col justify-content-end gap-3 mt-2 mr-2">
            {totalScore > 50 && (
              <div className="m-3 max-w-sm text-ellipsis overflow-hidden" style={{ wordWrap: 'normal', maxWidth: '300px', alignItems: 'stretch' }}>
                <span className="text-red-500">Note:</span> Capa Not Required (Corrective And Preventive Action (CAPA) Required If Score &lt 50%?)
              </div>
            )}

            {/* divider */}
            <div className="w-[1px] bg-red-500" style={{ height: '100%' }}></div>
            <div>
              <div className="py-2 text-dark font-medium">Key Comments / Summary: </div>
              <InputTextarea
                rows={5}
                cols={30}
                onChange={(e) => setComments(e.target.value)} value={comments}
                disabled={isCompleted?.toLowerCase() === 'completed'}
              />
            </div>
          </div>


          {
             (supplierScoreData && totalScore <= 50) && <CapaRequiredTableApprover
              existingSelections={supplierScoreData[0]?.capa}
              selectedPeriod={selectedPeriod} />
          }


          <div className="flex flex-col justify-content-center gap-3  mr-2">
            <div>
              <div className="py-2 text-dark font-medium">Approver Comment: </div>

              <InputTextarea
                rows={5}
                cols={100}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setApproverComment(newValue);
                  setRemainingChars(250 - newValue.length);
                  try {
                    genericTextSchema("Approver Comment", 250).parse({ "Approver Comment": newValue });
                    setRejectionError('');
                  } catch (error) {
                    if (error instanceof z.ZodError) {
                      setRejectionError(error.errors[0].message);
                    }
                  }
                }}
                value={approverComment}
                placeholder='Add comments'
                disabled={isAlreadyApprovedOrRejected}
              />
              <div className="flex justify-between mt-1">
                <small className="text-red-500">{rejectionError}</small>
                <small className={`${remainingChars < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                  {remainingChars > 0 && (
                    <small className={`${remainingChars < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                      {remainingChars} characters remaining
                    </small>
                  )}
                </small>
              </div>

            </div>
          </div>

          <div className='flex justify-content-center gap-3 mt-1 p-3'>
            {isAlreadyApprovedOrRejected ? (
              <Badge value={`Status: ${approvalStatusDisplay}`} severity={getSeverity(approvalStatusDisplay || 'info')} className="mr-3 mb-2" />
            ) : (
              <>
                <Button label="Approve" className='good border-none  hover:text-white' onClick={handleApprove} disabled={remainingChars <= 0} />
                <Button label="Reject" className='critical border-none hover:text-white' onClick={handleRejectDialogOpen} disabled={remainingChars <= 0} />
              </>
            )}
          </div>


          <Dialog
            header="Reject Confirmation"
            visible={isRejectDialogVisible}
            style={{ width: '35vw' }}
            className="delete-dialog"
            footer={
              <div className="flex justify-content-center p-2">
                <Button
                  label="Keep Data"
                  style={{ color: '#DF1740' }}
                  className="px-7"
                  text
                  onClick={() => handleReject(true)}
                  loading={isLoading}
                />
                <Button
                  label="Delete Data"
                  style={{ backgroundColor: '#DF1740', border: 'none' }}
                  className="px-7 hover:text-white"
                  onClick={() => handleReject(false)}
                  loading={isLoading}
                />
              </div>
            }
            onHide={closeRejectDialog}
          >
            <div className="flex flex-column w-full surface-border p-3 text-center gap-4">
              <i className="pi pi-info-circle text-6xl" style={{ marginRight: 10, color: '#DF1740' }}></i>
              <div className="flex flex-column align-items-center gap-1">
                <span>Are you sure you want to reject?</span>
                <span>Choose whether to keep or delete the data.</span>
              </div>
            </div>
          </Dialog>

          <CustomDialogBox
            visible={isApprovalDialogVisible}
            onHide={() => setIsApprovalDialogVisible(false)}
            onConfirm={handleApprovalConfirm}
            onCancel={() => setIsApprovalDialogVisible(false)}
            header="Approval Confirmation"
            message="Are you sure you want to approve this evaluation?"
            subMessage="This action cannot be undone."
            confirmLabel="Yes"
            cancelLabel="Cancel"
            icon="pi pi-exclamation-triangle"
            iconColor="#DF1740"
            loading={isLoading}
          />


        </div>
      }

    </>
  );
};

export default SupplierEvaluationTableApprover;
