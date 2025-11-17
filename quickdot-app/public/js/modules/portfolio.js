/**
 * Portfolio Module
 * Handles portfolio tracking and analytics
 */

const PortfolioModule = {
  portfolioData: null,

  async init() {
    // Portfolio module initialized
  },

  async loadPortfolio() {
    await Promise.all([
      this.updatePortfolioOverview(),
      this.updatePortfolioAllocation(),
      this.updatePortfolioPerformance(),
    ]);
  },

  async updatePortfolioOverview() {
    try {
      const response = await API.getPortfolioOverview();
      
      if (response.success) {
        this.portfolioData = response.portfolio;
        
        const { totalValueUSD, priceData, totalDOT, walletCount } = response.portfolio;
        
        document.getElementById('portfolio-total').textContent = Utils.formatCurrency(totalValueUSD);
        document.getElementById('portfolio-dot').textContent = `${Utils.formatDOT(totalDOT)} DOT`;
        document.getElementById('portfolio-wallets').textContent = `${walletCount} ${walletCount === 1 ? 'wallet' : 'wallets'}`;
        
        const change = priceData.change24h || 0;
        const changeEl = document.getElementById('portfolio-24h');
        if (changeEl) {
          changeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
          changeEl.className = `stat-value ${change >= 0 ? 'positive' : 'negative'}`;
        }

        const portfolioChange = document.getElementById('portfolio-change');
        if (portfolioChange) {
          portfolioChange.innerHTML = `<i class="fas fa-arrow-${change >= 0 ? 'up' : 'down'}"></i> ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
          portfolioChange.className = `portfolio-change ${change >= 0 ? 'up' : 'down'}`;
        }
      }
    } catch (error) {
      console.error('Error loading portfolio overview:', error);
    }
  },

  async updatePortfolioAllocation() {
    try {
      const response = await API.getPortfolioAllocation();
      
      if (response.success) {
        const chartContainer = document.getElementById('allocation-chart');
        if (!chartContainer) return;

        if (response.allocation.length === 0) {
          chartContainer.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-chart-pie"></i>
              <p>No wallet allocation data</p>
            </div>
          `;
          return;
        }

        // Simple allocation list (could be enhanced with chart library)
        chartContainer.innerHTML = `
          <div class="allocation-list">
            ${response.allocation.map(item => `
              <div class="allocation-item">
                <div class="allocation-info">
                  <div class="allocation-name">${item.name}</div>
                  <div class="allocation-balance">${Utils.formatDOT(item.balance)} DOT</div>
                </div>
                <div class="allocation-percentage">${item.percentage}%</div>
                <div class="allocation-bar">
                  <div class="allocation-fill" style="width: ${item.percentage}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading allocation:', error);
    }
  },

  async updatePortfolioPerformance() {
    try {
      const response = await API.getPortfolioPerformance();
      
      if (response.success) {
        const perf = response.performance;
        
        const flowEl = document.getElementById('portfolio-flow');
        if (flowEl) {
          const netFlow = parseFloat(perf.netFlow);
          flowEl.textContent = `${netFlow >= 0 ? '+' : ''}${Utils.formatDOT(netFlow)} DOT`;
        }
      }
    } catch (error) {
      console.error('Error loading performance:', error);
    }
  },
};

window.PortfolioModule = PortfolioModule;
