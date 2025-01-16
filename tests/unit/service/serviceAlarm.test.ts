// tests/unit/service/serviceAlarm.test.ts
import { ServiceAlarm } from '@services/serviceAlarm'
import { RepoAlarm } from '@repo/repoAlarm'
import { RepoTicker } from '@repo/repoTicker'
import { DbAlarm } from '@typ/database'
import { ObjectId } from 'mongodb'

// Mock des dépendances
jest.mock('@repo/repoAlarm')
jest.mock('@repo/repoTicker')

describe('ServiceAlarm', () => {
  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {}) // Mock console.info
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createAlarm', () => {
    it('should create an alarm and return the ID', async () => {
      const alarmData = {
        platform: 'Binance',
        base: 'BTC',
        price: 30000,
        oldPrice: 29000,
        status: 'open',
        createdAt: new Date()
      }

      const mockId = new ObjectId()
      ;(RepoAlarm.createAlarm as jest.Mock).mockResolvedValue(
        mockId.toHexString()
      )

      const result = await ServiceAlarm.createAlarm(alarmData)
      expect(RepoAlarm.createAlarm).toHaveBeenCalledWith(
        expect.objectContaining({ ...alarmData, _id: expect.any(ObjectId) })
      )
      expect(result).toBe(mockId.toHexString())
    })
  })

  describe('getAlarms', () => {
    it('should fetch alarms with a filter', async () => {
      const mockAlarms: DbAlarm[] = [
        {
          _id: new ObjectId(),
          platform: 'Binance',
          base: 'BTC',
          price: 30000,
          oldPrice: 29000,
          status: 'open',
          createdAt: new Date()
        }
      ]
      ;(RepoAlarm.fetchAlarms as jest.Mock).mockResolvedValue(mockAlarms)

      const result = await ServiceAlarm.getAlarms({ status: 'open' })
      expect(RepoAlarm.fetchAlarms).toHaveBeenCalledWith({ status: 'open' })
      expect(result).toEqual(mockAlarms)
    })
  })

  describe('updateAlarm', () => {
    it('should call RepoAlarm.updateAlarm with correct parameters', async () => {
      const mockId = new ObjectId()
      const updates = { status: 'closed' }

      await ServiceAlarm.updateAlarm(mockId.toHexString(), updates)
      expect(RepoAlarm.updateAlarm).toHaveBeenCalledWith(
        mockId.toHexString(),
        updates
      )
    })
  })

  describe('checkAndTriggerAlarms', () => {
    it('should trigger alarms and update their status if the price decreases below the target', async () => {
      const mockId = new ObjectId()
      const mockAlarms: DbAlarm[] = [
        {
          _id: mockId,
          platform: 'Binance',
          base: 'BTC',
          price: 30000,
          oldPrice: 31000,
          status: 'open',
          createdAt: new Date()
        }
      ]
      const mockTickers = [
        {
          symbol: 'BTC/USDT',
          last: 29900
        }
      ]

      ;(RepoAlarm.fetchAlarms as jest.Mock).mockResolvedValue(mockAlarms)
      ;(RepoTicker.fetchAll as jest.Mock).mockResolvedValue(mockTickers)
      ;(RepoAlarm.updateAlarm as jest.Mock).mockResolvedValue(undefined)

      await ServiceAlarm.checkAndTriggerAlarms()

      expect(RepoAlarm.fetchAlarms).toHaveBeenCalled()
      expect(RepoTicker.fetchAll).toHaveBeenCalled()
      expect(RepoAlarm.updateAlarm).toHaveBeenCalledWith(mockId.toHexString(), {
        status: 'closed'
      })
      expect(console.info).toHaveBeenCalledWith(
        'Notification: Alarme déclenchée pour BTC à 30000'
      )
    })

    it('should not trigger alarms if conditions are not met', async () => {
        const mockId = new ObjectId();
        const mockAlarms: DbAlarm[] = [
          {
            _id: mockId,
            platform: 'Binance',
            base: 'BTC',
            price: 30000,
            oldPrice: 29000,
            status: 'open',
            createdAt: new Date(),
          },
        ];
        const mockTickers = [
          {
            symbol: 'BTC/USDT',
            last: 28000, // Le prix est au-dessous du seuil cible, donc aucune alarme ne doit être déclenchée
          },
        ];
      
        (RepoAlarm.fetchAlarms as jest.Mock).mockResolvedValue(mockAlarms);
        (RepoTicker.fetchAll as jest.Mock).mockResolvedValue(mockTickers);
        (RepoAlarm.updateAlarm as jest.Mock).mockResolvedValue(undefined);
      
        await ServiceAlarm.checkAndTriggerAlarms();
      
        expect(RepoAlarm.fetchAlarms).toHaveBeenCalled();
        expect(RepoTicker.fetchAll).toHaveBeenCalled();
        // Vérifie que "updateAlarm" n'a pas été appelé
        expect(RepoAlarm.updateAlarm).not.toHaveBeenCalled();
      
        // Vérifie que "console.info" n'a pas été appelé
        expect(console.info).not.toHaveBeenCalled();
      });
      
  })
})