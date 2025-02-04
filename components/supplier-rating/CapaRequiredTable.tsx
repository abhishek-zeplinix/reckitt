import { GetCall } from "@/app/api-config/ApiKit";
import { useAppContext } from "@/layout/AppWrapper";
import { useParams } from "next/navigation";
import { Dropdown } from "primereact/dropdown";
import { useState, useEffect, useRef } from "react";

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
  onDataChange: (data: CapaRuleResponse[]) => void;
  depId: string;
  existingSelections?: CapaRuleResponse[];
  setCapaDataCount: (count: number) => void;
  selectedPeriod: string;
  isCompleted: string;
}

const CapaRequiredTable = ({
  onDataChange,
  depId,
  existingSelections,
  setCapaDataCount,
  isCompleted,
  selectedPeriod
}: CapaRequiredTableProps) => {

  const { setLoading, setAlert } = useAppContext();
  const [rules, setRules] = useState<CapaRule[]>([]);
  const [selectedValues, setSelectedValues] = useState<any>(() => {
    return existingSelections?.reduce((acc, selection) => {
      acc[selection.capaRuleId] = selection.selectedStatus;
      return acc;
    }, {} as Record<number, string>) || {};
  });

  const urlParams = useParams();
  const { catId, subCatId } = urlParams;

  console.log(existingSelections);
  
  useEffect(() => {
    
    // setSelectedValues({});
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
        setCapaDataCount(rulesFromSelections.length);
      }
    }
  }, [selectedPeriod, existingSelections]);

  useEffect(() => {
    if (depId) {
      fetchCapaRules();
    }
  }, [depId]);


  // useEffect(() => {
      // setSelectedValues({}); 
  // }, [selectedPeriod]);


  const fetchCapaRules = async () => {
    setLoading(true);
    try {
      const response = await GetCall(`/company/caparule/${catId}/${subCatId}/${depId}`);

      if (response.code === "SUCCESS" && response.data.rules.length > 0) {
        const sortedRules = response.data.rules.sort((a: CapaRule, b: CapaRule) =>
          a.orderBy - b.orderBy
        );
        setRules(sortedRules);
        setCapaDataCount(sortedRules.length);



        // preserve existing selections when updating rules
        if (!existingSelections) {
          const emptyValues = sortedRules.reduce((acc: any, _: any, index: any) => {
            acc[index + 1] = "";
            return acc;
          }, {} as Record<number, string>);
          setSelectedValues(emptyValues);
        }


      } else if (existingSelections?.length) {
        // if API returns no rules but we have existing selections, keep using those

        
        const rulesFromSelections = existingSelections.map((selection, index) => ({
          capaRulesName: selection.capaRulesName,
          orderBy: index + 1,
          status: [selection.selectedStatus] // Use the selected status as the only option
        }));
        setRules(rulesFromSelections);
        setCapaDataCount(rulesFromSelections.length);

        
      // Call onDataChange with the initial values from existing selections
      const responseData = rulesFromSelections.map((rule: any, index: number) => ({
        capaRuleId: index + 1,
        selectedStatus: existingSelections[index].selectedStatus || "",
        capaRulesName: rule.capaRulesName
      }));
      onDataChange(responseData);
  
      }
    } catch (error) {
      // On API error, fallback to existing selections if available
      if (existingSelections?.length) {
        const rulesFromSelections = existingSelections.map((selection, index) => ({
          capaRulesName: selection.capaRulesName,
          orderBy: index + 1,
          status: [selection.selectedStatus]
        }));
        setRules(rulesFromSelections);
        setCapaDataCount(rulesFromSelections.length);

        // Call onDataChange with the initial values from existing selections
        const responseData = rulesFromSelections.map((rule: any, index: number) => ({
          capaRuleId: index + 1,
          selectedStatus: existingSelections[index].selectedStatus || "",
          capaRulesName: rule.capaRulesName
        }));
        onDataChange(responseData);
      }
      setAlert('error', 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };


  const handleDropdownChange = (ruleIndex: number, ruleName: string, value: string) => {
    setSelectedValues((prev: any) => {
      const newValues = { ...prev, [ruleIndex]: value };

      // Create response data with capaRulesName included
      const responseData = rules.map((rule, index) => ({
        capaRuleId: index + 1,
        selectedStatus: newValues[index + 1] || "",
        capaRulesName: rule.capaRulesName
      }));

      onDataChange(responseData);
      return newValues;
    });
  };

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
                  onChange={(e) => handleDropdownChange(index + 1, rule.capaRulesName, e.value)}
                  placeholder="Select Status"
                  className="w-full"
                  disabled={isCompleted?.toLowerCase() === 'completed'}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CapaRequiredTable;