import { GetCall } from "@/app/api-config/ApiKit";
import { useAppContext } from "@/layout/AppWrapper";
import { buildQueryParams } from "@/utils/utils";
import { useParams } from "next/navigation";
import { Dropdown } from "primereact/dropdown";
import { useState, useEffect } from "react";

interface CapaRule {
  capaRulesName: string;
  status: string;
  departmentId: string;
  categoryId: string;
  subCategoryId: string;
}

interface GroupedData {
  id: string;
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

const CapaRequiredTable = ({ onDataChange, depId }: { onDataChange: ([]: any) => void; depId: string }) => {
  const { setLoading, setAlert } = useAppContext();
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  const urlParams = useParams();
  const { catId, subCatId } = urlParams;

  const groupDataByRules = (data: CapaRule[]) => {
    return data.reduce((acc, item) => {
      if (!acc[item.capaRulesName]) {
        acc[item.capaRulesName] = {
          options: [],
          departmentId: item.departmentId,
          categoryId: item.categoryId,
          subCategoryId: item.subCategoryId
        };
      }
      acc[item.capaRulesName].options.push(item.status);
      return acc;
    }, {} as Record<string, { options: string[]; departmentId: string; categoryId: string; subCategoryId: string; }>);
  };

  useEffect(() => {

    if (depId) {
      fetchCapaRules();
    }
  }, [depId]);

  const fetchCapaRules = async () => {
    setLoading(true);
    try {
      const params = {
        filters: {
          categoryId: catId,
          subCategoryId: subCatId,
          deparmentId: depId
        },
        pagination: false
      };
      const queryString = buildQueryParams(params);
      const response = await GetCall(`/company/caparule?${queryString}`);

      // immediately process the data after fetching
      const grouped = groupDataByRules(response.data || []);

      // transform the grouped data into the required format
      const formattedData = Object.entries(grouped).map(([question, data]) => ({
        id: question,
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

      setGroupedData(formattedData);

      // initialize selected values
      const initialValues = formattedData.reduce((acc, item) => {
        acc[item.id] = "";
        return acc;
      }, {} as Record<string, string>);

      setSelectedValues(initialValues);

    } catch (error) {
      setAlert('error', 'Something went wrong!')
    } finally {
      setLoading(false);
    }
  };


  const handleDropdownChange = (itemId: string, value: string) => {
    setSelectedValues((prevState) => {
      const newState = {
        ...prevState,
        [itemId]: value,
      };
      onDataChange(newState);
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
                  value={selectedValues[item.id]}
                  onChange={(e) => handleDropdownChange(item.id, e.value)}
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
