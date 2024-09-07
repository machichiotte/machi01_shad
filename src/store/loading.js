// src/store/loading.js
import { defineStore } from 'pinia';

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    showLoading: false,
  }),

  actions: {
    setLoading(payload) {
      this.showLoading = payload;
    },
  },
});