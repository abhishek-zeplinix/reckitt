'use client'
import { Dropdown } from "primereact/dropdown";
import { useState, useEffect } from "react";

interface CapaRule {
  capaRulesName: string;
  orderBy: number;
  status: string[];
}

interface CapaRuleResponse {
  capaRuleId: number;
  selectedStatus: string;
  capaRulesName: string;
}

interface CapaRequiredTableProps {
  existingSelections?: CapaRuleResponse[];
  selectedPeriod: string;
}

const CapaRequiredTableApprover = ({
  existingSelections,
  selectedPeriod,
}: CapaRequiredTableProps) => {

  const [rules, setRules] = useState<CapaRule[]>([]);
  const [selectedValues, setSelectedValues] = useState<any>(() => {
    return existingSelections?.reduce((acc, selection) => {
      acc[selection.capaRuleId] = selection.selectedStatus;
      return acc;
    }, {} as Record<number, string>) || {};
  });


  useEffect(() => {
    
    setSelectedValues({});
    if ((existingSelections || []).length > 0) {

      const initialValues = existingSelections?.reduce((acc, selection) => {
        acc[selection.capaRuleId] = selection.selectedStatus;
        return acc;
      }, {} as Record<number, string>);

      setSelectedValues(initialValues);

      // if no rules from API yet, create rules from existing selections
      if (rules.length === 0) {
        const rulesFromSelections: any = existingSelections?.map((selection, index) => ({
          capaRulesName: selection.capaRulesName,
          orderBy: index + 1,
          status: [selection.selectedStatus] // use the selected status as the only option initially
        }));

        setRules(rulesFromSelections);
      }
    }
  }, [selectedPeriod, existingSelections]);
        

  return (
    <div className="w-full">
      <div className="text-black text-sm">
        <span className="font-bold text-lg" style={{ color: "#DD5B5B" }}>
          CAPA Required
        </span>{" "}
        (CORRECTIVE AND PREVENTATIVE ACTION (CAPA) REQUIRED IF SCORE ≤ 50%?)
      </div>
      <table className="w-full bg-white border table-fixed">
        <thead>
          <tr style={{ backgroundColor: "#E9EFF6" }}>
            <th className="px-4 py-3 text-left text-md font-bold text-black w-3/4">
              COMPLETE BELOW IF CAPA IS REQUIRED (SCORE ≤ 50%)
            </th>
            <th className="px-4 py-3 text-left text-md font-bold text-black w-1/4">
              STATUS
            </th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 break-words">
                {rule.capaRulesName}
              </td>
              <td className="px-4 py-2">
                <Dropdown
                  options={rule.status.map(option => ({
                    label: option,
                    value: option,
                  }))}
                  value={selectedValues[index + 1] || ""}
                  placeholder="Select Status"
                  className="w-full"
                  disabled
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CapaRequiredTableApprover;