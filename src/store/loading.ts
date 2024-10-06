import { defineStore } from 'pinia';

interface LoadingState {
  showLoading: boolean;
}

interface LoadingActions {
  setLoading(payload: boolean): void;
}

export const useLoadingStore = defineStore('loading', {
  state: (): LoadingState => ({
    showLoading: false,
  }),

  actions: {
    setLoading(payload: boolean) {
      this.showLoading = payload;
    },
  },
});