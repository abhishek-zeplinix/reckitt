import { Dropdown } from "primereact/dropdown";
import { useState } from "react";

// type StatusOption = string;

// interface CapaItem {
//   id: string;
//   capaQuestion: string;
//   status: {
//     options: StatusOption[];
//   };
// }

// interface SelectedValues {
//   [key: number]: string | null;
// }

const improvedData: any[] = [
  {
    id: "CAPA_001",
    capaQuestion: "Was supplier informed about scorecard ratings?",
    status: {
      options: ["Yes", "No"]
    }
  },
  {
    id: "CAPA_002",
    capaQuestion: "Has supplier proposed CAPA?",
    status: {
      options: ["Yes", "No"]
    }
  },
  {
    id: "CAPA_003",
    capaQuestion: "What is the current CAPA status?",
    status: {
      options: ["Open", "In Progress", "Completed"]
    }
  },
  {
    id: "CAPA_004",
    capaQuestion: "What is the CAPA due date?",
    status: {
      options: ["Q1", "Q2", "Q3", "Q4"]
    }
  }
];

const CapaRequiredTable = ({onDataChange}: any) => {
  const [selectedValues, setSelectedValues] = useState<any>(
    improvedData.reduce((acc, _, index) => {
      acc[index] = null;
      return acc;
    }, {} as any)
  );

  console.log(selectedValues);
  

  const handleDropdownChange = (itemIndex: number, value: string) => {
    setSelectedValues((prevState: any) => ({
      ...prevState,
      [itemIndex]: value,
    }));
  };

  const handleSubmit = () => {
    const payload = improvedData.map((item, index) => ({
      id: item.id,
      capaQuestion: item.capaQuestion,
      response: {
        status: selectedValues[index]
      }
    }));
    console.log("API Payload:", payload);
  };

  return (
    <div className="w-full">
      <div className="text-black mb-2 text-sm">
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
          {improvedData.map((item, itemIndex) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 break-words">
                {item.capaQuestion}
              </td>
              <td className="px-4 py-2">
                <Dropdown
                  options={item.status.options.map((option: any) => ({
                    label: option,
                    value: option,
                  }))}
                  value={selectedValues[itemIndex] || ""}
                  onChange={(e) => handleDropdownChange(itemIndex, e.value)}
                  placeholder="Select an Evaluation"
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