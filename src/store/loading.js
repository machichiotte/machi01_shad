/**
 * @typedef {Object} LoadingState
 * @property {boolean} showLoading
 */

/**
 * @typedef {Object} LoadingActions
 * @property {function(boolean): void} setLoading
 */

/**
 * @type {import('pinia').StoreDefinition<'loading', LoadingState, {}, LoadingActions>}
 */
export const useLoadingStore = defineStore('loading', {
  state: () => ({
    showLoading: false,
  }),

  actions: {
    /**
     * @param {boolean} payload
     */
    setLoading(payload) {
      this.showLoading = payload;
    },
  },
});