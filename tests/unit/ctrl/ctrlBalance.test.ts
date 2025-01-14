import { getBalances } from "@src/ctrl/ctrlBalance";
import { ServiceBalance } from "@src/services/api/platform/serviceBalance";
import { Request, Response } from 'express';

describe('ctrlBalance', () => {
    it('devrait récupérer les soldes avec succès', async () => {
        const mockResponse = { status: 'success', message: 'Le solde en base de données a été récupéré avec succès.', data: [] };
        const mockRequest = {
            params: {}, 
            query: {},
            body: {},
            headers: {}, 
            method: '', 
            url: '', 
            get: jest.fn(),
            header: jest.fn(),
            accepts: jest.fn(),
            app: {},
            cookies: {},
            fresh: false,
            hostname: '',
            ip: '',
            ips: [],
            originalUrl: '',
            path: '',
            protocol: '',
            secure: false,
            stale: false,
            subdomains: [],
            xhr: false,
            route: {},
            socket: {},
            session: {},
        } as unknown as Request;
        const mockResponseObject = {
            json: jest.fn().mockResolvedValue(mockResponse), 
            status: jest.fn().mockReturnThis(),
            statusText: 'OK',
            headers: new Headers(), 
            ok: true,
            redirected: false,
            type: '',
            url: '',
            body: null,
            bodyUsed: false,
            clone: jest.fn(),
        } as unknown as Response;
        jest.spyOn(ServiceBalance, 'fetchDatabaseBalance').mockResolvedValue([]);

        await getBalances(mockRequest, mockResponseObject as Response);

        expect(mockResponseObject.status).toHaveBeenCalledWith(200);
        expect(mockResponseObject.json).toHaveBeenCalledWith(mockResponse);
    });

    it('devrait gérer les erreurs correctement', async () => {
        const mockRequest = {
            params: {}, 
            query: {},
            body: {},
            headers: {}, 
            method: '', 
            url: '', 
            get: jest.fn(),
            header: jest.fn(),
            accepts: jest.fn(),
            app: {},
            cookies: {},
            fresh: false,
            hostname: '',
            ip: '',
            ips: [],
            originalUrl: '',
            path: '',
            protocol: '',
            secure: false,
            stale: false,
            subdomains: [],
            xhr: false,
            route: {},
            socket: {},
            session: {},
        } as unknown as Request;
        const mockResponseObject = {
            json: jest.fn(), 
            status: jest.fn().mockReturnThis(),
            statusText: 'OK',
            headers: new Headers(), 
            ok: true,
            redirected: false,
            type: '',
            url: '',
            body: null,
            bodyUsed: false,
            clone: jest.fn(),
        } as unknown as Response;
        const mockError = new Error('Erreur de récupération des soldes');
        jest.spyOn(ServiceBalance, 'fetchDatabaseBalance').mockRejectedValue(mockError);

        await getBalances(mockRequest, mockResponseObject as Response);

        expect(mockResponseObject.status).toHaveBeenCalledWith(500);
        expect(mockResponseObject.json).toHaveBeenCalledWith({ status: 'error', message: 'Erreur de récupération des soldes' });
    });
}); 