import { GetCall } from "@/app/api-config/ApiKit";
import { useAppContext } from "@/layout/AppWrapper";
import { buildQueryParams } from "@/utils/utils";
import { useParams } from "next/navigation";
import { Dropdown } from "primereact/dropdown";
import { useState, useEffect } from "react";

interface CapaRule {
  capaRulesName: string;
  orderBy: number;
  status: string[];
  effectiveFrom: string;
  subCategory: string;
  category: string;
  department: string;
}

interface CapaRuleResponse {
  capaRuleId: number;
  selectedStatus: string;
}

interface GroupedData {
  id: string;
  capaRuleId: number;
  capaQuestion: string;
  status: {
    options: string[];
  };
  orderBy: number;
}

interface CapaRequiredTableProps {
  onDataChange: (data: CapaRuleResponse[]) => void;
  depId: string;
  existingSelections?: CapaRuleResponse[];
  isEvaluatedData: boolean;
  setCapaDataCount: (count: number) => void;
  selectedPeriod: string;
}

const CapaRequiredTable = ({ onDataChange, depId, existingSelections, setCapaDataCount, selectedPeriod}: CapaRequiredTableProps) => {
  const { setLoading, setAlert } = useAppContext();
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<number, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  
  const urlParams = useParams();
  const { catId, subCatId } = urlParams;

  const transformApiData = (rules: CapaRule[]) => {
    return rules.map((rule, index) => ({
      id: rule.capaRulesName,
      capaRuleId: index + 1, // Using index+1 as ID since the new API doesn't provide IDs
      capaQuestion: rule.capaRulesName,
      status: {
        options: rule.status,
      },
      orderBy: rule.orderBy
    }));
  };

  useEffect(() => {
    if (depId) {
      setIsInitialized(false);
      fetchCapaRules();
    }
  }, [depId]);

  useEffect(() => {
    setIsInitialized(false);
  }, [existingSelections]);

  useEffect(() => {
    if (existingSelections && groupedData.length > 0 && !isInitialized) {
      const existingValues = existingSelections.reduce((acc, item) => {
        acc[item.capaRuleId] = item.selectedStatus;
        return acc;
      }, {} as Record<number, string>);
      
      setSelectedValues(existingValues);
      setIsInitialized(true);
    }
  }, [existingSelections, groupedData, isInitialized]);

  const fetchCapaRules = async () => {
    setLoading(true);
    try {
      const params = {
        filters: {
          effectiveFrom: selectedPeriod
        },
        pagination: false
      };
      const queryString = buildQueryParams(params);
      const response = await GetCall(`/company/caparule/${catId}/${subCatId}/${depId}?effectiveFrom=${selectedPeriod}`);

      if (response.code === "SUCCESS") {
        const formattedData = transformApiData(response.data?.rules);

        // sort by orderBy field
        formattedData.sort((a, b) => a.orderBy - b.orderBy);
        console.log(formattedData);
        
        setGroupedData(formattedData);
        setCapaDataCount(formattedData.length);

        if (!existingSelections) {
          const initialValues = formattedData.reduce((acc, item) => {
            acc[item.capaRuleId] = "";
            return acc;
          }, {} as Record<number, string>);
          setSelectedValues(initialValues);
        }
      }
    } catch (error) {
      setAlert('error', 'Something went wrongg!');
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownChange = (itemId: string, capaRuleId: number, value: string) => {
    setSelectedValues((prevState) => {
      if (prevState[capaRuleId] === value) {
        return prevState;
      }

      const newState = {
        ...prevState,
        [capaRuleId]: value
      };
      
      const apiData: CapaRuleResponse[] = groupedData.map(item => ({
        capaRuleId: item.capaRuleId,
        selectedStatus: newState[item.capaRuleId] || ""
      }));
      
      onDataChange(apiData);
      return newState;
    });
  };

  console.log(selectedValues);
  

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
          {groupedData.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 break-words">
                {item.capaQuestion}
              </td>
              <td className="px-4 py-2">
                <Dropdown
                  options={item.status.options.map((option) => ({
                    label: option,
                    value: option,
                  }))}
                  value={selectedValues[item.capaRuleId] || ""}
                  onChange={(e) => handleDropdownChange(item.id, item.capaRuleId, e.value)}
                  placeholder="Select Status"
                  className="w-full"
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