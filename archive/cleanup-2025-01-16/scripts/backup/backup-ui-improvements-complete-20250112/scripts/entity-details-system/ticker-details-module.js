/**
 * Ticker Details Module - מודול פרטי טיקר
 * מציג פרטים מפורטים על טיקר ספציפי
 */

class TickerDetailsModule extends BaseEntityModule {
    constructor() {
        super('ticker');
        this.entityColor = '#dc3545';
        this.entityIcon = '📈';
        
        console.log('📈 מודול פרטי טיקר נוצר');
    }

    /**
     * טעינת נתוני טיקר מהשרת
     */
    async loadData(tickerId) {
        try {
            console.log(`📡 טוען נתוני טיקר #${tickerId}`);
            
            // טעינת נתוני הטיקר
            const tickerResponse = await fetch(`/api/tickers/${tickerId}`);
            if (!tickerResponse.ok) {
                throw new Error(`שגיאה בטעינת טיקר: ${tickerResponse.status}`);
            }
            
            const ticker = await tickerResponse.json();
            if (ticker.status !== 'success') {
                throw new Error(ticker.error?.message || 'שגיאה בטעינת טיקר');
            }
            
            const tickerData = ticker.data;
            
            // טעינת נתונים מקושרים (אופציונלי)
            let marketData = null;
            let tradesData = null;
            let alertsData = null;
            
            try {
                // טעינת נתוני שוק
                const marketResponse = await fetch(`/api/external-data/yahoo/quotes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        symbols: [tickerData.symbol]
                    })
                });
                
                if (marketResponse.ok) {
                    const marketResult = await marketResponse.json();
                    if (marketResult.status === 'success' && marketResult.data && marketResult.data.length > 0) {
                        marketData = marketResult.data[0];
                    }
                }
            } catch (error) {
                console.warn('⚠️ לא ניתן לטעון נתוני שוק:', error);
            }
            
            try {
                // טעינת טריידים (אם יש API)
                const tradesResponse = await fetch(`/api/trades/?ticker_id=${tickerId}`);
                if (tradesResponse.ok) {
                    const tradesResult = await tradesResponse.json();
                    if (tradesResult.status === 'success') {
                        tradesData = tradesResult.data;
                    }
                }
            } catch (error) {
                console.warn('⚠️ לא ניתן לטעון טריידים:', error);
            }
            
            try {
                // טעינת התראות (אם יש API)
                const alertsResponse = await fetch(`/api/alerts/?ticker_id=${tickerId}`);
                if (alertsResponse.ok) {
                    const alertsResult = await alertsResponse.json();
                    if (alertsResult.status === 'success') {
                        alertsData = alertsResult.data;
                    }
                }
            } catch (error) {
                console.warn('⚠️ לא ניתן לטעון התראות:', error);
            }
            
            console.log(`✅ נתוני טיקר #${tickerId} נטענו בהצלחה`);
            
            return {
                ticker: tickerData,
                marketData: marketData,
                trades: tradesData,
                alerts: alertsData
            };
            
        } catch (error) {
            console.error(`❌ שגיאה בטעינת נתוני טיקר #${tickerId}:`, error);
            throw error;
        }
    }

    /**
     * עיבוד התוכן לתצוגה
     */
    renderContent(data) {
        const { ticker, marketData, trades, alerts } = data;
        
        return `
            <div class="ticker-details">
                <!-- כותרת הטיקר -->
                <div class="ticker-header">
                    <div class="ticker-symbol">
                        <h3>${ticker.symbol}</h3>
                        <span class="ticker-name">${ticker.name || '-'}</span>
                    </div>
                    <div class="ticker-status">
                        ${this.createStatusBadge(ticker.status || 'active')}
                    </div>
                </div>
                
                <!-- מידע בסיסי -->
                <div class="ticker-info-section">
                    <h5><i class="fas fa-info-circle"></i> מידע בסיסי</h5>
                    <div class="info-grid">
                        ${this.createInfoRow('סימבול', ticker.symbol)}
                        ${this.createInfoRow('שם', ticker.name || '-')}
                        ${this.createInfoRow('סוג', this.translateTickerType(ticker.type))}
                        ${this.createInfoRow('סטטוס', this.createStatusBadge(ticker.status || 'active'))}
                        ${this.createInfoRow('תאריך יצירה', this.formatDate(ticker.created_at))}
                        ${this.createInfoRow('תאריך עדכון', this.formatDate(ticker.updated_at))}
                    </div>
                </div>
                
                <!-- נתוני שוק -->
                ${marketData ? this.renderMarketData(marketData) : ''}
                
                <!-- טריידים -->
                ${trades && trades.length > 0 ? this.renderTrades(trades) : ''}
                
                <!-- התראות -->
                ${alerts && alerts.length > 0 ? this.renderAlerts(alerts) : ''}
                
                <!-- הערות -->
                ${ticker.notes ? this.renderNotes(ticker.notes) : ''}
            </div>
        `;
    }

    /**
     * הצגת נתוני שוק
     */
    renderMarketData(marketData) {
        return `
            <div class="market-data-section">
                <h5><i class="fas fa-chart-line"></i> נתוני שוק</h5>
                <div class="market-data-grid">
                    <div class="market-data-item">
                        <label>מחיר נוכחי:</label>
                        <span class="price">${this.formatCurrency(marketData.price)}</span>
                    </div>
                    ${marketData.change_amount_day ? `
                        <div class="market-data-item">
                            <label>שינוי יומי:</label>
                            <span class="change ${marketData.change_amount_day >= 0 ? 'positive' : 'negative'}">
                                ${marketData.change_amount_day >= 0 ? '+' : ''}${this.formatCurrency(marketData.change_amount_day)}
                            </span>
                        </div>
                    ` : ''}
                    ${marketData.change_pct_day ? `
                        <div class="market-data-item">
                            <label>שינוי %:</label>
                            <span class="change ${marketData.change_pct_day >= 0 ? 'positive' : 'negative'}">
                                ${marketData.change_pct_day >= 0 ? '+' : ''}${this.formatPercentage(marketData.change_pct_day)}
                            </span>
                        </div>
                    ` : ''}
                    ${marketData.volume ? `
                        <div class="market-data-item">
                            <label>נפח מסחר:</label>
                            <span>${this.formatNumber(marketData.volume, 0)}</span>
                        </div>
                    ` : ''}
                    <div class="market-data-item">
                        <label>מטבע:</label>
                        <span>${marketData.currency || 'USD'}</span>
                    </div>
                    <div class="market-data-item">
                        <label>תאריך עדכון:</label>
                        <span>${this.formatDate(marketData.asof_utc)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * הצגת טריידים
     */
    renderTrades(trades) {
        const tradesHTML = trades.slice(0, 5).map(trade => `
            <div class="trade-item">
                <div class="trade-info">
                    <span class="trade-name">${trade.name || `טרייד #${trade.id}`}</span>
                    <span class="trade-status">${this.createStatusBadge(trade.status)}</span>
                </div>
                <div class="trade-details">
                    <small class="text-muted">
                        ${this.formatDate(trade.created_at)} | 
                        ${this.formatCurrency(trade.investment_amount || 0)}
                    </small>
                </div>
            </div>
        `).join('');
        
        return `
            <div class="trades-section">
                <h5><i class="fas fa-exchange-alt"></i> טריידים (${trades.length})</h5>
                <div class="trades-list">
                    ${tradesHTML}
                </div>
                ${trades.length > 5 ? `
                    <div class="text-center mt-2">
                        <small class="text-muted">ועוד ${trades.length - 5} טריידים...</small>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * הצגת התראות
     */
    renderAlerts(alerts) {
        const alertsHTML = alerts.slice(0, 5).map(alert => `
            <div class="alert-item">
                <div class="alert-info">
                    <span class="alert-name">${alert.name || `התראה #${alert.id}`}</span>
                    <span class="alert-status">${this.createStatusBadge(alert.status)}</span>
                </div>
                <div class="alert-details">
                    <small class="text-muted">
                        ${this.formatDate(alert.created_at)} | 
                        ${alert.condition || 'ללא תנאי'}
                    </small>
                </div>
            </div>
        `).join('');
        
        return `
            <div class="alerts-section">
                <h5><i class="fas fa-bell"></i> התראות (${alerts.length})</h5>
                <div class="alerts-list">
                    ${alertsHTML}
                </div>
                ${alerts.length > 5 ? `
                    <div class="text-center mt-2">
                        <small class="text-muted">ועוד ${alerts.length - 5} התראות...</small>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * הצגת הערות
     */
    renderNotes(notes) {
        return `
            <div class="notes-section">
                <h5><i class="fas fa-sticky-note"></i> הערות</h5>
                <div class="notes-content">
                    <p>${notes}</p>
                </div>
            </div>
        `;
    }

    /**
     * קבלת כותרת הטיקר
     */
    getEntityTitle() {
        if (this.currentData && this.currentData.ticker) {
            return `${this.entityIcon} ${this.currentData.ticker.symbol} - ${this.currentData.ticker.name || 'טיקר'}`;
        }
        return `${this.entityIcon} פרטי טיקר`;
    }

    /**
     * תרגום סוג טיקר
     */
    translateTickerType(type) {
        const translations = {
            'stock': 'מניה',
            'etf': 'קרן נסחרת',
            'bond': 'אג"ח',
            'crypto': 'מטבע דיגיטלי',
            'commodity': 'סחורה',
            'forex': 'מט"ח',
            'index': 'מדד'
        };
        
        return translations[type] || type || '-';
    }
}

console.log('📈 Ticker Details Module - נטען בהצלחה');
