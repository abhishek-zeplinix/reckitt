

export const getPeriodOptions = (evolutionType: any) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    if (evolutionType.toLowerCase() === 'halfyearly') {
        return [
            { label: `H1-${currentYear}`, value: `${evolutionType}-1-${currentYear}` },
            { label: `H2-${currentYear}`, value: `${evolutionType}-2-${currentYear}` }
        ];

    } else if (evolutionType.toLowerCase() === 'quarterly') {
        return [
            { label: `Q1-${currentYear}`, value: `${evolutionType}-1-${currentYear}` },
            { label: `Q2-${currentYear}`, value: `${evolutionType}-2-${currentYear}` },
            { label: `Q3-${currentYear}`, value: `${evolutionType}-3-${currentYear}` },
            { label: `Q4-${currentYear}`, value: `${evolutionType}-4-${currentYear}` }
        ];
    }

    return [];
};

export const getDefaultPeriod = (evolutionType: any) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    if (evolutionType.toLowerCase() === 'halfyearly') {
        return currentMonth <= 6 ? `${evolutionType}-1-${currentYear}` : `${evolutionType}-2-${currentYear}`;

    } else if (evolutionType.toLowerCase() === 'quarterly') {
        if (currentMonth <= 3) return `${evolutionType}-1-${currentYear}`;
        if (currentMonth <= 6) return `${evolutionType}-2-${currentYear}`;
        if (currentMonth <= 9) return `${evolutionType}-3-${currentYear}`;
        return `${evolutionType}-4-${currentYear}`;
    }

    return null;
};

export const validateSelectedPeriod = (selectedPeriod: any, evolutionType: any) => {
    const options = getPeriodOptions(evolutionType);
    return options.some(option => option.value === selectedPeriod);
};
