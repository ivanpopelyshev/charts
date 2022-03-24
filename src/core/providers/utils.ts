export function toNumberOrNaN(num: number | null | undefined) {
    if (num === null || num === undefined) {
        return NaN;
    }
    return +num;
}
