/**
 * Game Utilities
 * Helper functions and utility classes for the Bunny Bag game
 */

import { GAME_CONFIG, STORAGE_KEYS } from './config.js';

/**
 * Local Storage utility class
 */
export class StorageManager {
    static get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value !== null ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.warn(`Failed to get storage key ${key}:`, error);
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Failed to set storage key ${key}:`, error);
            return false;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn(`Failed to remove storage key ${key}:`, error);
            return false;
        }
    }
}

/**
 * Math utilities for game calculations
 */
export class MathUtils {
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    static randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

/**
 * Collision detection utilities
 */
export class CollisionUtils {
    static checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    static checkPointInRect(pointX, pointY, rect) {
        return pointX >= rect.x &&
               pointX <= rect.x + rect.width &&
               pointY >= rect.y &&
               pointY <= rect.y + rect.height;
    }
}

/**
 * Game state management utilities
 */
export class StateManager {
    constructor() {
        this.state = null;
        this.listeners = new Map();
    }

    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        this.notifyListeners(oldState, newState);
    }

    getState() {
        return this.state;
    }

    addListener(state, callback) {
        if (!this.listeners.has(state)) {
            this.listeners.set(state, []);
        }
        this.listeners.get(state).push(callback);
    }

    removeListener(state, callback) {
        if (this.listeners.has(state)) {
            const callbacks = this.listeners.get(state);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    notifyListeners(oldState, newState) {
        if (this.listeners.has(newState)) {
            this.listeners.get(newState).forEach(callback => {
                try {
                    callback(newState, oldState);
                } catch (error) {
                    console.error('State listener error:', error);
                }
            });
        }
    }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 0;
        this.frameTimes = [];
    }

    update(currentTime) {
        this.frameCount++;
        
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
            return;
        }

        const deltaTime = currentTime - this.lastTime;
        this.frameTimes.push(deltaTime);

        // Keep only last 60 frames for FPS calculation
        if (this.frameTimes.length > 60) {
            this.frameTimes.shift();
        }

        // Calculate FPS every 60 frames
        if (this.frameCount % 60 === 0) {
            const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
            this.fps = Math.round(1000 / avgFrameTime);
        }

        this.lastTime = currentTime;
    }

    getFPS() {
        return this.fps;
    }

    getAverageFrameTime() {
        if (this.frameTimes.length === 0) return 0;
        return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    }
}

/**
 * Input handling utilities
 */
export class InputManager {
    constructor() {
        this.keys = new Map();
        this.keyCallbacks = new Map();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys.set(e.code, true);
            this.triggerKeyCallbacks(e.code, 'down', e);
        });

        document.addEventListener('keyup', (e) => {
            this.keys.set(e.code, false);
            this.triggerKeyCallbacks(e.code, 'up', e);
        });
    }

    isKeyDown(keyCode) {
        return this.keys.get(keyCode) === true;
    }

    isKeyUp(keyCode) {
        return this.keys.get(keyCode) === false;
    }

    onKey(keyCode, eventType, callback) {
        const key = `${keyCode}_${eventType}`;
        if (!this.keyCallbacks.has(key)) {
            this.keyCallbacks.set(key, []);
        }
        this.keyCallbacks.get(key).push(callback);
    }

    triggerKeyCallbacks(keyCode, eventType, event) {
        const key = `${keyCode}_${eventType}`;
        if (this.keyCallbacks.has(key)) {
            this.keyCallbacks.get(key).forEach(callback => {
                try {
                    callback(event);
                } catch (error) {
                    console.error('Key callback error:', error);
                }
            });
        }
    }

    cleanup() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}
