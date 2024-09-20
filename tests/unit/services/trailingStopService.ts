import { TrailingStopService } from '@services/trailingStopService';
import { BalanceService } from '@services/balanceService';
import { ShadService } from '@services/shadService';
import { TickerService } from '@services/tickerService';
import { OrderMarketService } from '@services/orderMarketService';
import { MappedBalance, HighestPrice } from '@models/dbTypes';
import { handleServiceError } from '@utils/errorUtil';

jest.mock('@services/balanceService');
jest.mock('@services/shadService');
jest.mock('@services/tickerService');
jest.mock('@services/orderMarketService');
jest.mock('@utils/errorUtil');

describe('TrailingStopService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('handleTrailingStopHedge', () => {
        it('devrait gérer le trailing stop hedge pour les actifs sélectionnés', async () => {
            const mockBalances: Partial<MappedBalance>[] = [
                { base: 'BTC', balance: 1, platform: 'binance' },
                { base: 'ETH', balance: 10, platform: 'kucoin' }
            ];
            const mockHighestPrices: HighestPrice[] = [
                { asset: 'BTC', platform: 'binance', highestPrice: 50000 },
                { asset: 'ETH', platform: 'kucoin', highestPrice: 3000 }
            ];


            (BalanceService.fetchDatabaseBalances as jest.Mock).mockResolvedValue(mockBalances);
            (ShadService.getHighestPrices as jest.Mock).mockResolvedValue(mockHighestPrices);
            (TickerService.fetchCurrentTickers as jest.Mock).mockResolvedValue([
                { symbol: 'BTC/USDT', last: 55000 },
                { symbol: 'ETH/USDT', last: 3500 }
            ]);
            (OrderMarketService.cancelAllOrdersByBunch as jest.Mock).mockResolvedValue(undefined);
            (OrderMarketService.createOrUpdateStopLossOrder as jest.Mock).mockResolvedValue(undefined);
            (ShadService.updateHighestPrice as jest.Mock).mockResolvedValue(undefined);

            const result = await TrailingStopService.handleTrailingStopHedge([
                { base: 'BTC', platform: 'binance' },
                { base: 'ETH', platform: 'kucoin' }
            ]);

            expect(result).toEqual([
                { base: 'BTC', platform: 'binance' },
                { base: 'ETH', platform: 'kucoin' }
            ]);
            expect(BalanceService.fetchDatabaseBalances).toHaveBeenCalled();
            expect(ShadService.getHighestPrices).toHaveBeenCalled();
            expect(TickerService.fetchCurrentTickers).toHaveBeenCalledWith('binance');
            expect(TickerService.fetchCurrentTickers).toHaveBeenCalledWith('kucoin');
            expect(OrderMarketService.cancelAllOrdersByBunch).toHaveBeenCalledTimes(2);
            expect(OrderMarketService.createOrUpdateStopLossOrder).toHaveBeenCalledTimes(2);
            expect(ShadService.updateHighestPrice).toHaveBeenCalledTimes(2);
        });

        it('devrait gérer les erreurs correctement', async () => {
            const mockError = new Error('Test error');
            (BalanceService.fetchDatabaseBalances as jest.Mock).mockRejectedValue(mockError);

            await TrailingStopService.handleTrailingStopHedge();

            expect(handleServiceError).toHaveBeenCalledWith(mockError, 'handleTrailingStopHedge', 'Error handling trailing stop hedge');
        });
    });

    // Ajoutez d'autres tests pour les méthodes privées si nécessaire
});