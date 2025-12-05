// src/services/websocketService.ts
import { useLiveDataStore } from '../store/liveDataStore'; // On importe juste la fonction

// Pas besoin d'importer un type qui n'existe pas

class WebsocketService {
  private socket: WebSocket | null = null;
  private url: string;
  // On ne déclare PAS le store ici
  private _store: ReturnType<typeof useLiveDataStore> | null = null; // Optionnel mais mieux: On utilise ReturnType pour obtenir le type automatiquement

  constructor(url: string) {
    this.url = url;
  }

  // Le getter pour accéder au store seulement quand nécessaire
  private get store() { // Pas besoin de typer explicitement le retour ici, TypeScript s'en charge
      if (!this._store) {
          // On récupère le store la première fois qu'on y accède
          this._store = useLiveDataStore();
      }
      return this._store;
  }

  connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    this.socket = new WebSocket(this.url);

    this.socket.addEventListener('open', () => {
      console.log('WebSocket connected');
    });

    this.socket.addEventListener('message', evt => {
      try {
        const data = JSON.parse(evt.data);

        if (Array.isArray(data)) {
          // On accède au store via le getter
          data.forEach(t => this.store.updateTicker(t));
        } else if (data && typeof data === 'object') {
           // On accède au store via le getter
          this.store.updateTicker(data);
        }
      } catch (_) {
        console.warn('Invalid WS payload', evt.data);
      }
    });

    this.socket.addEventListener('error', e => {
      console.error('WebSocket error', e);
      this.disconnect();
      // optional: retry logic here
    });

    this.socket.addEventListener('close', () => {
      console.log('WebSocket closed');
      this.socket = null;
      // optional: auto-reconnect timer
    });
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.close(1000, 'Manual disconnect');
    this.socket = null;
  }
}

// L'export du singleton reste identique
const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:10000';
export const websocketService = new WebsocketService(wsUrl);