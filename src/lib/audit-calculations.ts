// src/lib/audit-calculations.ts

interface ItemCalculations {
    tpp: number;
    points: number;
    weightedTpp: number;      // wgt*TPP
    weightedPoints: number;   // wgt*Points
    scorePerItem: number;     // wgt*Points/wgt*TPP
    complyingCount: number;
    needImprovementCount: number;
    ncCount: number;
    naCount: number;
    countExNa: number;
    needImprovementPlusNc: number;
    needImprovementWeighted: number;  // Need Improvement * 0.5
    ncWeighted: number;               // NC * 1
    markdownCorrection: number;
    correctedScore: number;           // Score per item * Markdown
    weightedPointsMarkdown: number;   // wgt*points * Markdown Correction
  }
  
  export function calculateSectionMetrics(section: any): ItemCalculations {
    const weightage = section.weightage / 100; // Convert percentage to decimal
    const items = section.items;
  
    // Basic counts
    const complyingCount = items.filter(i => i.answer === 'Complying').length;
    const needImprovementCount = items.filter(i => i.answer === 'Need Improvement').length;
    const ncCount = items.filter(i => i.answer === 'NC').length;
    const naCount = items.filter(i => i.answer === 'NA').length;
    const countExNa = items.length - naCount;
  
    // Points calculations
    const totalPoints = items.reduce((sum, item) => {
      if (item.answer === 'NA') return sum;
      return sum + (item.points || 0);
    }, 0);
  
    // TPP calculations - exclude NA items
    const totalTpp = items.reduce((sum, item) => {
      if (item.answer === 'NA') return sum;
      return sum + item.tpp;
    }, 0);
  
    // Weighted calculations
    const weightedTpp = totalTpp * weightage;
    const weightedPoints = totalPoints * weightage;
    const scorePerItem = weightedTpp ? (weightedPoints / weightedTpp) * 100 : 0;
  
    // Non-complying calculations
    const needImprovementPlusNc = needImprovementCount + ncCount;
    const needImprovementWeighted = needImprovementCount * 0.5;
    const ncWeighted = ncCount * 1;
  
    // Markdown correction
    let markdownCorrection = 0;
    if (countExNa > 0) {
      markdownCorrection = (countExNa - needImprovementWeighted - ncWeighted) / countExNa;
    }
  
    // Final calculations
    const correctedScore = scorePerItem ? scorePerItem * markdownCorrection : 0;
    const weightedPointsMarkdown = weightedPoints * markdownCorrection;
  
    return {
      tpp: totalTpp,
      points: totalPoints,
      weightedTpp,
      weightedPoints,
      scorePerItem,
      complyingCount,
      needImprovementCount,
      ncCount,
      naCount,
      countExNa,
      needImprovementPlusNc,
      needImprovementWeighted,
      ncWeighted,
      markdownCorrection,
      correctedScore,
      weightedPointsMarkdown
    };
  }
  
  export function calculateOverallScore(sections: any[]): number {
    let totalWeightedPointsMarkdown = 0;
    let totalWeightedTpp = 0;
  
    sections.forEach(section => {
      const metrics = calculateSectionMetrics(section);
      totalWeightedPointsMarkdown += metrics.weightedPointsMarkdown;
      totalWeightedTpp += metrics.weightedTpp;
    });
  
    return totalWeightedTpp ? (totalWeightedPointsMarkdown / totalWeightedTpp) * 100 : 0;
  }