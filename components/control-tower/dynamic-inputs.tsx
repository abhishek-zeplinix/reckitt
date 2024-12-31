import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";

const DynamicInput = () => {

    const [inputs, setInputs] = useState([
        { id: 1, value: '' }
    ]);

    const handleInputChange = (index: any, value: any) => {
        const newInputs = [...inputs];
        newInputs[index].value = value;
        setInputs(newInputs);
    };

    const addNewField = () => {
        setInputs([
            ...inputs,
            { id: inputs.length + 1, value: '' }
        ]);
    };

    return (
        <div className="max-w-[1200px] mx-auto">

            <div className="grid">

                <div className="col-12">

                    <div className="grid">
                        {inputs.map((input, index) => (
                            <div key={input.id} className="col-12 md:col-6 lg:col-6">
                                <div className="p-2">
                                    <label className="block text-sm font-medium mb-2">
                                        Field {input.id}
                                    </label>
                                    <span className="p-input-icon-right w-full">
                                        <InputText
                                            value={input.value}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            placeholder="Input"
                                            className="w-full"
                                        />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Button label="Add More Field" icon="pi pi-plus" onClick={addNewField} outlined size='small' className="custom-add-field-button"
                text />


        </div>
    )
}

export default DynamicInput;