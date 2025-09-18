/**
 * Chart Renderer - עיבוד ותצוגת גרפים
 *
 * @description מחלקה לניהול עיבוד ותצוגת גרפי נתונים עם ציר כפול
 * @version 1.0.0
 * @since 2025-01-18
 */

class ChartRenderer {
    constructor(containerId = 'chartContainer') {
        this.containerId = containerId;
        this.chart = null;
        this.isInitialized = false;
        this.config = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: (context) => {
                            return new Date(context[0].parsed.x).toLocaleString('he-IL');
                        },
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (context.dataset.yAxisID === 'y1') {
                                return `${label}: ${value} בעיות`;
                            } else {
                                return `${label}: ${value.toFixed(1)}%`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        displayFormats: {
                            hour: 'HH:mm',
                            day: 'dd/MM',
                            month: 'MM/yyyy'
                        }
                    },
                    title: {
                        display: true,
                        text: 'זמן'
                    },
                    ticks: {
                        maxTicksLimit: 10
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'איכות קוד (%)'
                    },
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: (value) => `${value}%`
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'מספר בעיות'
                    },
                    min: 0,
                    max: 50,
                    ticks: {
                        precision: 0
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        };
    }

    /**
     * אתחול הגרף
     * @param {Array} initialData - נתונים ראשוניים
     * @returns {Promise<void>}
     */
    async initialize(initialData = []) {
        try {
            console.log('📊 מאתחל Chart Renderer...');

            const container = document.getElementById(this.containerId);
            if (!container) {
                throw new Error(`Container with id '${this.containerId}' not found`);
            }

            // בדיקת זמינות Chart.js
            if (typeof Chart === 'undefined') {
                throw new Error('Chart.js is not loaded');
            }

            // הכנת נתונים
            const chartData = this.prepareChartData(initialData);

            // יצירת קנבס אם לא קיים
            if (!container.querySelector('canvas')) {
                const canvas = document.createElement('canvas');
                canvas.id = `${this.containerId}_canvas`;
                container.appendChild(canvas);
            }

            const ctx = container.querySelector('canvas').getContext('2d');

            // יצירת הגרף
            this.chart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: this.config
            });

            this.isInitialized = true;
            console.log('✅ Chart Renderer אותחל בהצלחה');

        } catch (error) {
            console.error('❌ שגיאה באתחול Chart Renderer:', error);
            throw error;
        }
    }

    /**
     * הכנת נתונים לתצוגה בגרף
     * @param {Array} rawData - נתונים גולמיים
     * @returns {Object} נתונים מוכנים ל-Chart.js
     */
    prepareChartData(rawData) {
        if (!Array.isArray(rawData)) {
            rawData = [];
        }

        // מיון לפי timestamp
        const sortedData = rawData.sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        const labels = sortedData.map(item => new Date(item.timestamp));
        const qualityData = sortedData.map(item =>
            item.metrics?.qualityScore || 0
        );
        const errorData = sortedData.map(item =>
            (item.metrics?.errors || 0) + (item.metrics?.warnings || 0)
        );

        return {
            labels: labels,
            datasets: [
                {
                    label: 'איכות קוד',
                    data: qualityData,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    yAxisID: 'y',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'שגיאות ואזהרות',
                    data: errorData,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        };
    }

    /**
     * עדכון הגרף עם נתונים חדשים
     * @param {Array} newData - נתונים חדשים
     * @param {boolean} animate - האם להשתמש באנימציה
     * @returns {Promise<void>}
     */
    async updateChart(newData, animate = true) {
        if (!this.isInitialized || !this.chart) {
            throw new Error('Chart Renderer not initialized');
        }

        try {
            console.log('🔄 מעדכן גרף עם נתונים חדשים...');

            // הכנת נתונים חדשים
            const newChartData = this.prepareChartData(newData);

            // עדכון נתונים
            this.chart.data.labels = newChartData.labels;
            this.chart.data.datasets[0].data = newChartData.datasets[0].data;
            this.chart.data.datasets[1].data = newChartData.datasets[1].data;

            // עדכון צירים
            await this.updateAxes(newData);

            // עדכון גרף
            this.chart.update(animate ? 'active' : 'none');

            console.log('✅ גרף עודכן בהצלחה');

        } catch (error) {
            console.error('❌ שגיאה בעדכון גרף:', error);
            throw error;
        }
    }

    /**
     * עדכון צירים באופן דינמי
     * @param {Array} data - נתונים לעדכון צירים
     * @returns {Promise<void>}
     */
    async updateAxes(data) {
        if (!this.chart || !Array.isArray(data) || data.length === 0) {
            return;
        }

        try {
            // חישוב ערכי מקסימום לשגיאות
            const allErrors = data
                .map(item => (item.metrics?.errors || 0) + (item.metrics?.warnings || 0))
                .filter(n => !isNaN(n) && n >= 0);

            let maxErrors = 10; // ברירת מחדל
            if (allErrors.length > 0) {
                maxErrors = Math.max(...allErrors);
                maxErrors = Math.max(maxErrors, 10); // מינימום 10
                maxErrors = Math.ceil(maxErrors * 1.2); // 20% מרווח
            }

            // עדכון ציר y1 (שגיאות)
            if (this.chart.options.scales.y1) {
                this.chart.options.scales.y1.max = maxErrors;
                this.chart.options.scales.y1.ticks = {
                    ...this.chart.options.scales.y1.ticks,
                    stepSize: Math.max(1, Math.floor(maxErrors / 5))
                };
            }

            console.log(`📊 עודכן ציר שגיאות: max=${maxErrors}`);

        } catch (error) {
            console.warn('⚠️ שגיאה בעדכון צירים:', error);
        }
    }

    /**
     * הוספת נקודת נתונים בודדת
     * @param {Object} dataPoint - נקודת נתונים להוספה
     * @returns {Promise<void>}
     */
    async addDataPoint(dataPoint) {
        if (!this.isInitialized || !this.chart) {
            throw new Error('Chart Renderer not initialized');
        }

        try {
            const timestamp = new Date(dataPoint.timestamp || Date.now());
            const qualityValue = dataPoint.metrics?.qualityScore || 0;
            const errorValue = (dataPoint.metrics?.errors || 0) + (dataPoint.metrics?.warnings || 0);

            // הוספת לכל datasets
            this.chart.data.labels.push(timestamp);
            this.chart.data.datasets[0].data.push(qualityValue);
            this.chart.data.datasets[1].data.push(errorValue);

            // הגבלת מספר הנקודות (שמור 100 אחרונות)
            if (this.chart.data.labels.length > 100) {
                this.chart.data.labels.shift();
                this.chart.data.datasets[0].data.shift();
                this.chart.data.datasets[1].data.shift();
            }

            // עדכון צירים
            const allData = this.chart.data.labels.map((label, index) => ({
                timestamp: label,
                metrics: {
                    qualityScore: this.chart.data.datasets[0].data[index],
                    errors: errorValue,
                    warnings: 0
                }
            }));

            await this.updateAxes(allData);
            this.chart.update('active');

            console.log('✅ נקודת נתונים נוספה לגרף');

        } catch (error) {
            console.error('❌ שגיאה בהוספת נקודת נתונים:', error);
            throw error;
        }
    }

    /**
     * ניקוי הגרף
     * @returns {Promise<void>}
     */
    async clearChart() {
        if (!this.isInitialized || !this.chart) {
            throw new Error('Chart Renderer not initialized');
        }

        try {
            this.chart.data.labels = [];
            this.chart.data.datasets[0].data = [];
            this.chart.data.datasets[1].data = [];
            this.chart.update('none');

            console.log('🗑️ גרף נוקה');

        } catch (error) {
            console.error('❌ שגיאה בניקוי גרף:', error);
            throw error;
        }
    }

    /**
     * שינוי הגדרות גרף
     * @param {Object} newConfig - הגדרות חדשות
     * @returns {Promise<void>}
     */
    async updateConfig(newConfig) {
        if (!this.isInitialized || !this.chart) {
            throw new Error('Chart Renderer not initialized');
        }

        try {
            // עדכון הגדרות
            Object.assign(this.config, newConfig);
            Object.assign(this.chart.options, newConfig);

            this.chart.update('active');
            console.log('⚙️ הגדרות גרף עודכנו');

        } catch (error) {
            console.error('❌ שגיאה בעדכון הגדרות:', error);
            throw error;
        }
    }

    /**
     * ייצוא הגרף כתמונה
     * @param {string} format - פורמט (png, jpg, pdf)
     * @returns {Promise<string>} URL של התמונה
     */
    async exportChart(format = 'png') {
        if (!this.isInitialized || !this.chart) {
            throw new Error('Chart Renderer not initialized');
        }

        try {
            const canvas = this.chart.canvas;
            const dataURL = canvas.toDataURL(`image/${format}`);
            console.log(`📷 גרף יוצא כ-${format.toUpperCase()}`);
            return dataURL;

        } catch (error) {
            console.error('❌ שגיאה בייצוא גרף:', error);
            throw error;
        }
    }

    /**
     * קבלת סטטיסטיקות הגרף
     * @returns {Object} סטטיסטיקות
     */
    getChartStats() {
        if (!this.isInitialized || !this.chart) {
            return { initialized: false };
        }

        const stats = {
            initialized: true,
            dataPoints: this.chart.data.labels.length,
            qualityDataset: {
                label: this.chart.data.datasets[0].label,
                points: this.chart.data.datasets[0].data.length,
                min: Math.min(...this.chart.data.datasets[0].data),
                max: Math.max(...this.chart.data.datasets[0].data),
                avg: this.chart.data.datasets[0].data.reduce((a, b) => a + b, 0) / this.chart.data.datasets[0].data.length
            },
            errorDataset: {
                label: this.chart.data.datasets[1].label,
                points: this.chart.data.datasets[1].data.length,
                min: Math.min(...this.chart.data.datasets[1].data),
                max: Math.max(...this.chart.data.datasets[1].data),
                avg: this.chart.data.datasets[1].data.reduce((a, b) => a + b, 0) / this.chart.data.datasets[1].data.length
            },
            timeRange: {
                start: this.chart.data.labels.length > 0 ? this.chart.data.labels[0] : null,
                end: this.chart.data.labels.length > 0 ? this.chart.data.labels[this.chart.data.labels.length - 1] : null
            }
        };

        return stats;
    }

    /**
     * הרס הגרף ופינוי זיכרון
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        this.isInitialized = false;
        console.log('💥 Chart Renderer הושמד');
    }

    /**
     * בדיקת אם הגרף מאותחל
     * @returns {boolean} סטטוס אתחול
     */
    isReady() {
        return this.isInitialized && this.chart !== null;
    }
}

// ייצוא למערכת גלובלית
if (typeof window !== 'undefined') {
    window.ChartRenderer = ChartRenderer;
}

console.log('📊 ChartRenderer loaded successfully');

