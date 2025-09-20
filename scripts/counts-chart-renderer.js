/**
 * Counts Chart Renderer - גרף ספירות
 *
 * @description מחלקה לניהול גרף ספירות עם סדרות ספירות בלבד
 * @version 1.0.0
 * @since 2025-01-20
 */

class CountsChartRenderer {
    constructor(containerId = 'countsChartContainer') {
        this.containerId = containerId;
        this.chart = null;
        this.isInitialized = false;

        this.config = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            family: 'Noto Sans Hebrew, Arial, sans-serif'
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 99, 132, 1)',
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
                            const dataIndex = context[0].dataIndex;
                            const totalFiles = this.chart.data.datasets[0].data[dataIndex] || 0;
                            const errors = this.chart.data.datasets[1].data[dataIndex] || 0;
                            const warnings = this.chart.data.datasets[2].data[dataIndex] || 0;
                            return `📊 קבצים: ${totalFiles}, שגיאות: ${errors}, אזהרות: ${warnings}`;
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
                            day: 'MM/dd'
                        }
                    },
                    title: {
                        display: true,
                        text: 'זמן',
                        font: {
                            size: 14,
                            family: 'Noto Sans Hebrew, Arial, sans-serif'
                        }
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 0,
                    title: {
                        display: true,
                        text: 'כמות',
                        font: {
                            size: 14,
                            family: 'Noto Sans Hebrew, Arial, sans-serif'
                        }
                    },
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        };
    }

    async initialize() {
        try {
            const container = document.getElementById(this.containerId);
            if (!container) {
                throw new Error(`Container ${this.containerId} not found`);
            }

            // Create canvas element inside the container
            const canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            container.appendChild(canvas);

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get 2D context');
            }

            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'קבצים כולל',
                            data: [],
                            borderColor: 'rgb(54, 162, 235)',
                            backgroundColor: 'rgba(54, 162, 235, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: 'rgb(54, 162, 235)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        },
                        {
                            label: 'שגיאות',
                            data: [],
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: 'rgb(255, 99, 132)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        },
                        {
                            label: 'אזהרות',
                            data: [],
                            borderColor: 'rgb(255, 205, 86)',
                            backgroundColor: 'rgba(255, 205, 86, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: 'rgb(255, 205, 86)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        },
                        {
                            label: 'מורכבות',
                            data: [],
                            borderColor: 'rgb(153, 102, 255)',
                            backgroundColor: 'rgba(153, 102, 255, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: 'rgb(153, 102, 255)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }
                    ]
                },
                options: this.config
            });

            this.isInitialized = true;
            console.log('✅ Counts chart initialized successfully');
        } catch (error) {
            console.error('❌ Counts chart initialization error:', error);
            throw error;
        }
    }

    updateChart(data) {
        if (!this.chart || !Array.isArray(data) || data.length === 0) {
            return;
        }

        try {
            const labels = data.map(item => new Date(item.timestamp));
            const totalFilesData = data.map(item => item.metrics?.totalFiles || 0);
            const errorsData = data.map(item => item.metrics?.errors || 0);
            const warningsData = data.map(item => item.metrics?.warnings || 0);
            const complexityData = data.map(item => item.metrics?.complexity || 0);

            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = totalFilesData;
            this.chart.data.datasets[1].data = errorsData;
            this.chart.data.datasets[2].data = warningsData;
            this.chart.data.datasets[3].data = complexityData;

            this.chart.update('none');
            console.log('✅ Counts chart updated with', data.length, 'data points');
        } catch (error) {
            console.error('❌ Counts chart update error:', error);
        }
    }

    addDataPoint(dataPoint) {
        if (!this.chart || !dataPoint) return;

        try {
            const timestamp = new Date(dataPoint.timestamp);
            const totalFilesValue = dataPoint.metrics?.totalFiles || 0;
            const errorsValue = dataPoint.metrics?.errors || 0;
            const warningsValue = dataPoint.metrics?.warnings || 0;
            const complexityValue = dataPoint.metrics?.complexity || 0;

            this.chart.data.labels.push(timestamp);
            this.chart.data.datasets[0].data.push(totalFilesValue);
            this.chart.data.datasets[1].data.push(errorsValue);
            this.chart.data.datasets[2].data.push(warningsValue);
            this.chart.data.datasets[3].data.push(complexityValue);

            // Keep only last 50 data points
            if (this.chart.data.labels.length > 50) {
                this.chart.data.labels.shift();
                this.chart.data.datasets[0].data.shift();
                this.chart.data.datasets[1].data.shift();
                this.chart.data.datasets[2].data.shift();
                this.chart.data.datasets[3].data.shift();
            }

            this.chart.update('none');
        } catch (error) {
            console.error('❌ Counts chart add data point error:', error);
        }
    }

    clearChart() {
        if (!this.chart) return;

        this.chart.data.labels = [];
        this.chart.data.datasets[0].data = [];
        this.chart.data.datasets[1].data = [];
        this.chart.data.datasets[2].data = [];
        this.chart.data.datasets[3].data = [];
        this.chart.update('none');
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
            this.isInitialized = false;
        }
    }

    exportChart(format = 'png') {
        if (!this.chart) return null;

        const canvas = this.chart.canvas;
        const dataURL = canvas.toDataURL(`image/${format}`);
        return dataURL;
    }

    getChartStats() {
        if (!this.chart || this.chart.data.datasets[0].data.length === 0) {
            return null;
        }

        return {
            totalFiles: {
                label: this.chart.data.datasets[0].label,
                points: this.chart.data.datasets[0].data.length,
                min: Math.min(...this.chart.data.datasets[0].data),
                max: Math.max(...this.chart.data.datasets[0].data),
                avg: this.chart.data.datasets[0].data.reduce((a, b) => a + b, 0) / this.chart.data.datasets[0].data.length
            },
            errors: {
                label: this.chart.data.datasets[1].label,
                points: this.chart.data.datasets[1].data.length,
                min: Math.min(...this.chart.data.datasets[1].data),
                max: Math.max(...this.chart.data.datasets[1].data),
                avg: this.chart.data.datasets[1].data.reduce((a, b) => a + b, 0) / this.chart.data.datasets[1].data.length
            },
            warnings: {
                label: this.chart.data.datasets[2].label,
                points: this.chart.data.datasets[2].data.length,
                min: Math.min(...this.chart.data.datasets[2].data),
                max: Math.max(...this.chart.data.datasets[2].data),
                avg: this.chart.data.datasets[2].data.reduce((a, b) => a + b, 0) / this.chart.data.datasets[2].data.length
            },
            timeRange: {
                start: this.chart.data.labels.length > 0 ? this.chart.data.labels[0] : null,
                end: this.chart.data.labels.length > 0 ? this.chart.data.labels[this.chart.data.labels.length - 1] : null
            }
        };
    }
}

// Export to global scope
if (typeof window !== 'undefined') {
    window.CountsChartRenderer = CountsChartRenderer;
}
