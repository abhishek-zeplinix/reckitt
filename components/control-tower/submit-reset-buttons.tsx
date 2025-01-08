import React from 'react';
import { Button } from 'primereact/button';

const SubmitResetButtons = ({ onSubmit, onReset, label }: { onSubmit: () => void; onReset: () => void; label: string }) => {
    return (
        <div className="flex justify-content-end gap-3 mt-1 p-1">
            <Button label="Reset" style={{ backgroundColor: '#ffff', color: '#DF177C', border: 'none' }} onClick={onReset} />
            <Button label={label} style={{ backgroundColor: '#DF177C', border: 'none' }} className="hover:text-white" onClick={onSubmit} />
        </div>
    );
};

export default SubmitResetButtons;
