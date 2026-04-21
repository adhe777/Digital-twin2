/**
 * Time Simulation Utility
 * Allows jumping forward in time for testing streaks.
 */

const OFFSET_KEY = 'time_sim_offset_ms';

export const getSimulatedDate = () => {
    const offset = Number(localStorage.getItem(OFFSET_KEY) || 0);
    return new Date(Date.now() + offset);
};

export const incrementSimulatedDay = () => {
    const currentOffset = Number(localStorage.getItem(OFFSET_KEY) || 0);
    const dayInMs = 24 * 60 * 60 * 1000;
    localStorage.setItem(OFFSET_KEY, currentOffset + dayInMs);
};

export const resetSimulatedTime = () => {
    localStorage.removeItem(OFFSET_KEY);
};

export const isSimulating = () => {
    return Number(localStorage.getItem(OFFSET_KEY) || 0) > 0;
};
