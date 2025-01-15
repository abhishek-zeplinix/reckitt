import { GetCall } from "@/app/api-config/ApiKit";
import { useAppContext } from "@/layout/AppWrapper";
import { buildQueryParams } from "@/utils/utils";
import { useParams } from "next/navigation";
import { Dropdown } from "primereact/dropdown";
import { useState, useEffect } from "react";

interface CapaRule {
  capaRuleId: number;
  capaRulesName: string;
  status: string;
  departmentId: string;
  categoryId: string;
  subCategoryId: string;
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
  metadata: {
    departmentId: string;
    categoryId: string;
    subCategoryId: string;
  };
}

interface CapaRequiredTableProps {
  onDataChange: (data: CapaRuleResponse[]) => void;
  depId: string;
  existingSelections?: CapaRuleResponse[];
  isEvaluatedData: boolean;
}

const CapaRequiredTable = ({ onDataChange, depId, existingSelections, isEvaluatedData }: CapaRequiredTableProps) => {
  const { setLoading, setAlert } = useAppContext();
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);  // Add this flag

  console.log(existingSelections);
  
  const urlParams = useParams();
  const { catId, subCatId } = urlParams;

  const groupDataByRules = (data: CapaRule[]) => {
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.capaRulesName]) {
        acc[item.capaRulesName] = {
          capaRuleId: item.capaRuleId,
          options: [],
          departmentId: item.departmentId,
          categoryId: item.categoryId,
          subCategoryId: item.subCategoryId
        };
      }
      acc[item.capaRulesName].options.push(item.status);
      return acc;
    }, {} as Record<string, {
      capaRuleId: number;
      options: string[];
      departmentId: string;
      categoryId: string;
      subCategoryId: string;
    }>);

    return Object.entries(grouped).map(([question, data]) => ({
      id: question,
      capaRuleId: data.capaRuleId,
      capaQuestion: question,
      status: {
        options: data.options,
      },
      metadata: {
        departmentId: data.departmentId,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId
      }
    }));
  };

  console.log('grouped data' ,groupedData);
  

  useEffect(() => {
    if (depId) {
      setIsInitialized(false);

      fetchCapaRules();
    }
  }, [depId]);


  
  // Initialize with existing selections only once
  useEffect(() => {

    if (existingSelections && groupedData.length > 0 && !isInitialized) {

      const existingValues = existingSelections.reduce((acc, item) => {

        acc[item.capaRuleId] = item.selectedStatus;
        return acc;
      }, {} as Record<number, string>);
      
      setSelectedValues(existingValues);
      setIsInitialized(true);  // Mark as initialized
    }
  }, [existingSelections, groupedData, isInitialized]);


  const fetchCapaRules = async () => {
    setLoading(true);
    try {
      const params = {
        filters: {
          categoryId: catId,
          subCategoryId: subCatId,
          departmentId: depId
        },
        pagination: false
      };
      const queryString = buildQueryParams(params);
      const response = await GetCall(`/company/caparule?${queryString}`);
      const formattedData = groupDataByRules(response.data || []);
      setGroupedData(formattedData);

      // Only initialize if there are no existing selections
      if (!existingSelections) {
        const initialValues = formattedData.reduce((acc, item) => {
          acc[item.id] = "";
          return acc;
        }, {} as Record<string, string>);
        setSelectedValues(initialValues);
      }
    } catch (error) {
      setAlert('error', 'Something went wrong!')
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownChange = (itemId: string, capaRuleId: number, value: string) => {
    setSelectedValues((prevState) => {
      // Only update if value actually changed
      if (prevState[capaRuleId] === value) {
        return prevState;
      }

      const newState: any = {
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
                  value={selectedValues[item.capaRuleId] || ""}  // Use capaRuleId here
                  onChange={(e) => handleDropdownChange(item.id, item.capaRuleId, e.value)}
                  placeholder="Select Status"
                  className="w-full"
                  disabled={isEvaluatedData}
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