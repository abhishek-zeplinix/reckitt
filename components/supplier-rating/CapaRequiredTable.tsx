import { Dropdown } from "primereact/dropdown";
import { useState } from "react";

const dummyData = [
  {
    capaQuetions: "Reckitt informed the supplier about the points poorly rated in the scorecard. This could be through email, meeting etc.?",
    status: [
      { statusEvaluation: "Yes" },
      { statusEvaluation: "No" },
    ]
  },
  {
    capaQuetions: "CAPA Proposed by Supplier?",
    status: [
      { statusEvaluation: "Yes" },
      { statusEvaluation: "No" },
    ]
  },
  {
    capaQuetions: "CAPA STATUS?",
    status: [
      { statusEvaluation: "CAPA Open" },
      { statusEvaluation: "CAPA Completed. This means root cause.." },
    ]
  },
  {
    capaQuetions: "CAPA Due Date or Date of Completion",
    status: [
      { statusEvaluation: "End of Q1" },
      { statusEvaluation: "End of Q2" },
      { statusEvaluation: "End of Q3" },
      { statusEvaluation: "End of Q4" },
    ]
  },
  {
    capaQuetions: "CAPA Overdue?",
    status: [
      { statusEvaluation: "Yes" },
      { statusEvaluation: "No" },
    ]
  },
  {
    capaQuetions: "CAPA IDENTIFIER/EVIDENCE - email stored in SBS Folder in SharePoint, or CAPA ref # for quality etc",
    status: [
      { statusEvaluation: "Yes" },
      { statusEvaluation: "No" },
      { statusEvaluation: "Not Applicable" },
    ]
  }
];

const CapaRequiredTable = () => {
  const [selectedValues, setSelectedValues] = useState<any>(
    dummyData.reduce((acc: any, _, index) => {
      acc[index] = null;
      return acc;
    }, {})
  );

  const handleDropdownChange = (itemIndex: number, value: string) => {
    setSelectedValues((prevState: any) => ({
      ...prevState,
      [itemIndex]: value,
    }));
  };

  const handleSubmit = () => {
    const payload = dummyData.map((item, index) => ({
      question: item.capaQuetions,
      selectedStatus: selectedValues[index],
    }));
    console.log("API Payload:", payload);
  };

  console.log(selectedValues);
  

  return (
    <div className="w-full">
      <p className="text-red-500 mb-2">CAPA Required</p>
      <table className="w-full bg-white border table-fixed">
        <thead>
          <tr style={{ backgroundColor: "#E9EFF6" }}>
            <th className="px-4 py-3 text-left text-md font-bold text-black w-3/4">
              {`COMPLETE BELOW IF CAPA IS REQUIRED (SCORE <= 50%)`}
            </th>
            <th className="px-4 py-3 text-left text-md font-bold text-black w-1/4">
              STATUS
            </th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((item, itemIndex) => (
            <tr key={itemIndex} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 break-words">
                {item.capaQuetions}
              </td>
              <td className="px-4 py-2">
                <Dropdown
                  options={item.status.map((stat) => ({
                    label: stat.statusEvaluation,
                    value: stat.statusEvaluation,
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