export type EvolutionType = 'halfyearly' | 'quarterly';

export const getPeriodOptions = (evolutionType: EvolutionType, year: string | number) => {
  const options = [];
  const type = evolutionType.toLowerCase() as EvolutionType;
  
  if (type === 'halfyearly') {
    return [
      { label: `H1-${year}`, value: `${type}-1-${year}` },
      { label: `H2-${year}`, value: `${type}-2-${year}` }
    ];
  }
  
  if (type === 'quarterly') {
    return Array.from({ length: 4 }, (_, i) => ({
      label: `Q${i + 1}-${year}`,
      value: `${type}-${i + 1}-${year}`
    }));
  }
  
  return [];
};

export const getDefaultPeriod = (evolutionType: EvolutionType, year: string | number) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const type = evolutionType.toLowerCase() as EvolutionType;

  if (type === 'halfyearly') {
    return currentMonth <= 6 ? `${type}-1-${year}` : `${type}-2-${year}`;
  }

  if (type === 'quarterly') {
    return `${type}-${Math.ceil(currentMonth / 3)}-${year}`;
  }

  return null;
};