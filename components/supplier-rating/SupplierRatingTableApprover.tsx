import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useState, useEffect, useRef } from 'react';
import CapaRequiredTable from './CapaRequiredTable';
import { useParams } from 'next/navigation';
import { Badge } from 'primereact/badge';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Skeleton } from 'primereact/skeleton';
import { getBackgroundColor } from '@/utils/utils';
import { Checkbox } from 'primereact/checkbox';
import TableSkeleton from './skeleton/TableSkeleton';


const SupplierEvaluationTableApprover = ({ rules,
  selectedPeriod,
  category,
  departmentId,
  totalScoreEvaluated,
  supplierScoreData,
  isEvaluatedData,
  isTableLoading
}: any) => {

  const [tableData, setTableData] = useState<any>(rules);
  const [selectedEvaluations, setSelectedEvaluations] = useState<any>({});
  const [currentPercentages, setCurrentPercentages] = useState<any>({});
  const [displayPercentages, setDisplayPercentages] = useState<any>({});
  const [totalScore, setTotalScore] = useState<any>(0);
  const [comments, setComments] = useState('');
  const [capaData, setCapaData] = useState<any[]>([]);
  const [criteriaCount, setCriteriaCount] = useState(0);
  const [capaDataCount, setCapaDataCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState<any>('pending');
  const [loading, setLoading2] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [noData, setNoData] = useState(false);
  const [checkedCriteria, setCheckedCriteria] = useState<any[]>([]);
  const [approverComment, setApproverComment] = useState('');

  const dropdownRef = useRef<any>(null);

  console.log(checkedCriteria);

  useEffect(() => {

    setTableData([])
    const initialize = async () => {
      setInitializing(true);
      setIsCompleted('pending');

      try {

        if (supplierScoreData) {
          const status = supplierScoreData[0]?.status;
          status === undefined ? setIsCompleted('pending') : setIsCompleted(status);

          // if (status?.toLowerCase() === 'completed' || (!rules?.sections && supplierScoreData[0]?.sections)) {
          if (status?.toLowerCase() === 'completed') {
            setNoData(false)
            setTableData(supplierScoreData[0]);
            await initializeCompletedData();
            const totalCriteria = supplierScoreData[0]?.sections?.reduce((total: any, section: any) => {
              return total + section.ratedCriteria.length;
            }, 0) || 0;

            setCriteriaCount(totalCriteria);
          } else {
            setNoData(true)
          }
          setTotalScore(totalScoreEvaluated);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, [rules, category, supplierScoreData]);


  useEffect(() => {

    if (supplierScoreData) {
      const status = supplierScoreData[0]?.status;
      if (status?.toLowerCase() === 'completed') {
        return;
      }
    }
    setLoading2(true)

    if (rules) {
      setTimeout(() => {
        if (dropdownRef.current) {
          const dropdownInstance = dropdownRef.current;
          const options = dropdownInstance.props.options;

          if (options && options.length > 1) {
            const originalValue = dropdownInstance.props.value;

            // simulate selecting the second option
            const newValue = options[1].value; // pick second value from options
            dropdownInstance.props.onChange({ value: newValue });

            // restore the original value after 50ms
            setTimeout(() => {
              dropdownInstance.props.onChange({ value: originalValue });
              setTimeout(() => setLoading2(false), 100);
            }, 50);
          }
        } else {
          setLoading2(false)
        }
      }, 400);

    }



  }, [rules]);


  useEffect(() => {
    if (tableData?.sections) {
      const defaultChecked: any[] = [];

      tableData.sections.forEach((section: any, sectionIndex: number) => {
        section.ratedCriteria.forEach((criteria: any, criteriaIndex: number) => {
          const key = `${sectionIndex}-${criteriaIndex}`;
          const selectedEval = selectedEvaluations[key];
          const evaluation = criteria.evaluations.find((e: any) => e.criteriaEvaluation === selectedEval);
          const score = evaluation?.score;

          // check if score is less than 5
          if (score && Number(score) < 5) {
            defaultChecked.push({
              sectionName: section.sectionName,
              ratedCriteria: criteria.criteriaName,
              ratio: displayPercentages[key],
              evaluation: selectedEval,
              score: score
            });
          }
        });
      });

      setCheckedCriteria(defaultChecked);
    }
  }, [tableData, selectedEvaluations, displayPercentages]);

  //capa rule visibility logic
  //it is based on selectedEvaluations
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
    setDisplayPercentages(distributeRoundedPercentages(initialPercentages));
    setComments(supplierScoreData[0]?.comments || '');

    if (supplierScoreData[0]?.capa) {
      setCapaData(supplierScoreData[0].capa);
    }
  };


  const distributeRoundedPercentages = (percentages: any) => {
    const displayPercentages: any = {};
    const nonNAEntries: string[] = [];

    // first, handle NA values and non-NA values
    Object.entries(percentages).forEach(([key, value]) => {
      if (value === 'NA') {
        displayPercentages[key] = value;  // Keep NA values as is
      } else {
        nonNAEntries.push(key);
        // Convert the value to a number and store initially
        displayPercentages[key] = Number(value);
      }
    });

    if (nonNAEntries.length === 0) return displayPercentages;

    // sort entries by their decimal parts
    const sortedEntries = nonNAEntries
      .map((key) => ({
        key,
        originalValue: Number(percentages[key]),
        roundedValue: Math.floor(Number(percentages[key])),
        decimalPart: Number(percentages[key]) % 1
      }))
      .sort((a, b) => b.decimalPart - a.decimalPart);

    // first pass: assign floor values
    let usedPercentage = 0;
    sortedEntries.forEach((entry) => {
      displayPercentages[entry.key] = entry.roundedValue;
      usedPercentage += entry.roundedValue;
    });

    // second pass: distribute remaining percentage points
    const remaining = 100 - usedPercentage;
    for (let i = 0; i < remaining; i++) {
      displayPercentages[sortedEntries[i % sortedEntries.length].key]++;
    }

    return displayPercentages;
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
        if (Number(score) >= 5) {
          return prev.filter(item =>
            !(item.sectionName === criteriaData.sectionName &&
              item.ratedCriteria === criteriaData.ratedCriteria)
          );
        }
        return prev;
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
    alert("API under construction")
  }

  const handleReject = () => {
    alert("API under construction")
  }

  // if(isTableLoading){
  //   return(
  //     <div>
  //       <TableSkeleton />
  //     </div>
  //   )
  // }


  return (
    // <div className=" w-full overflow-x-auto shadow-sm mt-5 relative">

    //changed

    <>

{isTableLoading ? 'loading.......' :

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
                          />


                          {criteria.criteriaName}
                        </td>

                        {
                          loading ? <Skeleton width="5rem" />
                            :
                            <td className="px-4 py-2">
                              <InputText
                                type="text"
                                value={currentPercentage === 'NA' ? 'NA' : displayPercentages[key] + '%'}
                                size={1}
                                readOnly
                                className='m-auto text-center'
                              />
                              {loading && <ProgressSpinner className="p-ml-2" />} {/* Show the spinner */}
                            </td>
                        }


                        <td className="px-4 py-2">
                          <Dropdown
                            ref={dropdownRef}
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
        (isEvaluatedData) ?
          <div className=' right-0 bottom-0 flex justify-center gap-3 mt-4' >
            {(totalScore <= 50) && <CapaRequiredTable onDataChange={handleCapaDataChange} depId={departmentId} existingSelections={supplierScoreData[0]?.capa} setCapaDataCount={setCapaDataCount} selectedPeriod={selectedPeriod} isCompleted={isCompleted} />}
          </div>
          :
          <div className=' right-0 bottom-0 flex justify-center gap-3 mt-4' >
            {(totalScore <= 50 && isCapaRulesVisibleOnInitialRender) && <CapaRequiredTable onDataChange={handleCapaDataChange} depId={departmentId} existingSelections={[]} setCapaDataCount={setCapaDataCount} selectedPeriod={selectedPeriod} isCompleted={isCompleted} />}
          </div>

      }


      <div className="flex flex-col justify-content-end gap-3  mr-2">
        <div>
          <div className="py-2 text-dark font-medium">Approver Comment: </div>

          <InputTextarea
            rows={5}
            cols={100}
            onChange={(e) => setApproverComment(e.target.value)} value={approverComment}
            placeholder='add comments'
          />

        </div>
      </div>

      <div className='flex justify-content-end gap-3 mt-1 p-3'>
        <Button label="Approve" className='good border-none  hover:text-white' onClick={handleApprove} />
        <Button label="Reject" className='critical border-none  hover:text-white' onClick={handleReject} />
      </div>


    </div>
}
    </>
  );
};

export default SupplierEvaluationTableApprover;
