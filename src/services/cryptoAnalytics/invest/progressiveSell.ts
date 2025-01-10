/**
 * Calculates amounts to sell based on a progressive selling strategy.
 * @param totalAmount - The total amount of crypto to sell.
 * @param sellPercentage - The percentage of the total amount to sell at each step.
 * @param steps - The number of steps to sell.
 * @returns An array of amounts to sell at each step.
 */
export function calculateProgressiveSell(totalAmount: number, sellPercentage: number, steps: number): number[] {
    const sellAmounts: number[] = [];
    const fixedAmount = totalAmount * (sellPercentage / 100); // Calculate fixed amount based on totalAmount and sellPercentage

    for (let i = 0; i < steps; i++) {
        sellAmounts.push(fixedAmount); // Push the fixed amount for each step
    }

    return sellAmounts;
}
