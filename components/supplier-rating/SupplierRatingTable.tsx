import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useState, useEffect, useRef } from 'react';
import CapaRequiredTable from './CapaRequiredTable';
import { PostCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import { Badge } from 'primereact/badge';
import { Skeleton } from 'primereact/skeleton';
import { getBackgroundColor } from '@/utils/utils';
import CustomDialogBox from '../dialog-box/CustomDialogBox';
import TableSkeletonSimple from './skeleton/TableSkeletonSimple';


const SupplierEvaluationTable = ({ rules,
  selectedPeriod,
  category,
  evaluationPeriod,
  departmentId,
  department,
  totalScoreEvaluated,
  onSuccess,
  supplierScoreData,
  isEvaluatedData,
  catId,
  subCatId,
  supId,
  rulesLoading,
  scoreLoading
}: any) => {

  const [tableData, setTableData] = useState<any>(rules);
  const [selectedEvaluations, setSelectedEvaluations] = useState<any>({});
  const [originalPercentages, setOriginalPercentages] = useState<any>({});
  const [currentPercentages, setCurrentPercentages] = useState<any>({});
  const [displayPercentages, setDisplayPercentages] = useState<any>({});
  const [totalScore, setTotalScore] = useState<any>(0);
  const [comments, setComments] = useState('');
  const [capaData, setCapaData] = useState<any[]>([]);
  const [criteriaCount, setCriteriaCount] = useState(0);
  const [evaluatedCriteriaCount, setEvaluatedCriteriaCount] = useState(0);
  const [capaDataCount, setCapaDataCount] = useState(0);
  const [capaDataCompletedCount, setCapaDataCompletedCount] = useState(0);
  const [defaultPercentages, setDefaultPercentages] = useState<any>({});
  const [isCompleted, setIsCompleted] = useState<any>('pending');
  // const [loading, setLoading2] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [noData, setNoData] = useState(false);
  const [isCompletionDialogVisible, setIsCompletionDialogVisible] = useState(false);

  // const { supId } = urlParams;
  const dropdownRef = useRef<any>(null);

  const { setLoading, setAlert, isLoading} = useAppContext();


  // update function to check CAPA data status
  const checkCapaDataStatus = (data: any[]) => {
    if (!data || data.length === 0) return { count: 0, completedCount: 0 };
    const totalCapaRules = data.length;

    const completedCapaRules = data.filter(
      item => item.selectedStatus && item.selectedStatus !== ''
    ).length;

    setCapaDataCount(totalCapaRules);
    setCapaDataCompletedCount(completedCapaRules);
    return { count: totalCapaRules, completedCount: completedCapaRules };
  };


  useEffect(() => {
    if (supplierScoreData && supplierScoreData[0]?.capa) {
      setCapaData(supplierScoreData[0].capa);
    } else {
      setCapaData([]);
    }
  }, [supplierScoreData, departmentId, selectedPeriod]);


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
          } else if (rules?.sections) {
            setNoData(false)
            setTableData(rules);
            await initializeData();
            const totalCriteria = rules.sections.reduce((total: any, section: any) => {
              return total + section.ratedCriteria.length;
            }, 0);
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
  }, [rules, supplierScoreData]);

  //capa rule visibility logic
  //it is based on selectedEvaluations
  const isCapaRulesVisibleOnInitialRender = Object.entries(selectedEvaluations).some(([key, value]) => value !== undefined && value !== '');


  const initializeData = () => {
    if (!rules?.sections) return;

    const initialEvals: any = {};
    const initialPercentages: any = {};
    const defaultPercentages: any = {};

    let initialEvaluatedCount = 0;

    // First check if we have any matching criteria at all
    const hasAnyMatchingCriteria = rules.sections.some((section: any) =>
      supplierScoreData[0]?.sections?.some((s: any) => s.sectionName === section.sectionName)
    );

    rules.sections.forEach((section: any, sIndex: number) => {
      section?.ratedCriteria?.forEach((criteria: any, cIndex: number) => {
        const key = `${sIndex}-${cIndex}`;

        // Find matching section and criteria in supplier score data
        const matchingSection = supplierScoreData[0]?.sections?.find(
          (s: any) => s.sectionName === section.sectionName
        );

        const matchingCriteria = matchingSection?.ratedCriteria?.find(
          (c: any) => c.criteriaName === criteria.criteriaName
        );

        if (hasAnyMatchingCriteria) {
          // If we have any matching criteria, use matching data for percentages
          if (matchingCriteria?.evaluations?.[0]) {
            // Set evaluation and percentage from matching criteria
            initialEvals[key] = matchingCriteria.evaluations[0].criteriaEvaluation;
            initialPercentages[key] = matchingCriteria.evaluations[0][category] ?? 0;

            if (matchingCriteria.evaluations[0].criteriaEvaluation !== '') {
              initialEvaluatedCount++;
            }
          } else {
            // For criteria without matches, still use percentage from matching data's section
            initialEvals[key] = '';
            const matchingCriteriaInSection = matchingSection?.ratedCriteria?.find(
              (c: any) => c.evaluations?.[0]?.[category] !== undefined
            );
            initialPercentages[key] = matchingCriteriaInSection?.evaluations?.[0]?.[category] ?? 0;
          }
        } else {
          // If no matching criteria at all, use default values
          initialEvals[key] = '';
          initialPercentages[key] = criteria.evaluations[0][category] ?? 0;
        }

        // Store default percentages
        defaultPercentages[key] = criteria.evaluations[0][category] ?? 0;
      });
    });

    setEvaluatedCriteriaCount(initialEvaluatedCount);

    // Handle CAPA data if exists
    if (isEvaluatedData && supplierScoreData[0]?.capa) {
      const initialCapaCompletedCount = supplierScoreData[0].capa.filter(
        (item: any) => item.selectedStatus && item.selectedStatus !== ''
      ).length;

      setCapaDataCount(supplierScoreData[0].capa.length);
      setCapaDataCompletedCount(initialCapaCompletedCount);
    }

    // Set all the state values
    setSelectedEvaluations(initialEvals);
    setOriginalPercentages(initialPercentages);
    setCurrentPercentages(initialPercentages);
    setDisplayPercentages(initialPercentages);
    setDefaultPercentages(defaultPercentages);

    // Calculate initial total score
    // calculateTotalScore(initialEvals, initialPercentages);

    // Set comments if they exist
    if (supplierScoreData[0]?.comments) {
      setComments(supplierScoreData[0].comments);
    } else {
      setComments('');
    }
  };

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

    setEvaluatedCriteriaCount(initialEvaluatedCount);
    setSelectedEvaluations(initialEvals);
    setOriginalPercentages(initialPercentages);
    setCurrentPercentages(initialPercentages);
    setDisplayPercentages(distributeRoundedPercentages(initialPercentages));
    setComments(supplierScoreData[0]?.comments || '');

    if (supplierScoreData[0]?.capa) {
      setCapaData(supplierScoreData[0].capa);
      checkCapaDataStatus(supplierScoreData[0].capa);
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

  const recalculateAllPercentages = (evaluations: any) => {
    // identify NA criteria and calculate total percentage to redistribute
    const naKeys: string[] = [];
    let totalToRedistribute = 0;
    let remainingTotal = 0;


    Object.entries(evaluations).forEach(([key, evalValue]) => {
      // Skip if evaluation is empty
      if (!evalValue) {
        remainingTotal += Number(defaultPercentages[key]) || 0;
        return;
      }

      const [secIdx, critIdx] = key.split('-').map(Number);

      const evaluation = (tableData?.sections[secIdx]?.ratedCriteria[critIdx]?.evaluations as any[])
        .find((e) => e.criteriaEvaluation === evalValue);

      if (evaluation?.score === 'NA') {
        naKeys.push(key);
        // Only add to totalToRedistribute if it's a number
        const originalValue = Number(defaultPercentages[key]);

        if (!isNaN(originalValue)) {
          totalToRedistribute += originalValue;
        }
      } else {
        // Only add to remainingTotal if it's a number
        const originalValue = Number(defaultPercentages[key]);

        if (!isNaN(originalValue)) {
          remainingTotal += originalValue;
        }
      }
    });

    // if all criteria are NA or no NA selections, return original percentages
    if (naKeys.length === 0 || naKeys.length === Object.keys(evaluations).length) {
      return { ...defaultPercentages };
    }

    // Calculate new percentages for non-NA criteria
    const newPercentages = { ...defaultPercentages };

    // Mark NA values
    naKeys.forEach((key) => {
      newPercentages[key] = 'NA';
    });

    // Redistribute percentages to non-NA criteria proportionally
    Object.keys(evaluations).forEach((key) => {
      if (!naKeys.includes(key)) {
        const originalPercentage = Number(defaultPercentages[key]);

        if (!isNaN(originalPercentage)) {

          const proportion = originalPercentage / remainingTotal;
          const redistributedAmount = totalToRedistribute * proportion;
          newPercentages[key] = originalPercentage + redistributedAmount;
        }
      }
    });

    // Ensure total is exactly 100% for non-NA values
    const nonNAKeys = Object.keys(newPercentages).filter((key) => newPercentages[key] !== 'NA');
    if (nonNAKeys.length > 0) {
      let currentTotal = nonNAKeys.reduce((sum, key) => sum + Number(newPercentages[key]), 0);
      const highestKey = nonNAKeys.reduce((a, b) =>
        (Number(newPercentages[a]) > Number(newPercentages[b]) ? a : b)
      );

      if (Math.abs(currentTotal - 100) > 0.01) {
        const difference = 100 - currentTotal;
        newPercentages[highestKey] = Number(newPercentages[highestKey]) + difference;
      }
    }

    return newPercentages;
  };


  const calculateTotalScore = (evaluations: any, percentages: any) => {
    let scoreSum = 0;

    tableData?.sections?.forEach((section: any, sectionIndex: number) => {
      section.ratedCriteria.forEach((criteria: any, criteriaIndex: number) => {
        const key = `${sectionIndex}-${criteriaIndex}`;
        const selectedEval = evaluations[key];
        const currentPercentage = percentages[key];

        if (selectedEval !== undefined && selectedEval !== '' && currentPercentage !== 'NA') {
          // add check for empty string

          const evaluation = (criteria.evaluations as any[]).find((e) => e.criteriaEvaluation === selectedEval);

          if (evaluation && evaluation.score !== 'NA') {
            const score = Number(evaluation.score);
            const percentage = Number(currentPercentage);
            scoreSum += (score * percentage) / 10;
          }
        }
      });
    });

    setTotalScore(Math.round(scoreSum * 100) / 100);
  };


  const handleEvaluationChange = (sectionIndex: number, criteriaIndex: number, value: string) => {
    const key = `${sectionIndex}-${criteriaIndex}`;

    const updatedEvals = {
      ...selectedEvaluations,
      [key]: value
    };
    // calculate newly evaluated criteria count
    const evaluatedCount = Object.values(updatedEvals).filter(
      (evalv) => evalv !== undefined && evalv !== ''
    ).length;
    setEvaluatedCriteriaCount(evaluatedCount);

    const updatedPercentages = recalculateAllPercentages(updatedEvals);
    const roundedPercentages = distributeRoundedPercentages(updatedPercentages);


    setSelectedEvaluations(updatedEvals);
    setCurrentPercentages(updatedPercentages);
    setDisplayPercentages(roundedPercentages);
    // calculateTotalScore(updatedEvals, updatedPercentages);
    calculateTotalScore(updatedEvals, roundedPercentages);
  };

  const prepareApiData = () => {
    const sections = tableData?.sections?.map((section: any) => {
      return {
        sectionName: section.sectionName,
        ratedCriteria: section.ratedCriteria.map((criteria: any, criteriaIndex: number) => {
          const sectionIndex = tableData.sections.indexOf(section);
          const key = `${sectionIndex}-${criteriaIndex}`;

          // Get selected evaluation
          const selectedEval = selectedEvaluations[key];

          // Get current percentage from displayPercentages for both selected and unselected
          const currentPercentage = displayPercentages[key];

          if (selectedEval) {
            // If criteria is selected, send complete evaluation data
            const evaluation = criteria.evaluations.find((e: any) => e.criteriaEvaluation === selectedEval);
            const score = evaluation.score;

            return {
              criteriaName: criteria.criteriaName,
              evaluations: [{
                criteriaEvaluation: selectedEval,
                score: score === 'NA' ? 'NA' : String(score),
                [category]: currentPercentage === 'NA' ? 'NA' : Number(currentPercentage)
              }]
            };
          } else {
            // If criteria is not selected, only send the ratio with current calculated percentage
            return {
              criteriaName: criteria.criteriaName,
              evaluations: [{
                [category]: Number(currentPercentage)
              }]
            };
          }
        })
      };
    });

    const subCategoryId = subCatId;

    const criteriaStatus = evaluatedCriteriaCount === criteriaCount
      ? 'Completed'
      : evaluatedCriteriaCount > 0
        ? 'In Progress'
        : 'In Progress';

    // Determine CAPA status (only if total score <= 50)
    let capaStatus = 'Not Required';
    if (totalScore <= 50) {
      capaStatus = capaDataCompletedCount === capaDataCount
        ? 'Completed'
        : capaDataCompletedCount > 0
          ? 'In Progress'
          : 'In Progress';
    }

    // Combine overall status
    const overallStatus = totalScore <= 50
      ? (criteriaStatus === 'Completed' && capaStatus === 'Completed'
        ? 'Completed'
        : 'In Progress')
      : criteriaStatus;

    const apiData = {
      supId,
      departmentId,
      department,
      categoryId: catId,
      subCategoryId,
      evalutionPeriod: evaluationPeriod,
      sections,
      totalScore,
      comments,
      status: overallStatus,
      ...(totalScore <= 50 && { capa: capaData })
    };

    return apiData;
  };

  const handleSubmit = async () => {
    const apiData = prepareApiData();

    console.log(apiData);

    if (apiData.status === 'Completed') {
      setIsCompletionDialogVisible(true);
      return;
    }

    await submitData(apiData);
  };

  const submitData = async (apiData: any) => {
    try {
      setLoading(true);
      const response = await PostCall('/company/supplier-score', apiData);

      if (response.code === 'SUCCESS') {
        setAlert('success', "Supplier Score Successfully Submitted!");
        onSuccess();
      } else {
        setAlert('error', response.message);
      }
    } catch (err) {
      setAlert('error', "Something Went Wrong!!");
    } finally {
      setLoading(false);
    }
  };

  const handleCompletionConfirm = async () => {
    const apiData = prepareApiData();
    await submitData(apiData);
    setIsCompletionDialogVisible(false);
  };


  const handleCapaDataChange = (data: any[]) => {
    if (totalScore > 50) {
      setCapaData([]);
    }
    setCapaData(data);
    checkCapaDataStatus(data);
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


  // if (initializing || !tableData) {
  //   return (
  //     <div className="w-full p-4">
  //       <div className="mb-2">
  //         <Skeleton width="100px" height="30px" className="mb-2" />
  //       </div>
  //       <div className="border rounded-lg p-4">
  //         <Skeleton width="100%" height="400px" />
  //       </div>
  //     </div>
  //   );
  // }


  if (!initializing && noData) {
    return (
      <div className="w-full p-4 text-center">
        <div className="text-gray-500">No evaluation data available</div>
      </div>
    );
  }


  return (
    // <div className=" w-full overflow-x-auto shadow-sm mt-5 relative">

    //changed
    <div className=" w-full shadow-sm mt-3 overflow-x-auto">

      {
       ( rulesLoading || scoreLoading) ? <TableSkeletonSimple columns={5} rows={12} /> :

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
                            {criteria.criteriaName}</td>

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
                              ref={dropdownRef}
                              value={selectedEval}
                              onChange={(e) => handleEvaluationChange(sectionIndex, criteriaIndex, e.value)}
                              options={[
                                // { label: "-- Select an Evaluation --", value: "" }, // for defaukt option, so user can select default again..
                                ...criteria.evaluations.map((evaluation: any) => ({
                                  label: String(evaluation.criteriaEvaluation),
                                  value: evaluation.criteriaEvaluation,
                                }))
                              ]}
                              placeholder="-- Select an Evaluation --"
                              className="w-full md:w-14rem"
                              showClear
                              disabled={isCompleted?.toLowerCase() === 'completed'}
                            // pt={{
                            //   item: ({ selected }: any) => ({
                            //     className: selected ? 'bg-primary-100' : undefined
                            //   })
                            // }}

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
                {/* } */}


              </tbody>

            </table>
          </div>
      }




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
            {(totalScore <= 50) && <CapaRequiredTable catId={catId} subCatId={subCatId} onDataChange={handleCapaDataChange} depId={departmentId} existingSelections={supplierScoreData[0]?.capa} setCapaDataCount={setCapaDataCount} selectedPeriod={selectedPeriod} isCompleted={isCompleted} />}
          </div>
          :
          <div className=' right-0 bottom-0 flex justify-center gap-3 mt-4' >
            {(totalScore <= 50 && isCapaRulesVisibleOnInitialRender) && <CapaRequiredTable catId={catId} subCatId={subCatId} onDataChange={handleCapaDataChange} depId={departmentId} setCapaDataCount={setCapaDataCount} selectedPeriod={selectedPeriod} isCompleted={isCompleted} />}
          </div>

      }
      <div className='flex justify-content-end gap-3 mt-1 p-3'>

        <Button label="Save" className='bg-pink-500 hover:text-white' onClick={handleSubmit} disabled={isCompleted?.toLowerCase() === 'completed'} loading={isLoading} />

      </div>


      <CustomDialogBox
        visible={isCompletionDialogVisible}
        onHide={() => setIsCompletionDialogVisible(false)}
        onConfirm={handleCompletionConfirm}
        onCancel={() => setIsCompletionDialogVisible(false)}
        header="Completion Warning"
        message="You have completed the evaluation."
        subMessage="If you save now, you won't be able to re-evaluate until approval is rejected."
        confirmLabel="Save"
        cancelLabel="Cancel"
        icon="pi pi-exclamation-triangle"
        iconColor="#DF1740"
        loading={isLoading}
      />

    </div>
  );
};

export default SupplierEvaluationTable;
