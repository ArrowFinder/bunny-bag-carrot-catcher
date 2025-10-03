/**
 * Bunny Bag Game Engine
 * Core game logic and state management
 */

import { GAME_CONFIG, COLOR_PALETTE, GAME_STATES, STORAGE_KEYS } from './config.js';
import { StorageManager, MathUtils, CollisionUtils, StateManager, PerformanceMonitor, InputManager } from './utils.js';
import { Player, Carrot, Obstacle, Particle } from './gameObjects.js';

/**
 * Main game engine class
 */
export class BunnyBagGame {
    constructor(canvasElement, options = {}) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize managers
        this.stateManager = new StateManager();
        this.inputManager = new InputManager();
        this.performanceMonitor = new PerformanceMonitor();
        
        // Game state
        this.state = GAME_STATES.TITLE;
        this.score = 0;
        this.lives = 3;
        this.caughtCarrots = 0;
        this.totalCarrots = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.difficultyLevel = 1;
        
        // Game objects
        this.player = null;
        this.carrots = [];
        this.obstacles = [];
        this.particles = [];
        
        // Timing
        this.lastSpawnTime = 0;
        this.lastObstacleSpawnTime = 0;
        this.gameTime = 0;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.hitPauseTime = 0;
        
        // Settings
        this.muted = false;
        this.crtEnabled = false;
        
        // Load saved data
        this.bestScore = StorageManager.get(STORAGE_KEYS.BEST_SCORE, 0);
        
