import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { useState, useEffect } from 'react';
import CapaRequiredTable from './CapaRequiredTable';

const SupplierEvaluationTable = ({ rules }: any) => {
  const [tableData, setTableData] = useState(rules);
  const [selectedEvaluations, setSelectedEvaluations] = useState<any>({});
  const [originalPercentages, setOriginalPercentages] = useState<any>({});
  const [currentPercentages, setCurrentPercentages] = useState<any>({});
  const [totalScore, setTotalScore] = useState<any>(0);
  const [isCapaRequired, setIsCapaRequired] = useState<boolean>(false)

  useEffect(() => {
    if (rules) {
      setTableData(rules.data);

      const initialEvals: any = {};
      const initialPercentages: any = {};

      rules.data?.sections?.forEach((section: any, sIndex: number) => {
        section.ratedCriteria?.forEach((criteria: any, cIndex: number) => {
          const key = `${sIndex}-${cIndex}`;
          initialEvals[key] = criteria.evaluations[0].criteriaEvaluation;
          initialPercentages[key] = criteria.percentage;
        });
      });

      setSelectedEvaluations(initialEvals);
      setOriginalPercentages(initialPercentages);
      setCurrentPercentages(initialPercentages);
      calculateTotalScore(initialEvals, initialPercentages);
    }
  }, [rules]);



  const calculateTotalScore = (evaluations: any, percentages: any) => {
    let scoreSum = 0;

    tableData.sections?.forEach((section: any, sectionIndex: number) => {
      section.ratedCriteria.forEach((criteria: any, criteriaIndex: number) => {
        const key = `${sectionIndex}-${criteriaIndex}`;
        const selectedEval = evaluations[key];
        const currentPercentage = percentages[key];

        // only calculate if we have valid values
        if (selectedEval && currentPercentage !== 'NA') {
          const evaluation = (criteria.evaluations as any[]).find(
            (e) => e.criteriaEvaluation === selectedEval
          );

          if (evaluation && evaluation.score !== 'NA') {
            const score = Number(evaluation.score);
            scoreSum += (score * Number(currentPercentage)) / 10;
          }
        }
      });
    });

    // setTotalScore(Math.min(Math.round(scoreSum * 100) / 100, 100));
    setTotalScore(Math.round(scoreSum * 100) / 100);


  };


  const recalculateAllPercentages = (evaluations: any) => {

    // identify NA criteria and calculate total percentage to redistribute
    const naKeys: string[] = [];
    let totalToRedistribute = 0;
    let remainingTotal = 0;

    Object.entries(evaluations).forEach(([key, evalValue]) => {

      const [secIdx, critIdx] = key.split('-').map(Number);

      const evaluation = (tableData.sections[secIdx].ratedCriteria[critIdx].evaluations as any[])
        .find(e => e.criteriaEvaluation === evalValue);

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
    naKeys.forEach(key => {
      newPercentages[key] = 'NA';
    });

    // redistribute percentages to non-NA criteria proportionally
    Object.keys(evaluations).forEach(key => {
      if (!naKeys.includes(key)) {
        const originalPercentage = originalPercentages[key];
        const proportion = originalPercentage / remainingTotal;
        const redistributedAmount = totalToRedistribute * proportion;
        const newPercentage = originalPercentage + redistributedAmount;
        newPercentages[key] = Number(newPercentage.toFixed(2));
      }
    });

    // 3 - eensure total is exactly 100% by adjusting the highest non-NA percentage

    const nonNAKeys = Object.keys(newPercentages).filter(key => newPercentages[key] !== 'NA');
    if (nonNAKeys.length > 0) {
      let currentTotal = nonNAKeys.reduce((sum, key) => sum + Number(newPercentages[key]), 0);
      const highestKey = nonNAKeys.reduce((a, b) =>

        (Number(newPercentages[a]) > Number(newPercentages[b]) ? a : b)
      );

      if (Math.abs(currentTotal - 100) > 0.01) {  // using small threshold for floating point comparison
        const difference = 100 - currentTotal;
        newPercentages[highestKey] = Number((Number(newPercentages[highestKey]) + difference).toFixed(2));
      }
    }

    return newPercentages;
  };




  const handleEvaluationChange = (sectionIndex: number, criteriaIndex: number, value: string) => {
    const key = `${sectionIndex}-${criteriaIndex}`;
    const updatedEvals = {
      ...selectedEvaluations,
      [key]: value,
    };

    // recalculate all percentages based on current state of evaluations
    const updatedPercentages = recalculateAllPercentages(updatedEvals);

    setSelectedEvaluations(updatedEvals);
    setCurrentPercentages(updatedPercentages);
    // pass the latest percentages to score calculation
    calculateTotalScore(updatedEvals, updatedPercentages);
  };


  function customRound(value: number) {
    if (value % 1 > 0.5) {
      return Math.ceil(value);
    } else {
      return Math.floor(value);
    }
  }

  return (
    // <div className=" w-full overflow-x-auto shadow-sm mt-5 relative">
    <div className=" w-full shadow-sm mt-5">

      <table className="min-w-full bg-white border">
        <thead>
          <tr style={{ backgroundColor: "#E9EFF6" }}>

            <th className="px-4 py-3 text-left text-md font-bold text-black">Section Name</th>
            <th className="px-4 py-3 text-left text-md font-bold text-black">Rated Criteria</th>
            <th className="px-4 py-3 text-left text-md font-bold text-black">Ratio (%)</th>
            <th className="px-4 py-3 text-left text-md font-bold text-black">Evaluation</th>
            <th className="px-4 py-3 text-left text-md font-bold text-black">Score</th>
          </tr>
        </thead>

        <tbody>

          {tableData.sections?.map((section: any, sectionIndex: any) => (
            <>
              <tr key={`section-${sectionIndex}`} >
                {
                  sectionIndex !== 0 &&
                  <td
                    colSpan={5}
                  >
                    <hr />
                  </td>
                }

              </tr>

              {section.ratedCriteria.map((criteria: any, criteriaIndex: any) => {

                const key = `${sectionIndex}-${criteriaIndex}`;
                const selectedEval = selectedEvaluations[key];
                const currentPercentage = currentPercentages[key];

                const score =
                  criteria.evaluations.find(
                    (evaluation: any) => evaluation.criteriaEvaluation === selectedEval
                  )?.score || '0';

                return (

                  <tr key={`criteria-${key}`} className="border-b hover:bg-gray-50">

                    {/* <td className="px-4 py-2 text-md text-gray-500">{section.sectionName}</td> */}

                    {criteriaIndex === 0 && (
                      <td
                        className="px-4 py-2 text-md text-black-800"
                        rowSpan={section.ratedCriteria.length}
                        style={{ verticalAlign: "top" }}
                      >
                        {section.sectionName}
                      </td>
                    )}

                    <td className="px-4 py-2 text-md text-gray-500">{criteria.criteriaName}</td>

                    <td className="px-4 py-2">
                      <InputText
                        type="text"
                        value={currentPercentage === 'NA' ? 'NA' : customRound(Number(currentPercentage)) + '%'}
                        size={1}
                        readOnly
                      />
                    </td>


                    <td className="px-4 py-2">

                      <Dropdown
                        value={selectedEval}
                        onChange={(e) => handleEvaluationChange(sectionIndex, criteriaIndex, e.value)}
                        options={criteria.evaluations.map((evaluation: any) => ({
                          label: evaluation.criteriaEvaluation,
                          value: evaluation.criteriaEvaluation,
                        }))}
                        placeholder="Select an Evaluation"
                        className="w-full md:w-14rem"
                      />
                    </td>



                    <td className="px-4 py-2">

                      {score === 'NA' ?
                        <Button label={score} size='small'
                          className="p-button-sm bg-gray-400 text-white border-none w-10" />
                        :
                        Number(score) >= 7
                          ? <Button label={score} size='small'
                            className="p-button-sm bg-green-600 text-white border-none w-10" /> :
                          Number(score) >= 4
                            ? <Button label={score} size='small'
                              className="p-button-sm bg-yellow-400 text-white border-none w-10" /> :

                            <Button label={score} size='small'
                              className="p-button-sm bg-red-400 text-white border-none w-10" />
                      }
                    </td>
                  </tr>
                );
              })}
            </>
          ))}


          <tr className="" style={{ backgroundColor: "#B6E4C9" }}>
            <td colSpan={4} className="px-4 py-3 text-right text-black font-bold">
              Total Score:
            </td>
            <td className="px-4 py-3 font-bold text-lg">{totalScore.toFixed(2)}</td>
          </tr>

        </tbody>

      </table>

      <div className=' right-0 bottom-0 flex flex-col justify-center gap-3 mt-5'>
        <div className='m-3'>
          Note: Capa Not Required (Corrective And Preventive Action (CAPA) Required If Score &lt 50%?)
        </div>

        <div className=''>
          <div className='py-2 text-dark font-medium'>Key Comments / Summary: </div>
          <InputTextarea rows={5} cols={30} />
        </div>

      </div>

      
       {/* if CAPA is required */}
       <div className=' right-0 bottom-0 flex justify-center gap-3 mt-4' >
        {totalScore < 50 && <CapaRequiredTable />}
      </div>

      {/* submission buttons */}
      <div className='flex justify-content-end gap-3 mt-3 p-3'>
      <Button label="Cancle" style={{ backgroundColor: "#ffff", color: "#DF177C", border: 'none'}}/>
      <Button label="Save"  style={{ backgroundColor: "#DF177C", border: 'none'}} />

      </div>

    </div>
  );
};

export default SupplierEvaluationTable;