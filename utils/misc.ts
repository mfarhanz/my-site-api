export function formatSeconds(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.round(seconds / 60);
    return `${mins} min${mins > 1 ? 's' : ''}`;
}
