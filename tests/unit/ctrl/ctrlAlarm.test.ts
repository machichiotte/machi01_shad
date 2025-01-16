import { setAlarm } from '@ctrl/ctrlAlarm'
import { Request, Response } from 'express'
import { ServiceAlarm } from '@services/serviceAlarm'
import { ServiceTicker } from '@services/api/platform/serviceTicker'

jest.mock('@services/serviceAlarm')
jest.mock('@services/api/platform/serviceTicker', () => ({
  ServiceTicker: {
    getAllTickersBySymbolFromPlatform: jest.fn(),
  },
}));

describe('setAlarm', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockStatus: jest.Mock
  let mockJson: jest.Mock

  beforeEach(() => {
    mockRequest = {
      body: {
        platform: 'Binance',
        base: 'BTC',
        price: 30000
      }
    }

    mockJson = jest.fn()
    mockStatus = jest.fn().mockReturnValue({ json: mockJson })

    mockResponse = {
      status: mockStatus
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create an alarm successfully', async () => {
    const mockPrice: number = 29000;
    
    // Simuler la réponse du service Ticker pour obtenir un prix valide
    (ServiceTicker.getAllTickersBySymbolFromPlatform as jest.Mock)
      .mockResolvedValueOnce([{ last: mockPrice }]); // Un prix valide est retourné
  
    // Mock la création de l'alarme
    (ServiceAlarm.createAlarm as jest.Mock).mockResolvedValue('mockId'); // Simulation de la création d'alarme avec un ID fictif
  
    // Appel de la fonction setAlarm
    await setAlarm(mockRequest as Request, mockResponse as Response);
  
    // Vérification que la méthode getAllTickersBySymbolFromPlatform a été appelée avec les bons arguments
    expect(ServiceTicker.getAllTickersBySymbolFromPlatform).toHaveBeenCalledWith('Binance', 'BTC/USDT');
  
    // Vérification que la méthode status(200) a bien été appelée
    expect(mockStatus).toHaveBeenCalledWith(200);
  
    // Vérification que la réponse json contient bien le message attendu
    expect(mockJson).toHaveBeenCalledWith({
      status: 'success',
      message: 'Alarme enregistrée pour Binance BTC 30000 avec succès.',
      data: 'mockId'
    });
  });
  

  it('should attempt to find the price using stablecoins if no price is found initially', async () => {
    // Simuler un cas où il n'y a pas de prix initial
    (ServiceTicker.getAllTickersBySymbolFromPlatform as jest.Mock)
      .mockResolvedValueOnce([]) // Premier appel sans prix
      .mockResolvedValueOnce([{ last: -1 }]) // Deuxième appel sans prix
      .mockResolvedValueOnce([{ last: 29000 }]); // Troisième appel avec prix trouvé
  
    // Mock la création de l'alarme
    (ServiceAlarm.createAlarm as jest.Mock).mockResolvedValue('mockId');
  
    await setAlarm(mockRequest as Request, mockResponse as Response);
  
    // Vérification des appels
    expect(ServiceTicker.getAllTickersBySymbolFromPlatform).toHaveBeenCalledWith('Binance', 'BTC/USDT');
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      status: 'success',
      message: 'Alarme enregistrée pour Binance BTC 30000 avec succès.',
      data: 'mockId'
    });
  });
  
  

  it('should return an error if no valid price is found for the symbol or stablecoins', async () => {
    // Simuler un cas où aucun prix n'est trouvé
    (ServiceTicker.getAllTickersBySymbolFromPlatform as jest.Mock).mockResolvedValue([])

    await setAlarm(mockRequest as Request, mockResponse as Response)

    expect(mockStatus).toHaveBeenCalledWith(500)
    expect(mockJson).toHaveBeenCalledWith({
      status: 'error',
      message: "Aucun prix valide trouvé pour BTC."
    })
  })

  it('should return an error if there is an issue during alarm creation', async () => {
    // Simuler une erreur dans le service ticker (par exemple, un problème de réseau)
    (ServiceTicker.getAllTickersBySymbolFromPlatform as jest.Mock).mockRejectedValue(new Error('Erreur de connexion'))
  
    await setAlarm(mockRequest as Request, mockResponse as Response)
  
    expect(mockStatus).toHaveBeenCalledWith(500)
    expect(mockJson).toHaveBeenCalledWith({
      status: 'error',
      message: 'Erreur lors de la création de l\'alarme.'
    })
  })
})
