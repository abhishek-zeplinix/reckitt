const ScoreTiles = () => {
    const containerStyle: any = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px',
        backgroundColor: '#F8FAFC',
        borderRadius: '6px',
        border: '1px solid #CBD5E1',
        margin: '6px 0',
        flexWrap: 'wrap',
        gap: '12px'
    };

    const itemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const squareStyle = {
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        flexShrink: 0
    };

    const labelStyle = {
        fontSize: '14px',
        color: '#64748B',
        whiteSpace: 'nowrap'
    };

    const tileItems = [
        { color: '#F44336', label: 'Critical (0-50)' },
        { color: '#FF9800', label: 'Improvement Needed (51-70)' },
        { color: '#4CAF50', label: 'Good (71-90)' },
        { color: '#2196F3', label: 'Excellent (91-100)' }
    ];

    return (
        <div style={containerStyle}>
            {tileItems.map((item, index) => (
                <div key={index} style={itemStyle}>
                    <div style={{ ...squareStyle, backgroundColor: item.color }} />
                    <span style={labelStyle}>{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default ScoreTiles;
