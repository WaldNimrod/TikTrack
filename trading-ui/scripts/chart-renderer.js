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

               // Chart.js date adapter is loaded via script tag in HTML

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
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: (context) => {
                            const date = new Date(context[0].parsed.x);
                            const formattedDate = date.toLocaleString('he-IL', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            });
                            return `📅 ${formattedDate}`;
                        },
                        beforeBody: (context) => {
                            // הצגת מידע נוסף לפני הגרף
                            const dataIndex = context[0].dataIndex;
                            const allData = context[0].chart.data;
                            if (allData.datasets && allData.datasets.length > 1) {
                                const quality = allData.datasets[0].data[dataIndex] || 0;
                                const errors = allData.datasets[1].data[dataIndex] || 0;
                                const status = quality >= 90 ? '🟢 מצוין' :
                                             quality >= 75 ? '🟡 טוב' :
                                             quality >= 60 ? '🟠 בסדר' : '🔴 דורש שיפור';
                                return `📊 סטטוס: ${status}`;
                            }
                            return '';
                        },
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;

                            if (context.dataset.yAxisID === 'y1') {
                                const errorCount = value;
                                const severity = errorCount === 0 ? '✅ ללא בעיות' :
                                               errorCount <= 5 ? '⚠️ מעט בעיות' :
                                               errorCount <= 15 ? '🟡 בעיות בינוניות' : '🔴 הרבה בעיות';
                                return `${label}: ${errorCount} בעיות (${severity})`;
                            } else {
                                const qualityPercent = value.toFixed(1);
                                const qualityLevel = value >= 90 ? 'A' :
                                                   value >= 80 ? 'B' :
                                                   value >= 70 ? 'C' :
                                                   value >= 60 ? 'D' : 'F';
                                return `${label}: ${qualityPercent}% (דרגה ${qualityLevel})`;
                            }
                        },
                        afterBody: (context) => {
                            // הצגת מידע נוסף לאחר הגרף
                            const lines = [];
                            const dataIndex = context[0].dataIndex;
                            const allData = context[0].chart.data;

                            if (allData.datasets && allData.datasets.length > 1) {
                                const quality = allData.datasets[0].data[dataIndex] || 0;
                                const errors = allData.datasets[1].data[dataIndex] || 0;

                                // חישוב סטטיסטיקות נוספות
                                lines.push(`🔍 פירוט נתונים:`);
                                lines.push(`   • איכות קוד: ${quality.toFixed(1)}%`);
                                lines.push(`   • מספר בעיות: ${errors}`);

                                if (errors > 0) {
                                    const avgErrors = allData.datasets[1].data.reduce((a, b) => a + b, 0) / allData.datasets[1].data.length;
                                    const trend = errors > avgErrors ? '📈 מעל הממוצע' : '📉 מתחת לממוצע';
                                    lines.push(`   • ${trend} (${avgErrors.toFixed(1)} ממוצע)`);
                                }
                            }

                            return lines;
                        },
                        footer: (context) => {
                            return '💡 לחץ לחקירה נוספת';
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
                duration: function(context) {
                    // אנימציה מהירה לנתונים מעטים, איטית לנתונים רבים
                    const dataPoints = context.chart.data.labels.length;
                    if (dataPoints < 20) return 1000; // אנימציה מלאה
                    if (dataPoints < 50) return 500;  // אנימציה בינונית
                    return 0; // ללא אנימציה לנתונים רבים
                },
                easing: 'easeInOutQuart',
                onProgress: function(context) {
                    // עדכון סטטוס אנימציה
                    const progress = Math.round(context.currentStep / context.numSteps * 100);
                    if (progress % 25 === 0) { // עדכון כל 25%
                        console.log(`📊 אנימציה: ${progress}%`);
                    }
                }
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
            console.log('📊 מאתחל Chart Renderer...', this.containerId, 'with data:', initialData);

            const container = document.getElementById(this.containerId);
            if (!container) {
                throw new Error(`Container with id '${this.containerId}' not found`);
            }

            // בדיקת זמינות Chart.js - המתנה אם צריך
            if (typeof Chart === 'undefined') {
                console.log('⏳ ממתין לטעינת Chart.js...');
                await new Promise((resolve) => {
                    const checkChart = () => {
                        if (typeof Chart !== 'undefined') {
                            resolve();
                        } else {
                            setTimeout(checkChart, 100);
                        }
                    };
                    checkChart();
                });
            }

            // הכנת נתונים
            const chartData = this.prepareChartData(initialData);

            // מציאת או יצירת קנבס
            let canvas = container.querySelector('canvas');
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = `${this.containerId}_canvas`;
                container.appendChild(canvas);
            }

            const ctx = canvas.getContext('2d');

            // בדיקת מימדי קנבס
            console.log('📐 מימדי קנבס:', canvas.width, 'x', canvas.height);
            console.log('📊 יוצר גרף עם נתונים:', chartData);

            // הסתרת הודעת טעינה
            const statusDiv = document.getElementById('chartStatus');
            if (statusDiv) {
                statusDiv.style.display = 'none';
            }

            // השמדת גרף קיים אם קיים
            if (this.chart) {
                console.log('🗑️ משמיד גרף קיים...');
                this.chart.destroy();
                this.chart = null;
            }

            // בדיקה אם יש גרף קיים על הקנבס
            if (Chart.getChart(canvas)) {
                console.log('🗑️ משמיד גרף קיים מהקנבס...');
                Chart.getChart(canvas).destroy();
            }

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

        // אם אין נתונים, יצירת נתונים לדוגמה
        if (rawData.length === 0) {
            console.log('📊 יוצר נתונים לדוגמה לגרף...');
            const now = new Date();
            rawData = [
                {
                    timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
                    metrics: { 
                        qualityScore: 85, 
                        errors: 12, 
                        warnings: 8,
                        advancedMetrics: {
                            complexityScore: 3.2,
                            maintainabilityScore: 78,
                            securityScore: 92,
                            performanceScore: 85,
                            errorRate: 2.4,
                            warningRate: 1.6,
                            issuesPerFile: 4.0
                        }
                    }
                },
                {
                    timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
                    metrics: { 
                        qualityScore: 78, 
                        errors: 18, 
                        warnings: 15,
                        advancedMetrics: {
                            complexityScore: 4.1,
                            maintainabilityScore: 65,
                            securityScore: 88,
                            performanceScore: 72,
                            errorRate: 3.6,
                            warningRate: 3.0,
                            issuesPerFile: 6.6
                        }
                    }
                },
                {
                    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                    metrics: { 
                        qualityScore: 92, 
                        errors: 5, 
                        warnings: 3,
                        advancedMetrics: {
                            complexityScore: 2.8,
                            maintainabilityScore: 88,
                            securityScore: 95,
                            performanceScore: 92,
                            errorRate: 1.0,
                            warningRate: 0.6,
                            issuesPerFile: 1.6
                        }
                    }
                },
                {
                    timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
                    metrics: { 
                        qualityScore: 88, 
                        errors: 8, 
                        warnings: 6,
                        advancedMetrics: {
                            complexityScore: 3.5,
                            maintainabilityScore: 82,
                            securityScore: 90,
                            performanceScore: 88,
                            errorRate: 1.6,
                            warningRate: 1.2,
                            issuesPerFile: 2.8
                        }
                    }
                },
                {
                    timestamp: now.toISOString(),
                    metrics: { 
                        qualityScore: 95, 
                        errors: 2, 
                        warnings: 1,
                        advancedMetrics: {
                            complexityScore: 2.1,
                            maintainabilityScore: 95,
                            securityScore: 98,
                            performanceScore: 96,
                            errorRate: 0.4,
                            warningRate: 0.2,
                            issuesPerFile: 0.6
                        }
                    }
                }
            ];
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
            item.metrics?.errors || 0
        );
        const warningData = sortedData.map(item =>
            item.metrics?.warnings || 0
        );
        const complexityData = sortedData.map(item =>
            item.metrics?.advancedMetrics?.complexityScore || 0
        );
        const maintainabilityData = sortedData.map(item =>
            item.metrics?.advancedMetrics?.maintainabilityScore || 0
        );
        const securityData = sortedData.map(item =>
            item.metrics?.advancedMetrics?.securityScore || 0
        );
        const performanceData = sortedData.map(item =>
            item.metrics?.advancedMetrics?.performanceScore || 0
        );

        return {
            labels: labels,
            datasets: [
                {
                    label: 'איכות קוד (%)',
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
                    label: 'שגיאות',
                    data: errorData,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 5
                },
                {
                    label: 'אזהרות',
                    data: warningData,
                    borderColor: 'rgb(255, 206, 86)',
                    backgroundColor: 'rgba(255, 206, 86, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 5
                },
                {
                    label: 'מורכבות',
                    data: complexityData,
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.1)',
                    yAxisID: 'y2',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 2,
                    pointHoverRadius: 4
                },
                {
                    label: 'תחזוקה (%)',
                    data: maintainabilityData,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    yAxisID: 'y',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 2,
                    pointHoverRadius: 4
                },
                {
                    label: 'אבטחה (%)',
                    data: securityData,
                    borderColor: 'rgb(255, 159, 64)',
                    backgroundColor: 'rgba(255, 159, 64, 0.1)',
                    yAxisID: 'y',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 2,
                    pointHoverRadius: 4
                },
                {
                    label: 'ביצועים (%)',
                    data: performanceData,
                    borderColor: 'rgb(201, 203, 207)',
                    backgroundColor: 'rgba(201, 203, 207, 0.1)',
                    yAxisID: 'y',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 2,
                    pointHoverRadius: 4
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
            this.chart.data.datasets[2].data = newChartData.datasets[2].data;
            this.chart.data.datasets[3].data = newChartData.datasets[3].data;
            this.chart.data.datasets[4].data = newChartData.datasets[4].data;
            this.chart.data.datasets[5].data = newChartData.datasets[5].data;
            this.chart.data.datasets[6].data = newChartData.datasets[6].data;

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
            // חישוב ערכי מקסימום לשגיאות ואזהרות
            const allErrors = data
                .map(item => item.metrics?.errors || 0)
                .filter(n => !isNaN(n) && n >= 0);
            const allWarnings = data
                .map(item => item.metrics?.warnings || 0)
                .filter(n => !isNaN(n) && n >= 0);
            const allIssues = [...allErrors, ...allWarnings];

            let maxIssues = 10; // ברירת מחדל
            if (allIssues.length > 0) {
                maxIssues = Math.max(...allIssues);
                maxIssues = Math.max(maxIssues, 10); // מינימום 10
                maxIssues = Math.ceil(maxIssues * 1.2); // 20% מרווח
            }

            // עדכון ציר y1 (שגיאות ואזהרות)
            if (this.chart.options.scales.y1) {
                this.chart.options.scales.y1.max = maxIssues;
                this.chart.options.scales.y1.ticks = {
                    ...this.chart.options.scales.y1.ticks,
                    stepSize: Math.max(1, Math.floor(maxIssues / 5))
                };
            }

            // חישוב ערכי מקסימום למורכבות
            const allComplexity = data
                .map(item => item.metrics?.advancedMetrics?.complexityScore || 0)
                .filter(n => !isNaN(n) && n >= 0);

            let maxComplexity = 10; // ברירת מחדל
            if (allComplexity.length > 0) {
                maxComplexity = Math.max(...allComplexity);
                maxComplexity = Math.max(maxComplexity, 5); // מינימום 5
                maxComplexity = Math.ceil(maxComplexity * 1.2); // 20% מרווח
            }

            // עדכון ציר y2 (מורכבות)
            if (this.chart.options.scales.y2) {
                this.chart.options.scales.y2.max = maxComplexity;
                this.chart.options.scales.y2.ticks = {
                    ...this.chart.options.scales.y2.ticks,
                    stepSize: Math.max(0.5, Math.floor(maxComplexity / 5))
                };
            }

            console.log(`📊 עודכן צירים: שגיאות/אזהרות max=${maxIssues}, מורכבות max=${maxComplexity}`);

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
            this.chart.data.datasets[2].data = [];
            this.chart.data.datasets[3].data = [];
            this.chart.data.datasets[4].data = [];
            this.chart.data.datasets[5].data = [];
            this.chart.data.datasets[6].data = [];
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

