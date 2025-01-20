import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useState, useEffect } from 'react';
import CapaRequiredTable from './CapaRequiredTable';
import { useParams } from 'next/navigation';
import { PostCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import { Badge } from 'primereact/badge';

const SupplierEvaluationTable = ({ rules, category, evaluationPeriod, categoryName, departmentId, department, isEvaluatedData, totalScoreEvaluated, onSuccess }: any) => {

  const [tableData, setTableData] = useState(rules);
  const [selectedEvaluations, setSelectedEvaluations] = useState<any>({});
  const [originalPercentages, setOriginalPercentages] = useState<any>({});
  const [currentPercentages, setCurrentPercentages] = useState<any>({});
  const [displayPercentages, setDisplayPercentages] = useState<any>({});
  const [totalScore, setTotalScore] = useState<any>(0);
  const [comments, setComments] = useState('');
  const [capaData, setCapaData] = useState<any[]>([]);
  // const [isAnyCapaEmpty, setIsAnyCapaEmpty] = useState<boolean>(false);

  const urlParams = useParams();
  const { supId, catId, subCatId } = urlParams;

  const { setLoading, setAlert } = useAppContext();

  // Reset initialization when category changes
  useEffect(() => {

    if (rules && category) {
      setTableData(rules);

      initializeData(rules);

      // fetchCapaRules();
    }

  }, [rules, category]);


  //capa rule visibility logic
  //it is based on selectedEvaluations
  const isCapaRulesVisibleOnInitialRender = Object.entries(selectedEvaluations).some(([key, value]) => value !== undefined && value !== '');
  const isAnyEvaluationEmpty = Object.values(selectedEvaluations).some((value) => value === undefined || value === '');



  const initializeData = (currentRules: any) => {
    const initialEvals: any = {};
    const initialPercentages: any = {};

    currentRules?.sections?.forEach((section: any, sIndex: number) => {
      section?.ratedCriteria?.forEach((criteria: any, cIndex: number) => {
        const key = `${sIndex}-${cIndex}`;

        // Set initial evaluation

        //uncomment if you want to initialized with first evaluation

        if (isEvaluatedData) {
          initialEvals[key] = criteria?.evaluations[0]?.criteriaEvaluation;
        } else {
          initialEvals[key] = criteria?.evaluations.criteriaEvaluation;

        }
        // Set initial percentage
        //here category is either rawPack or copack..it coming as a prop
        const categoryValue = criteria?.evaluations?.[0]?.[category];

        console.log(categoryValue);

        initialPercentages[key] = categoryValue ?? 0;

      });
    });

    setSelectedEvaluations(initialEvals);
    setOriginalPercentages(initialPercentages);
    setCurrentPercentages(initialPercentages);

    const roundedPercentages = distributeRoundedPercentages(initialPercentages);
    setDisplayPercentages(roundedPercentages);
    calculateTotalScore(initialEvals, initialPercentages);
  };

  const distributeRoundedPercentages = (percentages: any) => {
    const displayPercentages: any = {};
    const nonNAEntries: string[] = [];

    // first, handle NA values
    Object.entries(percentages).forEach(([key, value]) => {
      if (value === 'NA') {
        displayPercentages[key] = 'NA';
      } else {
        nonNAEntries.push(key);
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

    // sssecond pass: distribute remaining percentage points
    const remaining = 100 - usedPercentage;
    for (let i = 0; i < remaining; i++) {
      //cyclic distribution ...in case if remaining is larger than the sortedEntries ..it ensure that index loops back to the start of sortedEntries once it reaches the end...
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
      const [secIdx, critIdx] = key.split('-').map(Number);

      const evaluation = (tableData?.sections[secIdx].ratedCriteria[critIdx].evaluations as any[]).find((e) => e.criteriaEvaluation === evalValue);

      if (evaluation?.score === 'NA') {
        naKeys.push(key);
        totalToRedistribute += originalPercentages[key];
      } else {
        remainingTotal += originalPercentages[key];
      }
    });

    // if all criteria are NA or no NA selections, return original percentages
    if (naKeys.length === 0 || naKeys.length === Object.keys(evaluations).length) {
      return { ...originalPercentages };
    }

    // cccalculate new percentages for non-NA criteria
    const newPercentages = { ...originalPercentages };

    // mark NA values first..
    naKeys.forEach((key) => {
      newPercentages[key] = 'NA';
    });

    // redistribute percentages to non-NA criteria proportionally
    Object.keys(evaluations).forEach((key) => {
      if (!naKeys.includes(key)) {
        const originalPercentage = originalPercentages[key];
        const proportion = originalPercentage / remainingTotal;
        const redistributedAmount = totalToRedistribute * proportion;
        const newPercentage = originalPercentage + redistributedAmount;
        newPercentages[key] = Number(newPercentage.toFixed(2));
      }
    });

    // 3 - eensure total is exactly 100% by adjusting the highest non-NA percentage

    const nonNAKeys = Object.keys(newPercentages).filter((key) => newPercentages[key] !== 'NA');
    if (nonNAKeys.length > 0) {
      let currentTotal = nonNAKeys.reduce((sum, key) => sum + Number(newPercentages[key]), 0);
      const highestKey = nonNAKeys.reduce((a, b) => (Number(newPercentages[a]) > Number(newPercentages[b]) ? a : b));

      if (Math.abs(currentTotal - 100) > 0.01) {
        // using small threshold for floating point comparison
        const difference = 100 - currentTotal;
        newPercentages[highestKey] = Number((Number(newPercentages[highestKey]) + difference).toFixed(2));
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

        if (selectedEval && selectedEval !== "" && currentPercentage !== 'NA') { // add check for empty string

          const evaluation = (criteria.evaluations as any[]).find(
            (e) => e.criteriaEvaluation === selectedEval
          );

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

    // console.log(updatedEvals);

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
        ratedCriteria: section.ratedCriteria
          .map((criteria: any, criteriaIndex: number) => {
            const sectionIndex = tableData.sections.indexOf(section);
            const key = `${sectionIndex}-${criteriaIndex}`;
            const selectedEval = selectedEvaluations[key];

            const evaluation = criteria.evaluations.find((e: any) => e.criteriaEvaluation === selectedEval);

            if (!evaluation) return null;

            // get the current percentage for this criteria
            const currentPercentage = displayPercentages[key];

            // get the score
            const score = evaluation.score;
            console.log("category", category);

            // prepare the ratio key based on category
            // const ratioKey = category.toLowerCase() === 'copack' ? 'ratiosCopack' : 'ratiosRawpack';

            return {
              criteriaName: criteria.criteriaName,
              evaluations: [
                {
                  criteriaEvaluation: evaluation.criteriaEvaluation,
                  // Keep score as string if it's 'NA', otherwise convert to number
                  // score: score === 'NA' ? 'NA' : Number(score),
                  score: score === 'NA' ? 'NA' : String(score),
                  // Keep ratio as string if it's 'NA', otherwise use the current percentage
                  [category]: currentPercentage === 'NA' ? 'NA' : Number(currentPercentage)
                }
              ]
            };
          })
          .filter(Boolean)
      };
    });

    const subCategoryId = subCatId;

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
      ...(totalScore <= 50 && { capa: capaData })
    };

    return apiData;
  };

  const handleSubmit = async () => {
    
    const hasInvalidCapa = capaData.some(item => 
      !item.selectedStatus || item.selectedStatus.trim() === ''
    );
  
    if (hasInvalidCapa) {
      setAlert('error', 'must add capa rules');
      return;
    }

    
    const apiData = prepareApiData();

    try {

      const response = await PostCall('/company/supplier-score', apiData);

      if (response.code === 'SUCCESS') {

        setAlert('success', "Supplier Score Successfully Submitted!")
        onSuccess();
      } else {
        setAlert('error', response.message)
      }
    } catch (err) {

      setAlert('error', "Something Went Wrong!!")
    } finally {


    }

  };

  
  const handleCapaDataChange = (data: any[]) => {
    setCapaData(data);
    console.log(data);

  };


  return (
    // <div className=" w-full overflow-x-auto shadow-sm mt-5 relative">

    //changed
    <div className=" w-full shadow-sm mt-3 overflow-x-auto">

      <div className="min-w-[800px]">
        <div className='flex justify-content-start'>

          {isEvaluatedData ? <Badge value="Evaluated" severity="success"></Badge> : '' }
        </div>

        <table className="min-w-full bg-white border">
          <thead>
            <tr style={{ backgroundColor: "#E9EFF6" }}>

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

                      <td className="px-4 py-2 text-md text-gray-500">{criteria.criteriaName}</td>

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
                          onChange={(e) => handleEvaluationChange(sectionIndex, criteriaIndex, e.value)}
                          options={[
                            { label: "-- Select an Evaluation --", value: "" }, // for defaukt option, so user can select default again..
                            ...criteria.evaluations.map((evaluation: any) => ({
                              label: evaluation.criteriaEvaluation,
                              value: evaluation.criteriaEvaluation,
                            }))
                          ]}
                          placeholder="-- Select an Evaluation --"
                          className="w-full md:w-14rem"
                          showClear
                          pt={{
                            item: ({ selected }: any) => ({
                              className: selected ? 'bg-primary-100' : undefined
                            })
                          }}

                          disabled={isEvaluatedData}
                        />

                      </td>

                      <td className="px-4 py-2">

                        {score === 'NA' ?

                          <InputText
                            type="text" size={1} value={score} readOnly className='m-auto bg-gray-400 font-bold border-none text-white text-center' />
                          :

                          Number(score) >= 7
                            ? <InputText
                              type="text" size={1} value={score} readOnly className='m-auto bg-green-400 font-bold border-none text-white text-center' /> :

                            score >= "empty"
                              ? <InputText
                                type="text" size={1} value='' readOnly className='m-auto bg-white text-center text-transparent' /> :

                              Number(score) >= 4
                                ? <InputText
                                  type="text" size={1} value={score} readOnly className='m-auto bg-yellow-400 font-bold border-none text-white text-center' /> :

                                <InputText
                                  type="text" size={1} value={score} readOnly className='m-auto bg-red-400 font-bold border-none text-white text-center' />
                        }
                      </td>
                    </tr>
                  );
                })}
              </>
            ))}

            {isEvaluatedData ?
              <tr style={{ backgroundColor: totalScoreEvaluated <= 50 ? '#FBC1C1' : '#B6E4C9' }}>
                <td colSpan={4} className="px-4 py-3 text-right text-black font-bold">
                  Total Score:
                </td>
                <td className="px-4 py-3 font-bold text-lg">{totalScoreEvaluated}</td>
              </tr> :

              <tr style={{ backgroundColor: totalScore <= 50 ? '#FBC1C1' : '#B6E4C9' }}>
                <td colSpan={4} className="px-4 py-3 text-right text-black font-bold">
                  Total Score:
                </td>
                <td className="px-4 py-3 font-bold text-lg">{totalScore.toFixed(2)}</td>
              </tr>
            }


          </tbody>

        </table>
      </div>

      <div className='flex flex-col justify-content-end gap-3 mt-2 mr-2'>

        {totalScore > 50 &&
          <div className='m-3 max-w-sm text-ellipsis overflow-hidden' style={{ wordWrap: "normal", maxWidth: "300px", alignItems: "stretch" }}>
            <span className='text-red-500'>Note:</span> Capa Not Required (Corrective And Preventive Action (CAPA) Required If Score &lt 50%?)
          </div>}

        {/* divider */}
        <div className="w-[1px] bg-red-500" style={{ height: '100%' }}></div>

        <div>
          <div className='py-2 text-dark font-medium'>Key Comments / Summary: </div>

          {
            isEvaluatedData ? 
            <InputTextarea rows={5} cols={30} value={rules?.comments}
            disabled={isEvaluatedData} /> :
            <InputTextarea rows={5} cols={30} onChange={(e) => setComments(e.target.value)} value={comments}
            disabled={isEvaluatedData} />
          }

         
        </div>

      </div>


      {/* if CAPA is required */}

      {
        isEvaluatedData ?
          <div className=' right-0 bottom-0 flex justify-center gap-3 mt-4' >
            {(totalScoreEvaluated <= 50) && <CapaRequiredTable onDataChange={handleCapaDataChange} depId={departmentId} existingSelections={rules?.capa} isEvaluatedData />}
          </div>
          :
          <div className=' right-0 bottom-0 flex justify-center gap-3 mt-4' >
            {(totalScore <= 50 && isCapaRulesVisibleOnInitialRender) && <CapaRequiredTable onDataChange={handleCapaDataChange} depId={departmentId} isEvaluatedData={false} />}
          </div>

      }

      <div className='flex justify-content-end gap-3 mt-1 p-3'>
        {
          !isEvaluatedData &&
            <>
            <Button label="Save" className='bg-pink-500 hover:text-white' onClick={handleSubmit} disabled={isAnyEvaluationEmpty}
            />
          </>
        }


      </div>
    </div>
  );
};

export default SupplierEvaluationTable;
