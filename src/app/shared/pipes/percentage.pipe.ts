import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'percentage',
    standalone: true
})
export class PercentagePipe implements PipeTransform {
    /**
     * Transforms a number into a percentage string.
     * @param value The value to transform (decimal or numerator).
     * @param total Optional total value if the first parameter is a numerator.
     * @param decimals Number of decimal places (default is 0).
     * @returns A formatted percentage string.
     */
    transform(value: number | null | undefined, total?: number, decimals: number = 0): string {
        if (value === null || value === undefined || isNaN(value)) {
            return '';
        }

        let percentageValue: number;
        if (total !== undefined && total !== 0) {
            percentageValue = (value / total) * 100;
        } else {
            // If no total is provided, assume value is already a decimal (e.g., 0.85 -> 85%)
            percentageValue = value * 100;
        }

        return `${percentageValue.toFixed(decimals)}%`;
    }
}
