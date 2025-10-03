/**
 * Bunny Bag Game Configuration
 * Centralized configuration for easy maintenance and customization
 */

export const GAME_CONFIG = {
    // Canvas dimensions
    CANVAS: {
        WIDTH: 800,
        HEIGHT: 600
    },

    // Player properties
    PLAYER: {
        WIDTH: 32,
        HEIGHT: 32,
        SPEED: 4,
        JUMP_POWER: 14,
        GRAVITY: 0.5,
        GROUND_Y: 580 // GAME_HEIGHT - 20
    },

    // Carrot properties
    CARROT: {
        SIZE: 16,
        POINTS_PER_CATCH: 10
    },

    // Bag properties
    BAG: {
        WIDTH: 40,
        HEIGHT: 20
    },

    // Obstacle properties
    OBSTACLE: {
        WIDTH: 24,
        HEIGHT: 32,
        BASE_SPEED: 2.5,
        MAX_SPEED: 5.5
    },

    // Game progression thresholds
    PROGRESSION: {
        OBSTACLES_START: 100,    // Score when obstacles appear
        SPEED_INCREASE: 200,     // Score when speed increases
        MULTI_SPAWN_START: 300,  // Score when multi-spawn starts
        RAPID_INCREASE: 500      // Score when rapid scaling begins
    },

    // Spawn intervals (milliseconds)
    SPAWN: {
        CARROT_BASE_INTERVAL: 2000,
        OBSTACLE_BASE_INTERVAL: 4000,
        CARROT_MIN_INTERVAL: 200,
        OBSTACLE_MIN_INTERVAL: 2000
    },

    // Physics
    PHYSICS: {
        FALL_SPEED_BASE: 2,
        FALL_SPEED_MAX: 12,
        WIND_MAX: 2.5,
        MULTI_SPAWN_MAX: 0.5
    },

    // Visual effects
    PARTICLES: {
        CATCH_COUNT: 5,
        HIT_COUNT: 8,
        GROUND_COUNT: 3,
        STAGE_UP_COUNT: 20
    },

    // UI
    UI: {
        PROGRESS_BAR_WIDTH: 200,
        PROGRESS_BAR_HEIGHT: 8,
        PROGRESS_BAR_MAX_SCORE: 1000
    }
};

export const COLOR_PALETTE = {
    BACKGROUND: '#1a1a2e',
    PLAYER: '#ff6b6b',
    CARROT: '#ffa500',
    BAG: '#8b4513',
    TEXT: '#ffffff',
    UI: '#00ff00',
    SHADOW: '#000000',
    GROUND: '#4a4a6a',
    OBSTACLE: '#8B4513',
    OBSTACLE_TOP: '#A0522D',
    BUNNY_PINK: '#ffb6c1',
    BUNNY_NOSE: '#ff69b4'
};

export const GAME_STATES = {
    TITLE: 'title',
    PLAYING: 'playing',
    PAUSED: 'paused',
    HIT_PAUSE: 'hitPause',
    GAME_OVER: 'gameOver'
};

export const STORAGE_KEYS = {
    BEST_SCORE: 'bunnyBagBestScore',
    HIGHEST_LEVEL: 'bunnyBagHighestLevel'
};
