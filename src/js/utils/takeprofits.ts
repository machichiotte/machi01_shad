import { TakeProfits, LiveData } from "../../types/responseData";

// src/utils/takeProfit.ts
export const calculateTakeProfitProgress = (takeProfits: TakeProfits, liveData: LiveData): number => {
    if (!takeProfits || !liveData) return 0;

    const recoveryTarget = takeProfits.tp1.price * takeProfits.tp1.amount;
    const futurWallet = liveData.balance * takeProfits.tp1.price;
    const minProgress = futurWallet - recoveryTarget;
    const currentPossession = liveData.currentPossession;

    const progressPercentage = ((currentPossession - minProgress) / (futurWallet - recoveryTarget)) * 100;

    return Math.min(Math.max(progressPercentage, 0), 100); // Entre 0% et 100%
};
