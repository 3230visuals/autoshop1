import { SERVICE_STAGES } from '../context/AppTypes';

/* ═══════════════════════════════════════════════════
   Stage color utility — Red → Yellow → Green
   Shared across ProgressBar7Stage & mini progress bars
   ═══════════════════════════════════════════════════ */

const PALETTE = {
    start: { r: 239, g: 68, b: 68 },   // red-500
    mid: { r: 234, g: 179, b: 8 },    // yellow-500
    end: { r: 34, g: 197, b: 94 },    // green-500
};

const defaultTotal = 7;

/**
 * Returns an RGB color string interpolated between red → yellow → green
 * based on stage position within the total stage count.
 */
export const getStageColor = (index: number, total = defaultTotal): string => {
    const t = total <= 1 ? 1 : index / (total - 1);
    let r: number, g: number, b: number;
    if (t <= 0.5) {
        const p = t * 2;
        r = Math.round(PALETTE.start.r + (PALETTE.mid.r - PALETTE.start.r) * p);
        g = Math.round(PALETTE.start.g + (PALETTE.mid.g - PALETTE.start.g) * p);
        b = Math.round(PALETTE.start.b + (PALETTE.mid.b - PALETTE.start.b) * p);
    } else {
        const p = (t - 0.5) * 2;
        r = Math.round(PALETTE.mid.r + (PALETTE.end.r - PALETTE.mid.r) * p);
        g = Math.round(PALETTE.mid.g + (PALETTE.end.g - PALETTE.mid.g) * p);
        b = Math.round(PALETTE.mid.b + (PALETTE.end.b - PALETTE.mid.b) * p);
    }
    return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Returns a CSS box-shadow glow string for the given color.
 */
export const getStageGlow = (color: string, intensity = 1): string =>
    `0 0 ${6 * intensity}px ${color}, 0 0 ${14 * intensity}px ${color}40`;
