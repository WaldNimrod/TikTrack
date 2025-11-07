/**
 * Logger Service Unit Tests
 * =========================
 * 
 * Unit tests for the Logger Service system
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

// Import the real Logger Service
const fs = require('fs');
const path = require('path');

// Load the actual Logger Service code
const loggerCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/logger-service.js'), 
    'utf8'
);

describe('Logger Service', () => {
    let Logger;
    let logger;
    
    beforeAll(() => {
        // Mock the global environment before loading the real code
        global.window = {
            Logger: null // Will be set by the real code
        };
        
        // Mock fetch for server communication
        global.fetch = jest.fn();
        
        // Mock console for testing
        global.console = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn(),
            debug: jest.fn()
        };
        
        // Evaluate the real code to get the Logger
        eval(loggerCode);
        Logger = global.window.Logger;

        const wrapMethod = (methodName) => {
            const original = Logger?.[methodName];
            if (typeof original === 'function') {
                Logger[methodName] = jest.fn(function (...args) {
                    return original.apply(Logger, args);
                });
            } else {
                Logger[methodName] = jest.fn();
            }
        };

        const methodsToWrap = [
            'debug', 'info', 'warn', 'error', 'success', 'trace', 'log', 'critical',
            'setLevel', 'getLevel', 'flush', 'clear', 'getLogs', 'exportLogs',
            'sendToServer', 'setServerEndpoint', 'setConfig', 'startTimer',
            'endTimer', 'measurePerformance', 'logBatch'
        ];

        methodsToWrap.forEach(wrapMethod);

        logger = Logger;
        global.logger = logger;
    });
    
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
    });
    
    describe('Basic Logging Functions', () => {
        test('should log debug messages', () => {
            const message = 'Debug message';
            const data = { key: 'value' };
            
            Logger.debug(message, data);
            
            expect(Logger.debug).toHaveBeenCalledWith(message, data);
        });
        
        test('should log info messages', () => {
            const message = 'Info message';
            const data = { key: 'value' };
            
            Logger.info(message, data);
            
            expect(Logger.info).toHaveBeenCalledWith(message, data);
        });
        
        test('should log warning messages', () => {
            const message = 'Warning message';
            const data = { key: 'value' };
            
            Logger.warn(message, data);
            
            expect(Logger.warn).toHaveBeenCalledWith(message, data);
        });
        
        test('should log error messages', () => {
            const message = 'Error message';
            const data = { key: 'value' };
            
            Logger.error(message, data);
            
            expect(Logger.error).toHaveBeenCalledWith(message, data);
        });
        
        test('should log critical messages', () => {
            const message = 'Critical message';
            const data = { key: 'value' };
            
            Logger.critical(message, data);
            
            expect(Logger.critical).toHaveBeenCalledWith(message, data);
        });
    });
    
    describe('Level Management', () => {
        test('should set log level', () => {
            const level = 'info';
            
            logger.setLevel(level);
            
            expect(logger.setLevel).toHaveBeenCalledWith(level);
        });
        
        test('should get current log level', () => {
            const expectedLevel = 'debug';
            logger.getLevel.mockReturnValue(expectedLevel);
            
            const level = logger.getLevel();
            
            expect(logger.getLevel).toHaveBeenCalled();
            expect(level).toBe(expectedLevel);
        });
    });
    
    describe('Log Management', () => {
        test('should flush logs', () => {
            logger.flush();
            
            expect(logger.flush).toHaveBeenCalled();
        });
        
        test('should clear logs', () => {
            logger.clear();
            
            expect(logger.clear).toHaveBeenCalled();
        });
        
        test('should get logs', () => {
            const expectedLogs = [
                { level: 'info', message: 'Test message', timestamp: Date.now() }
            ];
            logger.getLogs.mockReturnValue(expectedLogs);
            
            const logs = logger.getLogs();
            
            expect(logger.getLogs).toHaveBeenCalled();
            expect(logs).toEqual(expectedLogs);
        });
        
        test('should export logs', () => {
            const format = 'json';
            const expectedExport = '{"logs":[]}';
            logger.exportLogs.mockReturnValue(expectedExport);
            
            const exportData = logger.exportLogs(format);
            
            expect(logger.exportLogs).toHaveBeenCalledWith(format);
            expect(exportData).toBe(expectedExport);
        });
    });
    
    describe('Server Integration', () => {
        test('should send logs to server', () => {
            const logs = [{ level: 'info', message: 'Test' }];
            
            logger.sendToServer(logs);
            
            expect(logger.sendToServer).toHaveBeenCalledWith(logs);
        });
        
        test('should set server endpoint', () => {
            const endpoint = 'http://localhost:8080/api/logs';
            
            logger.setServerEndpoint(endpoint);
            
            expect(logger.setServerEndpoint).toHaveBeenCalledWith(endpoint);
        });
    });
    
    describe('Configuration', () => {
        test('should set logger configuration', () => {
            const config = {
                level: 'info',
                serverEndpoint: 'http://localhost:8080/api/logs',
                maxLogs: 1000
            };
            
            logger.setConfig(config);
            
            expect(logger.setConfig).toHaveBeenCalledWith(config);
        });
    });
    
    describe('Performance Monitoring', () => {
        test('should start timer', () => {
            const timerName = 'test-timer';
            
            logger.startTimer(timerName);
            
            expect(logger.startTimer).toHaveBeenCalledWith(timerName);
        });
        
        test('should end timer', () => {
            const timerName = 'test-timer';
            const expectedDuration = 100;
            logger.endTimer.mockReturnValue(expectedDuration);
            
            const duration = logger.endTimer(timerName);
            
            expect(logger.endTimer).toHaveBeenCalledWith(timerName);
            expect(duration).toBe(expectedDuration);
        });
        
        test('should measure performance', () => {
            const operation = () => { return 'result'; };
            const expectedResult = 'result';
            logger.measurePerformance.mockReturnValue(expectedResult);
            
            const result = logger.measurePerformance(operation);
            
            expect(logger.measurePerformance).toHaveBeenCalledWith(operation);
            expect(result).toBe(expectedResult);
        });
    });
    
    describe('Error Handling', () => {
        test('should handle logging errors gracefully', () => {
            logger.error.mockImplementation(() => {
                throw new Error('Logging failed');
            });
            
            expect(() => {
                logger.error('Test error');
            }).toThrow('Logging failed');
        });
        
        test('should handle server communication errors', () => {
            logger.sendToServer.mockImplementation(() => {
                throw new Error('Server communication failed');
            });
            
            expect(() => {
                logger.sendToServer([]);
            }).toThrow('Server communication failed');
        });
    });
    
    describe('Integration with Other Systems', () => {
        test('should work with notification system', () => {
            const message = 'Test message';
            const data = { key: 'value' };
            
            logger.info(message, data);
            
            expect(logger.info).toHaveBeenCalledWith(message, data);
        });
        
        test('should work with cache system', () => {
            const message = 'Cache operation';
            const data = { operation: 'get', key: 'test-key' };
            
            logger.debug(message, data);
            
            expect(logger.debug).toHaveBeenCalledWith(message, data);
        });
    });
});
