/**
 * WentUrc Logger Utility
 * 
 * A comprehensive logging solution with:
 * - Different log levels (debug, info, warn, error)
 * - Production vs Development modes
 * - Performance timing measurements
 * - Colorful console output
 * - Grouped logs for better organization
 */

// Environment detection
const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;

// Logger configuration
const config = {
  // Enable different types of logs
  enabled: {
    debug: isDev,
    info: true,
    warn: true,
    error: true,
    performance: isDev
  },
  
  // Show timestamps in logs
  showTimestamp: isDev,
  
  // Style configurations for console
  styles: {
    debug: 'color: #8a8cff; font-weight: normal;',
    info: 'color: #38d9a9; font-weight: normal;',
    warn: 'color: #f1b944; font-weight: bold;',
    error: 'color: #ff6b6b; font-weight: bold;',
    performance: 'color: #d471d4; font-weight: normal;',
    timestamp: 'color: #999; font-weight: normal;'
  }
};

// Performance tracking cache
const performanceMarks = {};

/**
 * Format message with optional timestamp
 */
function formatMessage(message) {
  if (!config.showTimestamp) return message;
  
  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  
  return `%c[${timestamp}]%c ${message}`;
}

/**
 * Core logging functionality with styling
 */
function logWithStyle(type, ...args) {
  if (!config.enabled[type]) return;
  
  const message = args[0];
  const restArgs = args.slice(1);
  
  if (typeof message === 'string') {
    const formattedMessage = formatMessage(message);
    if (config.showTimestamp) {
      console[type === 'debug' ? 'log' : type](
        formattedMessage,
        config.styles.timestamp,
        config.styles[type],
        ...restArgs
      );
    } else {
      console[type === 'debug' ? 'log' : type](`%c${message}`, config.styles[type], ...restArgs);
    }
  } else {
    console[type === 'debug' ? 'log' : type](message, ...restArgs);
  }
}

const logger = {
  /**
   * Debug level logging - only in development
   */
  debug(...args) {
    logWithStyle('debug', ...args);
  },
  
  /**
   * Info level logging
   */
  info(...args) {
    logWithStyle('info', ...args);
  },
  
  /**
   * Warning level logging
   */
  warn(...args) {
    logWithStyle('warn', ...args);
  },
  
  /**
   * Error level logging
   */
  error(...args) {
    logWithStyle('error', ...args);
  },
  
  /**
   * Group related logs together
   */
  group(title, collapsed = false) {
    if (!isDev) return;
    
    const method = collapsed ? 'groupCollapsed' : 'group';
    console[method](`%c${title}`, 'font-weight: bold; color: #6b90ff;');
    
    return {
      end: () => console.groupEnd()
    };
  },
  
  /**
   * Start performance measurement
   */
  startPerformance(markName) {
    if (!config.enabled.performance) return;
    
    performanceMarks[markName] = performance.now();
    console.log(`%c⏱ Started: ${markName}`, config.styles.performance);
  },
  
  /**
   * End performance measurement and log duration
   */
  endPerformance(markName, logLevel = 'debug') {
    if (!config.enabled.performance) return 0;
    
    if (!performanceMarks[markName]) {
      this.warn(`Performance mark '${markName}' not found`);
      return 0;
    }
    
    const duration = performance.now() - performanceMarks[markName];
    const formattedDuration = duration.toFixed(2);
    
    delete performanceMarks[markName];
    
    this[logLevel](`⏱ ${markName}: ${formattedDuration}ms`);
    return duration;
  },
  
  /**
   * Measure performance of async function
   */
  async measure(name, fn) {
    this.startPerformance(name);
    const result = await fn();
    this.endPerformance(name);
    return result;
  },
  
  /**
   * Log component render performance
   */
  logComponentRender(componentName) {
    if (!config.enabled.performance || !isDev) return {
      mounted: () => {},
      updated: () => {}
    };
    
    const mountKey = `${componentName}:mount`;
    const updateKey = `${componentName}:update`;
    
    return {
      mounted: () => {
        this.endPerformance(mountKey);
      },
      beforeMount: () => {
        this.startPerformance(mountKey);
      },
      beforeUpdate: () => {
        this.startPerformance(updateKey);
      },
      updated: () => {
        this.endPerformance(updateKey);
      }
    };
  },
  
  /**
   * Configure logger settings
   */
  configure(newConfig) {
    Object.assign(config, newConfig);
  }
};

export default logger;
