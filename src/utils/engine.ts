import { Business, MultiMatchWeights, Product } from '../types';

/**
 * Calculates approximate great-circle distance between coordinates in kilometers.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const clampedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
  return Math.round(R * c * 10) / 10;
}

/**
 * Determines whether a business is currently open based on weekly schedule and overnight shifts.
 */
export function evaluateOpeningHours(
  business: Business,
  currentDate: Date = new Date()
): { isOpen: boolean; statusText: string } {
  const day = currentDate.getDay(); // 0 = Sun, 1 = Mon ...
  // Convert standard JS getDay (0=Sun, 1=Mon) to Python convention (0=Mon ... 6=Sun)
  const pyDay = (day + 6) % 7;
  const prevPyDay = (pyDay + 6) % 7;

  const hoursToday = business.hours?.find((h) => h.dayOfWeek === pyDay);
  const hoursYesterday = business.hours?.find((h) => h.dayOfWeek === prevPyDay);

  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  const parseMins = (tStr: string) => {
    const [h, m] = tStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Check overnight spillover from yesterday
  if (hoursYesterday && !hoursYesterday.isClosed && hoursYesterday.isOvernight) {
    const closeMins = parseMins(hoursYesterday.closeTime);
    if (currentMinutes < closeMins) {
      return {
        isOpen: true,
        statusText: `Open (Overnight until ${hoursYesterday.closeTime})`,
      };
    }
  }

  if (!hoursToday || hoursToday.isClosed) {
    return { isOpen: false, statusText: 'Closed Today' };
  }

  const openMins = parseMins(hoursToday.openTime);
  const closeMins = parseMins(hoursToday.closeTime);

  if (hoursToday.isOvernight) {
    if (currentMinutes >= openMins || currentMinutes < closeMins) {
      return { isOpen: true, statusText: `Open until ${hoursToday.closeTime}` };
    }
    return { isOpen: false, statusText: `Opens at ${hoursToday.openTime}` };
  } else {
    if (currentMinutes >= openMins && currentMinutes <= closeMins) {
      return { isOpen: true, statusText: `Open until ${hoursToday.closeTime}` };
    } else if (currentMinutes < openMins) {
      return { isOpen: false, statusText: `Opens today at ${hoursToday.openTime}` };
    } else {
      return { isOpen: false, statusText: 'Closed for the day' };
    }
  }
}

export interface HardFilterCriteria {
  maxBudget?: number;
  minRating?: number;
  maxDistance?: number;
  category?: string;
  area?: string;
  openNow?: boolean;
  verifiedOnly?: boolean;
  hasWarranty?: boolean;
  hasReturnPolicy?: boolean;
  supportsWhatsapp?: boolean;
  supportsOnlinePay?: boolean;
  supportsCod?: boolean;
  supportsPayAtPickup?: boolean;
}

/**
 * Hard filters: Strict AND evaluation.
 */
export function checkHardFilters(
  b: Business,
  criteria: HardFilterCriteria
): { passes: boolean; failedReasons: string[] } {
  const reasons: string[] = [];

  if (criteria.category && criteria.category !== 'All Categories') {
    if (b.category !== criteria.category) {
      reasons.push(`Category is ${b.category}`);
    }
  }

  if (criteria.area && criteria.area !== 'All Areas') {
    if (b.area !== criteria.area) {
      reasons.push(`Area is ${b.area}`);
    }
  }

  if (criteria.maxBudget && criteria.maxBudget > 0) {
    if (b.startingPrice > criteria.maxBudget) {
      reasons.push(`Starting price ₹${b.startingPrice} > ₹${criteria.maxBudget}`);
    }
  }

  if (criteria.minRating && criteria.minRating > 0) {
    if (b.avgRating < criteria.minRating) {
      reasons.push(`Rating ${b.avgRating} < ${criteria.minRating}`);
    }
  }

  if (criteria.maxDistance && criteria.maxDistance > 0 && b.distanceKm !== undefined) {
    if (b.distanceKm > criteria.maxDistance) {
      reasons.push(`Distance ${b.distanceKm} km > ${criteria.maxDistance} km`);
    }
  }

  if (criteria.openNow && !b.isOpenNow) {
    reasons.push('Currently closed');
  }

  if (criteria.verifiedOnly && !b.verified) {
    reasons.push('Not verified');
  }

  if (criteria.hasWarranty && !b.hasWarranty) {
    reasons.push('No warranty');
  }

  if (criteria.hasReturnPolicy && !b.hasReturnPolicy) {
    reasons.push('No return policy');
  }

  if (criteria.supportsWhatsapp && !b.whatsapp) {
    reasons.push('No WhatsApp');
  }

  if (criteria.supportsOnlinePay && !b.supportsOnlinePay) {
    reasons.push('No online payment');
  }

  if (criteria.supportsCod && !b.supportsCod) {
    reasons.push('No Cash on Delivery');
  }

  if (criteria.supportsPayAtPickup && !b.supportsPayAtPickup) {
    reasons.push('No Pay at Pickup');
  }

  return { passes: reasons.length === 0, failedReasons: reasons };
}

export interface ScoredBusiness extends Business {
  matchScore: number;
  whyThisVendor: string;
  compatibilityBreakdown: {
    ratingScore: string;
    distanceConvenience: string;
    priceAffordability: string;
    trustScore: string;
  };
  nearMissReasons?: string[];
}

/**
 * MultiMatch Pro: Transparent normalized scoring across Rating, Distance, Price, and Trust.
 */
export function scoreAndRankVendors(
  vendors: Business[],
  weights: MultiMatchWeights = { rating: 0.35, distance: 0.25, price: 0.25, trust: 0.15 }
): ScoredBusiness[] {
  if (!vendors.length) return [];

  // Find min and max for normalization
  const ratings = vendors.map((v) => v.avgRating);
  const distances = vendors.map((v) => v.distanceKm ?? 1);
  const prices = vendors.map((v) => v.startingPrice);
  const reviews = vendors.map((v) => v.reviewCount);

  const minR = Math.min(...ratings, 1.0);
  const maxR = Math.max(...ratings, 5.0);
  const minD = Math.min(...distances, 0.5);
  const maxD = Math.max(...distances, 15.0);
  const minP = Math.min(...prices, 100);
  const maxP = Math.max(...prices, 20000);
  const minRev = Math.min(...reviews, 0);
  const maxRev = Math.max(...reviews, 100);

  const diffR = maxR > minR ? maxR - minR : 1;
  const diffD = maxD > minD ? maxD - minD : 1;
  const diffP = maxP > minP ? maxP - minP : 1;
  const diffRev = maxRev > minRev ? maxRev - minRev : 1;

  // Normalize weights
  const totalWeight = weights.rating + weights.distance + weights.price + weights.trust || 1;
  const wR = weights.rating / totalWeight;
  const wD = weights.distance / totalWeight;
  const wP = weights.price / totalWeight;
  const wT = weights.trust / totalWeight;

  return vendors
    .map((v) => {
      const d = v.distanceKm ?? 2.0;
      const sRating = Math.max(0, Math.min(1, (v.avgRating - minR) / diffR));
      const sDist = Math.max(0, Math.min(1, 1 - (d - minD) / diffD));
      const sPrice = Math.max(0, Math.min(1, 1 - (v.startingPrice - minP) / diffP));
      const sTrust =
        0.5 * (v.verified ? 1 : 0) + 0.5 * Math.max(0, Math.min(1, (v.reviewCount - minRev) / diffRev));

      const rawScore = wR * sRating + wD * sDist + wP * sPrice + wT * sTrust;
      const matchScore = Math.round(rawScore * 100 * 10) / 10;

      const strengths: string[] = [];
      if (sRating >= 0.8) strengths.push(`Top-rated (${v.avgRating}★)`);
      if (sDist >= 0.75) strengths.push(`Conveniently close (${d.toFixed(1)} km)`);
      if (sPrice >= 0.75) strengths.push('Budget-friendly pricing');
      if (v.verified) strengths.push('Verified local business');
      if (strengths.length === 0) strengths.push('Balanced distance and value');

      return {
        ...v,
        matchScore,
        whyThisVendor: strengths.join(' · '),
        compatibilityBreakdown: {
          ratingScore: `${Math.round(sRating * 100)}%`,
          distanceConvenience: `${Math.round(sDist * 100)}%`,
          priceAffordability: `${Math.round(sPrice * 100)}%`,
          trustScore: `${Math.round(sTrust * 100)}%`,
        },
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
