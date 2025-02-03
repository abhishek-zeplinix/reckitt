import { useState } from 'react';

interface ReadMoreTextProps {
    text: string;
    charLimit?: number;
}

const ReadMoreText: React.FC<ReadMoreTextProps> = ({ text, charLimit = 70 }) => {
    const [expanded, setExpanded] = useState(false);

    if (!text) return 'N/A'; // Handle empty text cases

    const isLongText = text.length > charLimit;
    const displayText = expanded || !isLongText ? text : text.slice(0, charLimit) + '...';

    return (
        <span>
            {displayText}
            {isLongText && (
                <a onClick={() => setExpanded(!expanded)} className="cursor-pointer text-primary-main  ml-2">
                    {expanded ? 'Read Less' : 'Read More'}
                </a>
            )}
        </span>
    );
};

export default ReadMoreText;
