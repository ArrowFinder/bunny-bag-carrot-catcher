/**
 * Bunny Bag - Main Entry Point
 * Production-ready game initialization and integration
 */

import { BunnyBagGame } from './gameEngine.js';
import { GAME_CONFIG, COLOR_PALETTE } from './config.js';

/**
 * Game Manager Class
 * Handles game lifecycle and provides clean integration API
 */
export class GameManager {
    constructor(options = {}) {
        this.game = null;
        this.canvas = null;
        this.options = {
            canvasId: 'gameCanvas',
            enableCRT: false,
            enableMute: false,
            autoStart: false,
            ...options
        };
        
        this.isInitialized = false;
        this.eventListeners = new Map();
    }

    /**
     * Initialize the game
     * @param {HTMLElement|string} canvasElement - Canvas element or ID
     * @returns {Promise<boolean>} - Success status
     */
    async initialize(canvasElement) {
        try {
            // Get canvas element
            if (typeof canvasElement === 'string') {
                this.canvas = document.getElementById(canvasElement);
            } else {
                this.canvas = canvasElement;
            }

            if (!this.canvas) {
                throw new Error('Canvas element not found');
            }

            // Create game instance
            this.game = new BunnyBagGame(this.canvas, this.options);
            
            // Setup CRT overlay if enabled
            if (this.options.enableCRT) {
                this.setupCRTOverlay();
            }

            this.isInitialized = true;
            this.emit('initialized');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.emit('error', error);
            return false;
        }
    }

    /**
     * Setup CRT overlay effect
     */
    setupCRTOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'crtOverlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            background: linear-gradient(transparent 50%, rgba(0, 255, 0, 0.03) 50%);
            background-size: 100% 4px;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        const container = this.canvas.parentElement;
        if (container) {
            container.style.position = 'relative';
            container.appendChild(overlay);
        }
    }

    /**
     * Start the game
     */
    start() {
        if (!this.isInitialized) {
            throw new Error('Game not initialized');
        }
        this.game.startGame();
        this.emit('started');
    }

    /**
     * Pause the game
     */
    pause() {
        if (this.game) {
            this.game.pause();
            this.emit('paused');
        }
    }

    /**
     * Resume the game
     */
    resume() {
        if (this.game) {
            this.game.resume();
            this.emit('resumed');
        }
    }

    /**
     * Reset the game
     */
    reset() {
        if (this.game) {
            this.game.reset();
            this.emit('reset');
        }
    }

    /**
     * Get current game state
     */
    getState() {
        return this.game ? this.game.getState() : null;
    }

    /**
     * Get current score
     */
    getScore() {
        return this.game ? this.game.getScore() : 0;
    }

    /**
     * Get current lives
     */
    getLives() {
        return this.game ? this.game.getLives() : 0;
    }

    /**
     * Toggle CRT effect
     */
    toggleCRT() {
        if (this.game) {
            this.game.toggleCRT();
            const overlay = document.getElementById('crtOverlay');
            if (overlay) {
                overlay.classList.toggle('active');
            }
        }
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        if (this.game) {
            this.game.toggleMute();
        }
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const callbacks = this.eventListeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     * @param {string} event - Event name
     * @param {...any} args - Event arguments
     */
    emit(event, ...args) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Event listener error for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Cleanup and destroy game
     */
    destroy() {
        if (this.game) {
            this.game.destroy();
            this.game = null;
        }
        
        this.eventListeners.clear();
        this.isInitialized = false;
        this.emit('destroyed');
    }
}

/**
 * Auto-initialization function for easy integration
 * @param {Object} options - Game options
 * @returns {Promise<GameManager>} - Game manager instance
 */
export async function createGame(options = {}) {
    const gameManager = new GameManager(options);
    
    // Auto-find canvas if not specified
    if (!options.canvasId && !options.canvasElement) {
        options.canvasId = 'gameCanvas';
    }
    
    const success = await gameManager.initialize(options.canvasId || options.canvasElement);
    
    if (!success) {
        throw new Error('Failed to initialize game');
    }
    
    return gameManager;
}

/**
 * Default export for easy importing
 */
export default GameManager;

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Auto-initialize if canvas exists
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            window.bunnyBagGame = createGame();
        }
    });
} else {
    // DOM already loaded
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        window.bunnyBagGame = createGame();
    }
}