        // Initialize game
        this.initialize();
    }

    /**
     * Initialize the game
     */
    initialize() {
        this.setupCanvas();
        this.setupEventListeners();
        this.resetGame();
        this.gameLoop();
    }

    /**
     * Setup canvas properties
     */
    setupCanvas() {
        this.canvas.width = GAME_CONFIG.CANVAS.WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS.HEIGHT;
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.imageRendering = '-moz-crisp-edges';
        this.canvas.style.imageRendering = 'crisp-edges';
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Keyboard input
        this.inputManager.onKey('Space', 'down', (e) => {
            e.preventDefault();
            this.handleSpaceKey();
        });

        this.inputManager.onKey('KeyM', 'down', () => this.toggleMute());
        this.inputManager.onKey('KeyC', 'down', () => this.toggleCRT());
        this.inputManager.onKey('ArrowUp', 'down', (e) => {
            e.preventDefault();
            this.handleJump();
        });
        this.inputManager.onKey('KeyW', 'down', (e) => {
            e.preventDefault();
            this.handleJump();
        });

        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Handle space key press
     */
    handleSpaceKey() {
        switch (this.state) {
            case GAME_STATES.TITLE:
                this.startGame();
                break;
            case GAME_STATES.PLAYING:
                this.pauseGame();
                break;
            case GAME_STATES.PAUSED:
                this.resumeGame();
                break;
            case GAME_STATES.HIT_PAUSE:
                this.resumeFromHit();
                break;
            case GAME_STATES.GAME_OVER:
                this.restartGame();
                break;
        }
    }

    /**
     * Handle jump input
     */
    handleJump() {
        if (this.state === GAME_STATES.PLAYING && this.player) {
            this.player.jump();
        }
    }

    /**
     * Toggle mute setting
     */
    toggleMute() {
        this.muted = !this.muted;
        // Sound implementation would go here
    }

    /**
     * Toggle CRT effect
     */
    toggleCRT() {
        this.crtEnabled = !this.crtEnabled;
        // CRT effect implementation would go here
    }

    /**
     * Start the game
     */
    startGame() {
        this.state = GAME_STATES.PLAYING;
        this.resetGame();
    }

    /**
     * Pause the game
     */
    pauseGame() {
        this.state = GAME_STATES.PAUSED;
    }

    /**
     * Resume the game
     */
    resumeGame() {
        this.state = GAME_STATES.PLAYING;
    }

    /**
     * Resume from hit pause
     */
    resumeFromHit() {
        this.state = GAME_STATES.PLAYING;
        this.hitPauseTime = 0;
    }

    /**
     * Restart the game
     */
    restartGame() {
        this.state = GAME_STATES.TITLE;
        this.resetGame();
    }

    /**
     * Reset game state
     */
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.caughtCarrots = 0;
        this.totalCarrots = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.difficultyLevel = 1;
        
        // Clear game objects
        this.carrots = [];
        this.obstacles = [];
        this.particles = [];
        
        // Reset player
        this.player = new Player(
            GAME_CONFIG.CANVAS.WIDTH / 2 - GAME_CONFIG.PLAYER.WIDTH / 2,
            GAME_CONFIG.PLAYER.GROUND_Y - GAME_CONFIG.PLAYER.HEIGHT
        );
        
        // Reset timing
        this.lastSpawnTime = 0;
        this.lastObstacleSpawnTime = 0;
        this.gameTime = 0;
        this.hitPauseTime = 0;
    }

    /**
     * Update game logic
     */
    update(deltaTime) {
        if (this.state !== GAME_STATES.PLAYING) return;
        
        this.gameTime += deltaTime;
        
        // Update player
        this.updatePlayer(deltaTime);
        
        // Update game objects
        this.updateCarrots(deltaTime);
        this.updateObstacles(deltaTime);
        this.updateParticles(deltaTime);
        
        // Spawn objects
        this.spawnCarrots();
        this.spawnObstacles();
        
        // Update difficulty
        this.updateDifficultyProgression();
    }

    /**
     * Update player
     */
    updatePlayer(deltaTime) {
        if (!this.player) return;
        
        // Handle input
        let direction = 0;
        if (this.inputManager.isKeyDown('ArrowLeft') || this.inputManager.isKeyDown('KeyA')) {
            direction = -1;
        } else if (this.inputManager.isKeyDown('ArrowRight') || this.inputManager.isKeyDown('KeyD')) {
            direction = 1;
        }
        
        this.player.move(direction);
        this.player.update(deltaTime);
    }

    /**
     * Update carrots
     */
    updateCarrots(deltaTime) {
        const config = this.getDifficultyConfig();
        
        for (let i = this.carrots.length - 1; i >= 0; i--) {
            const carrot = this.carrots[i];
            carrot.update(deltaTime);
            
            // Check collision with player
            if (this.player && this.checkCarrotCollision(carrot)) {
                this.catchCarrot(carrot, i);
                continue;
            }
            
            // Check if carrot hit ground
            if (carrot.isOffScreen()) {
                this.groundCarrot(carrot, i);
            }
        }
    }

    /**
     * Update obstacles
     */
    updateObstacles(deltaTime) {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.update(deltaTime);
            
            // Check collision with player
            if (this.player && this.checkObstacleCollision(obstacle)) {
                this.hitObstacle(obstacle, i);
                continue;
            }
            
            // Remove obstacle if off screen
            if (obstacle.isOffScreen()) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    /**
     * Update particles
     */
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Spawn carrots
     */
    spawnCarrots() {
        const config = this.getDifficultyConfig();
        const now = Date.now();
        
        if (now - this.lastSpawnTime > config.spawnInterval) {
            this.createCarrot();
            
            // Multi-spawn chance
            if (Math.random() < config.multiSpawn) {
                setTimeout(() => this.createCarrot(), 200);
                if (Math.random() < config.multiSpawn * 0.5) {
                    setTimeout(() => this.createCarrot(), 400);
                }
            }
            
            this.lastSpawnTime = now;
        }
    }

    /**
     * Spawn obstacles
     */
    spawnObstacles() {
        const config = this.getDifficultyConfig();
        
        if (!config.obstacles) return;
        
        const now = Date.now();
        const obstacleSpawnInterval = GAME_CONFIG.SPAWN.OBSTACLE_BASE_INTERVAL;
        
        if (now - this.lastObstacleSpawnTime > obstacleSpawnInterval) {
            if (Math.random() < config.obstacleSpawn) {
                this.createObstacle();
                this.lastObstacleSpawnTime = now;
            }
        }
    }

    /**
     * Create a new carrot
     */
    createCarrot() {
        const config = this.getDifficultyConfig();
        
        // Strategic positioning based on score
        let x;
        if (this.score < 200) {
            x = Math.random() * (GAME_CONFIG.CANVAS.WIDTH - GAME_CONFIG.CARROT.SIZE);
        } else if (this.score < 500) {
            if (this.carrots.length > 0) {
                const lastCarrot = this.carrots[this.carrots.length - 1];
                const offset = (Math.random() - 0.5) * 150;
                x = MathUtils.clamp(lastCarrot.x + offset, 0, GAME_CONFIG.CANVAS.WIDTH - GAME_CONFIG.CARROT.SIZE);
            } else {
                x = Math.random() * (GAME_CONFIG.CANVAS.WIDTH - GAME_CONFIG.CARROT.SIZE);
            }
        } else {
            if (this.carrots.length > 0) {
                const lastCarrot = this.carrots[this.carrots.length - 1];
                const offset = (Math.random() - 0.5) * 200;
                x = MathUtils.clamp(lastCarrot.x + offset, 0, GAME_CONFIG.CANVAS.WIDTH - GAME_CONFIG.CARROT.SIZE);
            } else {
                x = Math.random() * (GAME_CONFIG.CANVAS.WIDTH - GAME_CONFIG.CARROT.SIZE);
            }
        }
        
        const speed = config.fallSpeed + (Math.random() - 0.5) * 0.3;
        const carrot = new Carrot(x, -GAME_CONFIG.CARROT.SIZE, speed);
        
        this.carrots.push(carrot);
        this.totalCarrots++;
    }

    /**
     * Create a new obstacle
     */
    createObstacle() {
        const config = this.getDifficultyConfig();
        const type = Math.random() < 0.7 ? 'log' : 'rock';
        const obstacle = new Obstacle(
            GAME_CONFIG.CANVAS.WIDTH,
            GAME_CONFIG.PLAYER.GROUND_Y - GAME_CONFIG.OBSTACLE.HEIGHT,
            config.obstacleSpeed,
            type
        );
        
        this.obstacles.push(obstacle);
    }

    /**
     * Check carrot collision with player
     */
    checkCarrotCollision(carrot) {
        const bagX = this.player.x + (this.player.width - GAME_CONFIG.BAG.WIDTH) / 2;
        const bagY = this.player.y - GAME_CONFIG.BAG.HEIGHT;
        
        return CollisionUtils.checkRectCollision(carrot.getBounds(), {
            x: bagX,
            y: bagY,
            width: GAME_CONFIG.BAG.WIDTH,
            height: GAME_CONFIG.BAG.HEIGHT
        });
    }

    /**
     * Check obstacle collision with player
     */
    checkObstacleCollision(obstacle) {
        return CollisionUtils.checkRectCollision(obstacle.getBounds(), this.player.getBounds());
    }

    /**
     * Handle carrot catch
     */
    catchCarrot(carrot, index) {
        this.carrots.splice(index, 1);
        
        this.score += GAME_CONFIG.CARROT.POINTS_PER_CATCH;
        this.caughtCarrots++;
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        this.createCatchParticles(carrot.x + carrot.width / 2, carrot.y + carrot.height / 2);
    }

    /**
     * Handle carrot hitting ground
     */
    groundCarrot(carrot, index) {
        this.carrots.splice(index, 1);
        this.combo = 0;
        this.createGroundParticles(carrot.x + carrot.width / 2, carrot.y + carrot.height / 2);
    }

    /**
     * Handle obstacle hit
     */
    hitObstacle(obstacle, index) {
        this.obstacles.splice(index, 1);
        this.combo = 0;
        this.lives--;
        
        this.createHitParticles(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
        
        this.state = GAME_STATES.HIT_PAUSE;
        this.hitPauseTime = Date.now();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    /**
     * Handle game over
     */
    gameOver() {
        this.state = GAME_STATES.GAME_OVER;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            StorageManager.set(STORAGE_KEYS.BEST_SCORE, this.bestScore);
        }
    }

    /**
     * Get difficulty configuration based on score
     */
    getDifficultyConfig() {
        const config = {
            spawnInterval: GAME_CONFIG.SPAWN.CARROT_BASE_INTERVAL,
            fallSpeed: GAME_CONFIG.PHYSICS.FALL_SPEED_BASE,
            multiSpawn: 0,
            obstacles: false,
            obstacleSpawn: 0,
            obstacleSpeed: GAME_CONFIG.OBSTACLE.BASE_SPEED
        };
        
        const score = this.score;
        
        // Obstacles start at score 100
        if (score >= GAME_CONFIG.PROGRESSION.OBSTACLES_START) {
            config.obstacles = true;
            config.obstacleSpawn = Math.min(0.3, 0.05 + (score - GAME_CONFIG.PROGRESSION.OBSTACLES_START) * 0.001);
            config.obstacleSpeed = Math.min(GAME_CONFIG.OBSTACLE.MAX_SPEED, GAME_CONFIG.OBSTACLE.BASE_SPEED + (score - GAME_CONFIG.PROGRESSION.OBSTACLES_START) * 0.01);
        }
        
        // Speed increases start at score 200
        if (score >= GAME_CONFIG.PROGRESSION.SPEED_INCREASE) {
            const speedMultiplier = 1 + (score - GAME_CONFIG.PROGRESSION.SPEED_INCREASE) * 0.01;
            config.fallSpeed = Math.min(GAME_CONFIG.PHYSICS.FALL_SPEED_MAX, GAME_CONFIG.PHYSICS.FALL_SPEED_BASE * speedMultiplier);
            config.spawnInterval = Math.max(GAME_CONFIG.SPAWN.CARROT_MIN_INTERVAL, GAME_CONFIG.SPAWN.CARROT_BASE_INTERVAL / speedMultiplier);
        }
        
        // Multi-spawn starts at score 300
        if (score >= GAME_CONFIG.PROGRESSION.MULTI_SPAWN_START) {
            config.multiSpawn = Math.min(GAME_CONFIG.PHYSICS.MULTI_SPAWN_MAX, (score - GAME_CONFIG.PROGRESSION.MULTI_SPAWN_START) * 0.003);
        }
        
        // Rapid increase after score 500
        if (score >= GAME_CONFIG.PROGRESSION.RAPID_INCREASE) {
            const rapidMultiplier = 1 + (score - GAME_CONFIG.PROGRESSION.RAPID_INCREASE) * 0.01;
            config.fallSpeed = Math.min(GAME_CONFIG.PHYSICS.FALL_SPEED_MAX, config.fallSpeed * rapidMultiplier);
            config.spawnInterval = Math.max(GAME_CONFIG.SPAWN.CARROT_MIN_INTERVAL, config.spawnInterval / rapidMultiplier);
            config.obstacleSpeed = Math.min(GAME_CONFIG.OBSTACLE.MAX_SPEED, config.obstacleSpeed * rapidMultiplier);
            config.obstacleSpawn = Math.min(0.4, config.obstacleSpawn * rapidMultiplier);
        }
        
        return config;
    }

    /**
     * Update difficulty progression
     */
    updateDifficultyProgression() {
        const newLevel = Math.floor(this.score / 25) + 1;
        if (newLevel > this.difficultyLevel) {
            this.difficultyLevel = newLevel;
            this.createStageUpParticles();
        }
    }

    /**
     * Create catch particles
     */
    createCatchParticles(x, y) {
        for (let i = 0; i < GAME_CONFIG.PARTICLES.CATCH_COUNT; i++) {
            const particle = new Particle(
                x, y,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4 - 2,
                1000,
                COLOR_PALETTE.CARROT
            );
            this.particles.push(particle);
        }
    }

    /**
     * Create ground hit particles
     */
    createGroundParticles(x, y) {
        for (let i = 0; i < GAME_CONFIG.PARTICLES.GROUND_COUNT; i++) {
            const particle = new Particle(
                x, y,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                500,
                COLOR_PALETTE.GROUND
            );
            this.particles.push(particle);
        }
    }

    /**
     * Create hit particles
     */
    createHitParticles(x, y) {
        for (let i = 0; i < GAME_CONFIG.PARTICLES.HIT_COUNT; i++) {
            const particle = new Particle(
                x, y,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6 - 3,
                800,
                COLOR_PALETTE.SHADOW
            );
            this.particles.push(particle);
        }
    }

    /**
     * Create stage up particles
     */
    createStageUpParticles() {
        for (let i = 0; i < GAME_CONFIG.PARTICLES.STAGE_UP_COUNT; i++) {
            const particle = new Particle(
                GAME_CONFIG.CANVAS.WIDTH / 2,
                GAME_CONFIG.CANVAS.HEIGHT / 2,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                2000,
                COLOR_PALETTE.UI
            );
            this.particles.push(particle);
        }
    }

    /**
     * Render the game
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = COLOR_PALETTE.BACKGROUND;
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS.WIDTH, GAME_CONFIG.CANVAS.HEIGHT);
        
        // Draw ground
        this.ctx.fillStyle = COLOR_PALETTE.GROUND;
        this.ctx.fillRect(0, GAME_CONFIG.CANVAS.HEIGHT - 20, GAME_CONFIG.CANVAS.WIDTH, 20);
        
        switch (this.state) {
            case GAME_STATES.TITLE:
                this.renderTitleScreen();
                break;
            case GAME_STATES.PLAYING:
            case GAME_STATES.PAUSED:
            case GAME_STATES.HIT_PAUSE:
                this.renderGameplay();
                if (this.state === GAME_STATES.PAUSED) {
                    this.renderPauseOverlay();
                } else if (this.state === GAME_STATES.HIT_PAUSE) {
                    this.renderHitPauseOverlay();
                }
                break;
            case GAME_STATES.GAME_OVER:
                this.renderGameplay();
                this.renderGameOverScreen();
                break;
        }
    }

    /**
     * Render title screen
     */
    renderTitleScreen() {
        // Title
        this.ctx.fillStyle = COLOR_PALETTE.UI;
        this.ctx.font = 'bold 48px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('BUNNY BAG', GAME_CONFIG.CANVAS.WIDTH / 2, 150);
        
        this.ctx.font = 'bold 24px monospace';
        this.ctx.fillText('Carrot Catcher', GAME_CONFIG.CANVAS.WIDTH / 2, 190);
        
        // Subtitle
        this.ctx.fillStyle = COLOR_PALETTE.TEXT;
        this.ctx.font = '16px monospace';
        this.ctx.fillText('Pure Skill Progression • No Currencies • No IAP', GAME_CONFIG.CANVAS.WIDTH / 2, 250);
        
        // Instructions
        this.ctx.font = '14px monospace';
        this.ctx.fillText('Catch falling carrots with your bag!', GAME_CONFIG.CANVAS.WIDTH / 2, 300);
        this.ctx.fillText('Each carrot = 10 points!', GAME_CONFIG.CANVAS.WIDTH / 2, 320);
        this.ctx.fillText('Carrots fall straight down - timing is key!', GAME_CONFIG.CANVAS.WIDTH / 2, 340);
        this.ctx.fillText('Only lose lives when hit by obstacles!', GAME_CONFIG.CANVAS.WIDTH / 2, 360);
        
        // Controls
        this.ctx.fillStyle = COLOR_PALETTE.UI;
        this.ctx.font = 'bold 16px monospace';
        this.ctx.fillText('Press SPACE to Start', GAME_CONFIG.CANVAS.WIDTH / 2, 420);
        
        this.ctx.fillStyle = COLOR_PALETTE.TEXT;
        this.ctx.font = '12px monospace';
        this.ctx.fillText('← → Move | ↑ Jump | M: Mute | C: CRT Effect', GAME_CONFIG.CANVAS.WIDTH / 2, 450);
        
        // Best score
        if (this.bestScore > 0) {
            this.ctx.fillStyle = COLOR_PALETTE.CARROT;
            this.ctx.font = '14px monospace';
            this.ctx.fillText(`Best Score: ${this.bestScore}`, GAME_CONFIG.CANVAS.WIDTH / 2, 480);
        }
    }

    /**
     * Render gameplay
     */
    renderGameplay() {
        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.renderObstacle(obstacle);
        });
        
        // Draw carrots
        this.carrots.forEach(carrot => {
            carrot.render(this.ctx);
        });
        
        // Draw player
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // Draw particles
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });
        
        // Draw UI
        this.renderUI();
    }

    /**
     * Render obstacle with warning effect
     */
    renderObstacle(obstacle) {
        // Add warning shadow when obstacle is approaching
        if (this.player) {
            const distanceToPlayer = obstacle.x - (this.player.x + this.player.width);
            if (distanceToPlayer < 200 && distanceToPlayer > 0) {
                this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                this.ctx.fillRect(obstacle.x - 4, obstacle.y - 4, obstacle.width + 8, obstacle.height + 8);
            }
        }
        
        obstacle.render(this.ctx);
    }

    /**
     * Render UI
     */
    renderUI() {
        // Score
        this.ctx.fillStyle = COLOR_PALETTE.TEXT;
        this.ctx.font = 'bold 16px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        
        // Lives
        this.ctx.fillText(`Lives: `, 20, 55);
        for (let i = 0; i < 3; i++) {
            this.ctx.fillStyle = i < this.lives ? COLOR_PALETTE.PLAYER : COLOR_PALETTE.SHADOW;
            this.ctx.fillText('♥', 80 + i * 20, 55);
        }
        
        // Difficulty Level
        this.ctx.fillStyle = COLOR_PALETTE.UI;
        this.ctx.fillText(`Level: ${this.difficultyLevel}`, 20, 80);
        
        // Accuracy
        const accuracy = this.totalCarrots > 0 ? Math.round((this.caughtCarrots / this.totalCarrots) * 100) : 0;
        this.ctx.fillText(`Accuracy: ${accuracy}%`, 20, 105);
        
        // Combo
        if (this.combo > 0) {
            this.ctx.fillStyle = COLOR_PALETTE.CARROT;
            this.ctx.fillText(`Combo: ${this.combo}`, 20, 130);
        }
        
        // Progress bar
        this.renderProgressBar();
    }

    /**
     * Render progress bar
     */
    renderProgressBar() {
        const barWidth = GAME_CONFIG.UI.PROGRESS_BAR_WIDTH;
        const barHeight = GAME_CONFIG.UI.PROGRESS_BAR_HEIGHT;
        const barX = GAME_CONFIG.CANVAS.WIDTH - barWidth - 20;
        const barY = 20;
        
        // Background
        this.ctx.fillStyle = COLOR_PALETTE.SHADOW;
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress
        const progress = Math.min(1, this.score / GAME_CONFIG.UI.PROGRESS_BAR_MAX_SCORE);
        this.ctx.fillStyle = COLOR_PALETTE.UI;
        this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        
        // Border
        this.ctx.strokeStyle = COLOR_PALETTE.TEXT;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Score display
        this.ctx.fillStyle = COLOR_PALETTE.TEXT;
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Score: ${this.score}`, GAME_CONFIG.CANVAS.WIDTH - 20, barY - 5);
    }

    /**
     * Render pause overlay
     */
    renderPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS.WIDTH, GAME_CONFIG.CANVAS.HEIGHT);
        
        this.ctx.fillStyle = COLOR_PALETTE.UI;
        this.ctx.font = 'bold 32px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', GAME_CONFIG.CANVAS.WIDTH / 2, GAME_CONFIG.CANVAS.HEIGHT / 2);
        
        this.ctx.fillStyle = COLOR_PALETTE.TEXT;
        this.ctx.font = '16px monospace';
        this.ctx.fillText('Press SPACE to Resume', GAME_CONFIG.CANVAS.WIDTH / 2, GAME_CONFIG.CANVAS.HEIGHT / 2 + 40);
    }

    /**
     * Render hit pause overlay
     */
    renderHitPauseOverlay() {
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS.WIDTH, GAME_CONFIG.CANVAS.HEIGHT);
        
        this.ctx.fillStyle = COLOR_PALETTE.PLAYER;
        this.ctx.font = 'bold 36px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('HIT!', GAME_CONFIG.CANVAS.WIDTH / 2, GAME_CONFIG.CANVAS.HEIGHT / 2 - 40);
        
        this.ctx.fillStyle = COLOR_PALETTE.TEXT;
        this.ctx.font = '24px monospace';
        this.ctx.fillText(`Lives Remaining: ${this.lives}`, GAME_CONFIG.CANVAS.WIDTH / 2, GAME_CONFIG.CANVAS.HEIGHT / 2);
        
        this.ctx.fillStyle = COLOR_PALETTE.UI;
        this.ctx.font = 'bold 18px monospace';
        this.ctx.fillText('Press SPACE to Continue', GAME_CONFIG.CANVAS.WIDTH / 2, GAME_CONFIG.CANVAS.HEIGHT / 2 + 50);
        
        this.ctx.fillStyle = COLOR_PALETTE.TEXT;
        this.ctx.font = '16px monospace';
        this.ctx.fillText('Lives: ', GAME_CONFIG.CANVAS.WIDTH / 2 - 40, GAME_CONFIG.CANVAS.HEIGHT / 2 + 80);
        for (let i = 0; i < 3; i++) {
            this.ctx.fillStyle = i < this.lives ? COLOR_PALETTE.PLAYER : COLOR_PALETTE.SHADOW;
            this.ctx.fillText('♥', GAME_CONFIG.CANVAS.WIDTH / 2 - 20 + i * 20, GAME_CONFIG.CANVAS.HEIGHT / 2 + 80);
        }
    }

    /**
     * Render game over screen
     */
    renderGameOverScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS.WIDTH, GAME_CONFIG.CANVAS.HEIGHT);
        
        this.ctx.fillStyle = COLOR_PALETTE.PLAYER;
        this.ctx.font = 'bold 36px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', GAME_CONFIG.CANVAS.WIDTH / 2, 200);
        
        this.ctx.fillStyle = COLOR_PALETTE.TEXT;
        this.ctx.font = '18px monospace';
        this.ctx.fillText(`Final Score: ${this.score}`, GAME_CONFIG.CANVAS.WIDTH / 2, 250);
        this.ctx.fillText(`Highest Level: ${this.difficultyLevel}`, GAME_CONFIG.CANVAS.WIDTH / 2, 280);
        
        const accuracy = this.totalCarrots > 0 ? Math.round((this.caughtCarrots / this.totalCarrots) * 100) : 0;
        this.ctx.fillText(`Accuracy: ${accuracy}%`, GAME_CONFIG.CANVAS.WIDTH / 2, 310);
        this.ctx.fillText(`Max Combo: ${this.maxCombo}`, GAME_CONFIG.CANVAS.WIDTH / 2, 340);
        
        if (this.bestScore > 0) {
            this.ctx.fillStyle = COLOR_PALETTE.CARROT;
            this.ctx.fillText(`Best Score: ${this.bestScore}`, GAME_CONFIG.CANVAS.WIDTH / 2, 380);
        }
        
        this.ctx.fillStyle = COLOR_PALETTE.UI;
        this.ctx.font = 'bold 16px monospace';
        this.ctx.fillText('Press SPACE to Play Again', GAME_CONFIG.CANVAS.WIDTH / 2, 450);
        
        this.ctx.fillStyle = COLOR_PALETTE.TEXT;
        this.ctx.font = '12px monospace';
        this.ctx.fillText('M: Mute | C: CRT Effect', GAME_CONFIG.CANVAS.WIDTH / 2, 500);
    }

    /**
     * Main game loop
     */
    gameLoop() {
        const now = Date.now();
        this.deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        this.performanceMonitor.update(now);
        this.update(this.deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.inputManager.cleanup();
        this.carrots = [];
        this.obstacles = [];
        this.particles = [];
    }

    /**
     * Public API methods for integration
     */
    getScore() {
        return this.score;
    }

    getLives() {
        return this.lives;
    }

    getState() {
        return this.state;
    }

    pause() {
        this.pauseGame();
    }

    resume() {
        this.resumeGame();
    }

    reset() {
        this.resetGame();
    }
}
