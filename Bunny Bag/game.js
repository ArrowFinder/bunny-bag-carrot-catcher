/**
 * Bunny Bag — Carrot Catcher
 * A retro 8-bit HTML5 Canvas game
 * 
 * Game Engine and Core Logic
 */

// Game Constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 32;
const CARROT_SIZE = 16;
const BAG_WIDTH = 40;
const BAG_HEIGHT = 20;
const GROUND_Y = GAME_HEIGHT - 20;
const JUMP_POWER = 14;  // Slightly higher jump for better obstacle clearance
const GRAVITY = 0.5;    // Slightly less gravity for longer air time
const OBSTACLE_WIDTH = 24;
const OBSTACLE_HEIGHT = 32;

// Color Palette (8-bit retro)
const COLORS = {
    background: '#1a1a2e',
    player: '#ff6b6b',
    carrot: '#ffa500',
    bag: '#8b4513',
    text: '#ffffff',
    ui: '#00ff00',
    shadow: '#000000',
    ground: '#4a4a6a',
    obstacle: '#8B4513',
    obstacleTop: '#A0522D'
};

// Game States
const GAME_STATES = {
    TITLE: 'title',
    PLAYING: 'playing',
    PAUSED: 'paused',
    HIT_PAUSE: 'hitPause',
    GAME_OVER: 'gameOver'
};

// Score-based progression thresholds (10 points per carrot)
const SCORE_THRESHOLDS = {
    // Score thresholds for difficulty increases
    OBSTACLES_START: 100,  // Obstacles start appearing (10 carrots)
    SPEED_INCREASE: 200,   // First speed increase (20 carrots)
    MULTI_SPAWN_START: 300, // Multi-spawn events start (30 carrots)
    RAPID_INCREASE: 500    // Rapid difficulty scaling (50 carrots)
};

// Base difficulty configuration
const BASE_CONFIG = {
    spawnInterval: 2000,
    fallSpeed: 2,
    multiSpawn: 0,
    obstacles: false,
    obstacleSpawn: 0,
    obstacleSpeed: 2.5  // Slower base speed for jumpable obstacles
};

/**
 * Main Game Class
 */
class BunnyBagGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.crtOverlay = document.getElementById('crtOverlay');
        
        // Game State
        this.state = GAME_STATES.TITLE;
        this.score = 0;
        this.lives = 3;
        this.difficultyProgress = 0;
        this.caughtCarrots = 0;
        this.totalCarrots = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.bestScore = parseInt(localStorage.getItem('bunnyBagBestScore') || '0');
        
        // Hit pause state
        this.hitPauseTime = 0;
        
        // Player
        this.player = {
            x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
            y: GROUND_Y - PLAYER_HEIGHT,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            speed: 4,
            direction: 0, // -1 left, 0 none, 1 right
            velocityY: 0,
            onGround: true,
            canJump: true
        };
        
        // Game Objects
        this.carrots = [];
        this.obstacles = [];
        this.particles = [];
        
        // Timing
        this.lastSpawnTime = 0;
        this.lastObstacleSpawnTime = 0;
        this.gameTime = 0;
        this.hitPauseTime = 0;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        
        // Settings
        this.muted = false;
        this.crtEnabled = false;
        
        // Input
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyPress(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleKeyPress(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.handleSpaceKey();
                break;
            case 'KeyM':
                this.toggleMute();
                break;
            case 'KeyC':
                this.toggleCRT();
                break;
            case 'ArrowUp':
            case 'KeyW':
                e.preventDefault();
                this.handleJump();
                break;
        }
    }
    
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
    
    toggleMute() {
        this.muted = !this.muted;
        // Sound implementation would go here
    }
    
    toggleCRT() {
        this.crtEnabled = !this.crtEnabled;
        this.crtOverlay.classList.toggle('active', this.crtEnabled);
    }
    
    handleJump() {
        if (this.state === GAME_STATES.PLAYING && this.player.canJump && this.player.onGround) {
            this.player.velocityY = -JUMP_POWER;
            this.player.onGround = false;
            this.player.canJump = false;
        }
    }
    
    startGame() {
        this.state = GAME_STATES.PLAYING;
        this.resetGame();
    }
    
    pauseGame() {
        this.state = GAME_STATES.PAUSED;
    }
    
    resumeGame() {
        this.state = GAME_STATES.PLAYING;
    }
    
    resumeFromHit() {
        this.state = GAME_STATES.PLAYING;
        this.hitPauseTime = 0;
    }
    
    restartGame() {
        this.state = GAME_STATES.TITLE;
        this.resetGame();
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.difficultyProgress = 0;
        this.caughtCarrots = 0;
        this.totalCarrots = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.carrots = [];
        this.obstacles = [];
        this.particles = [];
        this.player.x = GAME_WIDTH / 2 - PLAYER_WIDTH / 2;
        this.player.y = GROUND_Y - PLAYER_HEIGHT;
        this.player.velocityY = 0;
        this.player.onGround = true;
        this.player.canJump = true;
        this.lastSpawnTime = 0;
        this.lastObstacleSpawnTime = 0;
        this.gameTime = 0;
        this.hitPauseTime = 0;
    }
    
    gameOver() {
        this.state = GAME_STATES.GAME_OVER;
        
        // Update best scores
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bunnyBagBestScore', this.bestScore.toString());
        }
        
        if (this.stage > this.highestStage) {
            this.highestStage = this.stage;
            localStorage.setItem('bunnyBagHighestStage', this.highestStage.toString());
        }
    }
    
    update(deltaTime) {
        if (this.state !== GAME_STATES.PLAYING) return;
        
        this.gameTime += deltaTime;
        
        // Update player movement
        this.updatePlayer(deltaTime);
        
        // Update carrots
        this.updateCarrots(deltaTime);
        
        // Update obstacles
        this.updateObstacles(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Spawn carrots
        this.spawnCarrots();
        
        // Spawn obstacles
        this.spawnObstacles();
        
        // Update difficulty progression
        this.updateDifficultyProgression();
    }
    
    updatePlayer(deltaTime) {
        // Handle input
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.direction = -1;
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.direction = 1;
        } else {
            this.player.direction = 0;
        }
        
        // Move player horizontally
        this.player.x += this.player.direction * this.player.speed;
        
        // Apply gravity and jump physics
        if (!this.player.onGround) {
            this.player.velocityY += GRAVITY;
            this.player.y += this.player.velocityY;
            
            // Check ground collision
            if (this.player.y >= GROUND_Y - this.player.height) {
                this.player.y = GROUND_Y - this.player.height;
                this.player.velocityY = 0;
                this.player.onGround = true;
                this.player.canJump = true;
            }
        }
        
        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(GAME_WIDTH - this.player.width, this.player.x));
    }
    
    updateCarrots(deltaTime) {
        const config = this.getDifficultyConfig();
        
        for (let i = this.carrots.length - 1; i >= 0; i--) {
            const carrot = this.carrots[i];
            
            // Fall straight down (no wind effects)
            carrot.y += carrot.speed * deltaTime * 0.1;
            
            // Check collision with player
            if (this.checkCollision(carrot, this.player)) {
                this.catchCarrot(carrot, i);
                continue;
            }
            
            // Check if carrot hit ground (no longer causes life loss)
            if (carrot.y > GAME_HEIGHT - 20) {
                this.groundCarrot(carrot, i);
            }
        }
    }
    
    updateObstacles(deltaTime) {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            // Move obstacle left
            obstacle.x -= obstacle.speed;
            
            // Check collision with player
            if (this.checkObstacleCollision(obstacle, this.player)) {
                this.hitObstacle(obstacle, i);
                continue;
            }
            
            // Remove obstacle if off screen
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx * deltaTime * 0.1;
            particle.y += particle.vy * deltaTime * 0.1;
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    spawnCarrots() {
        const config = this.getDifficultyConfig();
        const now = Date.now();
        
        if (now - this.lastSpawnTime > config.spawnInterval) {
            // Regular spawn
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
    
    spawnObstacles() {
        const config = this.getDifficultyConfig();
        
        if (!config.obstacles) return;
        
        const now = Date.now();
        // Longer spawn interval to give players time to react and jump
        const obstacleSpawnInterval = 4000; // Base spawn interval for obstacles
        
        if (now - this.lastObstacleSpawnTime > obstacleSpawnInterval) {
            if (Math.random() < config.obstacleSpawn) {
                this.createObstacle();
                this.lastObstacleSpawnTime = now;
            }
        }
    }
    
    createCarrot() {
        const config = this.getDifficultyConfig();
        
        // More strategic carrot positioning based on score
        let x;
        if (this.score < 200) {
            // Early game: more random positioning
            x = Math.random() * (GAME_WIDTH - CARROT_SIZE);
        } else if (this.score < 500) {
            // Mid game: some clustering to create patterns
            if (this.carrots.length > 0) {
                const lastCarrot = this.carrots[this.carrots.length - 1];
                const offset = (Math.random() - 0.5) * 150; // Vary from last carrot
                x = Math.max(0, Math.min(GAME_WIDTH - CARROT_SIZE, lastCarrot.x + offset));
            } else {
                x = Math.random() * (GAME_WIDTH - CARROT_SIZE);
            }
        } else {
            // Late game: more challenging patterns
            if (this.carrots.length > 0) {
                const lastCarrot = this.carrots[this.carrots.length - 1];
                const offset = (Math.random() - 0.5) * 200; // More variation
                x = Math.max(0, Math.min(GAME_WIDTH - CARROT_SIZE, lastCarrot.x + offset));
            } else {
                x = Math.random() * (GAME_WIDTH - CARROT_SIZE);
            }
        }
        
        const carrot = {
            x: x,
            y: -CARROT_SIZE,
            width: CARROT_SIZE,
            height: CARROT_SIZE,
            speed: config.fallSpeed + (Math.random() - 0.5) * 0.3, // Less speed variation
            rotation: 0
        };
        
        this.carrots.push(carrot);
        this.totalCarrots++;
    }
    
    createObstacle() {
        const config = this.getDifficultyConfig();
        const obstacle = {
            x: GAME_WIDTH,
            y: GROUND_Y - OBSTACLE_HEIGHT,
            width: OBSTACLE_WIDTH,
            height: OBSTACLE_HEIGHT,
            speed: config.obstacleSpeed,
            type: Math.random() < 0.7 ? 'log' : 'rock' // Different obstacle types
        };
        
        this.obstacles.push(obstacle);
    }
    
    checkCollision(carrot, player) {
        const bagX = player.x + (player.width - BAG_WIDTH) / 2;
        const bagY = player.y - BAG_HEIGHT;
        
        return carrot.x < bagX + BAG_WIDTH &&
               carrot.x + carrot.width > bagX &&
               carrot.y < bagY + BAG_HEIGHT &&
               carrot.y + carrot.height > bagY;
    }
    
    checkObstacleCollision(obstacle, player) {
        return player.x < obstacle.x + obstacle.width &&
               player.x + player.width > obstacle.x &&
               player.y < obstacle.y + obstacle.height &&
               player.y + player.height > obstacle.y;
    }
    
    catchCarrot(carrot, index) {
        // Remove carrot
        this.carrots.splice(index, 1);
        
        // Update score and stats
        this.score += 10;
        this.caughtCarrots++;
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        // Add difficulty progress bonus for combo
        this.difficultyProgress += 1 + (this.combo * 0.1);
        
        // Create catch particles
        this.createCatchParticles(carrot.x + carrot.width / 2, carrot.y + carrot.height / 2);
        
        // Play catch sound (would be implemented here)
        if (!this.muted) {
            // playCatchSound();
        }
    }
    
    groundCarrot(carrot, index) {
        // Remove carrot
        this.carrots.splice(index, 1);
        
        // Reset combo (but don't lose life)
        this.combo = 0;
        
        // Create ground hit particles (different from miss particles)
        this.createGroundParticles(carrot.x + carrot.width / 2, carrot.y + carrot.height / 2);
        
        // Play ground hit sound (would be implemented here)
        if (!this.muted) {
            // playGroundSound();
        }
    }
    
    hitObstacle(obstacle, index) {
        // Remove obstacle
        this.obstacles.splice(index, 1);
        
        // Reset combo
        this.combo = 0;
        
        // Lose life
        this.lives--;
        
        // Create hit particles
        this.createHitParticles(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
        
        // Enter hit pause state
        this.state = GAME_STATES.HIT_PAUSE;
        this.hitPauseTime = Date.now();
        
        // Check game over
        if (this.lives <= 0) {
            this.gameOver();
        }
        
        // Play hit sound (would be implemented here)
        if (!this.muted) {
            // playHitSound();
        }
    }
    
    createCatchParticles(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4 - 2,
                life: 1000,
                color: COLORS.carrot
            });
        }
    }
    
    createGroundParticles(x, y) {
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 500,
                color: COLORS.ground  // Use ground color for ground hit particles
            });
        }
    }
    
    getDifficultyConfig() {
        const config = { ...BASE_CONFIG };
        
        // Calculate difficulty based on score
        const score = this.score;
        
        // Obstacles start at score 100
        if (score >= SCORE_THRESHOLDS.OBSTACLES_START) {
            config.obstacles = true;
            config.obstacleSpawn = Math.min(0.3, 0.05 + (score - SCORE_THRESHOLDS.OBSTACLES_START) * 0.001);
            // Keep obstacle speed reasonable for jumping - max 4.5 speed
            config.obstacleSpeed = Math.min(4.5, 2.5 + (score - SCORE_THRESHOLDS.OBSTACLES_START) * 0.01);
        }
        
        // Speed increases start at score 50
        if (score >= SCORE_THRESHOLDS.SPEED_INCREASE) {
            const speedMultiplier = 1 + (score - SCORE_THRESHOLDS.SPEED_INCREASE) * 0.01;
            config.fallSpeed = Math.min(8, BASE_CONFIG.fallSpeed * speedMultiplier);
            config.spawnInterval = Math.max(300, BASE_CONFIG.spawnInterval / speedMultiplier);
        }
        
        // Multi-spawn starts at score 80
        if (score >= SCORE_THRESHOLDS.MULTI_SPAWN_START) {
            config.multiSpawn = Math.min(0.5, (score - SCORE_THRESHOLDS.MULTI_SPAWN_START) * 0.003);
        }
        
        // Rapid increase after score 500
        if (score >= SCORE_THRESHOLDS.RAPID_INCREASE) {
            const rapidMultiplier = 1 + (score - SCORE_THRESHOLDS.RAPID_INCREASE) * 0.01;
            config.fallSpeed = Math.min(12, config.fallSpeed * rapidMultiplier);
            config.spawnInterval = Math.max(200, config.spawnInterval / rapidMultiplier);
            // Keep obstacle speed jumpable even at high scores - max 5.5
            config.obstacleSpeed = Math.min(5.5, config.obstacleSpeed * rapidMultiplier);
            config.obstacleSpawn = Math.min(0.4, config.obstacleSpawn * rapidMultiplier);
        }
        
        return config;
    }
    
    updateDifficultyProgression() {
        // No level system - difficulty scales purely with score
        // Particles are created when crossing major score thresholds
        const majorThresholds = [100, 200, 300, 500, 750, 1000];
        for (const threshold of majorThresholds) {
            if (this.score >= threshold && this.score - 10 < threshold) {
                this.createStageUpParticles();
                break;
            }
        }
    }
    
    createHitParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6 - 3,
                life: 800,
                color: COLORS.shadow
            });
        }
    }
    
    createStageUpParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: GAME_WIDTH / 2,
                y: GAME_HEIGHT / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 2000,
                color: COLORS.ui
            });
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = COLORS.background;
        this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Draw ground
        this.ctx.fillStyle = COLORS.ground;
        this.ctx.fillRect(0, GAME_HEIGHT - 20, GAME_WIDTH, 20);
        
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
    
    renderTitleScreen() {
        // Title
        this.ctx.fillStyle = COLORS.ui;
        this.ctx.font = 'bold 48px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('BUNNY BAG', GAME_WIDTH / 2, 150);
        
        this.ctx.font = 'bold 24px monospace';
        this.ctx.fillText('Carrot Catcher', GAME_WIDTH / 2, 190);
        
        // Subtitle
        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = '16px monospace';
        this.ctx.fillText('Pure Skill Progression • No Currencies • No IAP', GAME_WIDTH / 2, 250);
        
        // Instructions
        this.ctx.font = '14px monospace';
        this.ctx.fillText('Catch falling carrots with your bag!', GAME_WIDTH / 2, 300);
        this.ctx.fillText('Each carrot = 10 points!', GAME_WIDTH / 2, 320);
        this.ctx.fillText('Carrots fall straight down - timing is key!', GAME_WIDTH / 2, 340);
        this.ctx.fillText('Only lose lives when hit by obstacles!', GAME_WIDTH / 2, 360);
        
        // Controls
        this.ctx.fillStyle = COLORS.ui;
        this.ctx.font = 'bold 16px monospace';
        this.ctx.fillText('Press SPACE to Start', GAME_WIDTH / 2, 420);
        
        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = '12px monospace';
        this.ctx.fillText('← → Move | ↑ Jump | M: Mute | C: CRT Effect', GAME_WIDTH / 2, 450);
        
        // Best score
        if (this.bestScore > 0) {
            this.ctx.fillStyle = COLORS.carrot;
            this.ctx.font = '14px monospace';
            this.ctx.fillText(`Best Score: ${this.bestScore}`, GAME_WIDTH / 2, 480);
        }
    }
    
    renderGameplay() {
        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.renderObstacle(obstacle);
        });
        
        // Draw carrots
        this.ctx.fillStyle = COLORS.carrot;
        this.carrots.forEach(carrot => {
            this.ctx.fillRect(carrot.x, carrot.y, carrot.width, carrot.height);
            
            // Simple carrot shape
            this.ctx.fillStyle = '#228B22';
            this.ctx.fillRect(carrot.x + 6, carrot.y - 4, 4, 8);
            this.ctx.fillStyle = COLORS.carrot;
        });
        
        // Draw player
        this.renderPlayer();
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, 2, 2);
        });
        
        // Draw UI
        this.renderUI();
    }
    
    renderPlayer() {
        // Draw bag
        this.ctx.fillStyle = COLORS.bag;
        const bagX = this.player.x + (this.player.width - BAG_WIDTH) / 2;
        const bagY = this.player.y - BAG_HEIGHT;
        this.ctx.fillRect(bagX, bagY, BAG_WIDTH, BAG_HEIGHT);
        
        // Draw bag opening
        this.ctx.fillStyle = COLORS.shadow;
        this.ctx.fillRect(bagX + 2, bagY + 2, BAG_WIDTH - 4, BAG_HEIGHT - 4);
        
        // Draw bag straps
        this.ctx.fillStyle = COLORS.shadow;
        this.ctx.fillRect(bagX + 4, bagY - 4, 2, 4); // Left strap
        this.ctx.fillRect(bagX + BAG_WIDTH - 6, bagY - 4, 2, 4); // Right strap
        
        // Draw rabbit body
        this.ctx.fillStyle = COLORS.player;
        this.ctx.fillRect(this.player.x + 4, this.player.y + 8, 24, 24);
        
        // Draw rabbit head
        this.ctx.fillStyle = COLORS.player;
        this.ctx.fillRect(this.player.x + 6, this.player.y + 2, 20, 16);
        
        // Draw ears
        this.ctx.fillStyle = COLORS.player;
        this.ctx.fillRect(this.player.x + 8, this.player.y - 6, 3, 8); // Left ear
        this.ctx.fillRect(this.player.x + 21, this.player.y - 6, 3, 8); // Right ear
        
        // Draw inner ears
        this.ctx.fillStyle = '#ffb6c1'; // Light pink
        this.ctx.fillRect(this.player.x + 9, this.player.y - 4, 1, 4); // Left inner ear
        this.ctx.fillRect(this.player.x + 22, this.player.y - 4, 1, 4); // Right inner ear
        
        // Draw eyes
        this.ctx.fillStyle = COLORS.shadow;
        this.ctx.fillRect(this.player.x + 10, this.player.y + 6, 2, 2); // Left eye
        this.ctx.fillRect(this.player.x + 20, this.player.y + 6, 2, 2); // Right eye
        
        // Draw eye highlights
        this.ctx.fillStyle = COLORS.text;
        this.ctx.fillRect(this.player.x + 11, this.player.y + 7, 1, 1); // Left highlight
        this.ctx.fillRect(this.player.x + 21, this.player.y + 7, 1, 1); // Right highlight
        
        // Draw nose
        this.ctx.fillStyle = '#ff69b4'; // Hot pink
        this.ctx.fillRect(this.player.x + 15, this.player.y + 10, 2, 1);
        
        // Draw mouth
        this.ctx.fillStyle = COLORS.shadow;
        this.ctx.fillRect(this.player.x + 14, this.player.y + 12, 4, 1);
        
        // Draw whiskers
        this.ctx.fillStyle = COLORS.shadow;
        this.ctx.fillRect(this.player.x + 8, this.player.y + 11, 6, 1); // Left whisker
        this.ctx.fillRect(this.player.x + 18, this.player.y + 11, 6, 1); // Right whisker
        
        // Draw arms
        this.ctx.fillStyle = COLORS.player;
        this.ctx.fillRect(this.player.x + 2, this.player.y + 12, 4, 8); // Left arm
        this.ctx.fillRect(this.player.x + 26, this.player.y + 12, 4, 8); // Right arm
        
        // Draw legs
        this.ctx.fillStyle = COLORS.player;
        this.ctx.fillRect(this.player.x + 8, this.player.y + 28, 6, 4); // Left leg
        this.ctx.fillRect(this.player.x + 18, this.player.y + 28, 6, 4); // Right leg
        
        // Draw feet
        this.ctx.fillStyle = '#ffb6c1'; // Light pink
        this.ctx.fillRect(this.player.x + 7, this.player.y + 30, 8, 2); // Left foot
        this.ctx.fillRect(this.player.x + 17, this.player.y + 30, 8, 2); // Right foot
        
        // Draw tail
        this.ctx.fillStyle = '#ffb6c1'; // Light pink
        this.ctx.fillRect(this.player.x + 14, this.player.y + 26, 4, 4);
        
        // Add some character based on movement
        if (this.player.direction !== 0) {
            // Tilt ears when moving
            this.ctx.fillStyle = COLORS.player;
            if (this.player.direction === -1) {
                // Moving left - ears lean left
                this.ctx.fillRect(this.player.x + 6, this.player.y - 6, 3, 8);
                this.ctx.fillRect(this.player.x + 19, this.player.y - 6, 3, 8);
            } else {
                // Moving right - ears lean right
                this.ctx.fillRect(this.player.x + 10, this.player.y - 6, 3, 8);
                this.ctx.fillRect(this.player.x + 23, this.player.y - 6, 3, 8);
            }
        }
        
        // Add jumping animation
        if (!this.player.onGround) {
            // Ears bounce up when jumping
            this.ctx.fillStyle = COLORS.player;
            this.ctx.fillRect(this.player.x + 8, this.player.y - 8, 3, 8);
            this.ctx.fillRect(this.player.x + 21, this.player.y - 8, 3, 8);
        }
    }
    
    renderObstacle(obstacle) {
        // Add warning shadow when obstacle is approaching
        const distanceToPlayer = obstacle.x - (this.player.x + this.player.width);
        if (distanceToPlayer < 200 && distanceToPlayer > 0) {
            // Draw warning shadow
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            this.ctx.fillRect(obstacle.x - 4, obstacle.y - 4, obstacle.width + 8, obstacle.height + 8);
        }
        
        if (obstacle.type === 'log') {
            // Draw log
            this.ctx.fillStyle = COLORS.obstacle;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Log texture
            this.ctx.fillStyle = COLORS.obstacleTop;
            this.ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, 4);
            this.ctx.fillRect(obstacle.x + 2, obstacle.y + 8, obstacle.width - 4, 2);
            this.ctx.fillRect(obstacle.x + 2, obstacle.y + 14, obstacle.width - 4, 2);
        } else if (obstacle.type === 'rock') {
            // Draw rock
            this.ctx.fillStyle = COLORS.shadow;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Rock texture
            this.ctx.fillStyle = COLORS.obstacle;
            this.ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, obstacle.height - 4);
            
            // Rock details
            this.ctx.fillStyle = COLORS.obstacleTop;
            this.ctx.fillRect(obstacle.x + 4, obstacle.y + 4, 4, 4);
            this.ctx.fillRect(obstacle.x + 12, obstacle.y + 8, 4, 4);
            this.ctx.fillRect(obstacle.x + 8, obstacle.y + 16, 4, 4);
        }
    }
    
    renderUI() {
        // Score
        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = 'bold 16px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        
        // Lives
        this.ctx.fillText(`Lives: `, 20, 55);
        for (let i = 0; i < 3; i++) {
            this.ctx.fillStyle = i < this.lives ? COLORS.player : COLORS.shadow;
            this.ctx.fillText('♥', 80 + i * 20, 55);
        }
        
        // Score multiplier (for visual interest)
        this.ctx.fillStyle = COLORS.ui;
        this.ctx.fillText(`Points per Carrot: 10`, 20, 80);
        
        // Accuracy
        const accuracy = this.totalCarrots > 0 ? Math.round((this.caughtCarrots / this.totalCarrots) * 100) : 0;
        this.ctx.fillText(`Accuracy: ${accuracy}%`, 20, 105);
        
        // Combo
        if (this.combo > 0) {
            this.ctx.fillStyle = COLORS.carrot;
            this.ctx.fillText(`Combo: ${this.combo}`, 20, 130);
        }
        
        // Stage progress bar
        this.renderStageProgress();
    }
    
    renderStageProgress() {
        const barWidth = 200;
        const barHeight = 8;
        const barX = GAME_WIDTH - barWidth - 20;
        const barY = 20;
        
        // Background
        this.ctx.fillStyle = COLORS.shadow;
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress bar shows current score as a visual indicator
        const maxDisplayScore = 1000; // Scale for display
        const progress = Math.min(1, this.score / maxDisplayScore);
        this.ctx.fillStyle = COLORS.ui;
        this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        
        // Border
        this.ctx.strokeStyle = COLORS.text;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Score display
        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Score: ${this.score}`, GAME_WIDTH - 20, barY - 5);
    }
    
    renderPauseOverlay() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Pause text
        this.ctx.fillStyle = COLORS.ui;
        this.ctx.font = 'bold 32px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', GAME_WIDTH / 2, GAME_HEIGHT / 2);
        
        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = '16px monospace';
        this.ctx.fillText('Press SPACE to Resume', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
    }
    
    renderHitPauseOverlay() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Hit text
        this.ctx.fillStyle = COLORS.player;
        this.ctx.font = 'bold 36px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('HIT!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);
        
        // Lives remaining
        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = '24px monospace';
        this.ctx.fillText(`Lives Remaining: ${this.lives}`, GAME_WIDTH / 2, GAME_HEIGHT / 2);
        
        // Continue instruction
        this.ctx.fillStyle = COLORS.ui;
        this.ctx.font = 'bold 18px monospace';
        this.ctx.fillText('Press SPACE to Continue', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
        
        // Lives display
        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = '16px monospace';
        this.ctx.fillText('Lives: ', GAME_WIDTH / 2 - 40, GAME_HEIGHT / 2 + 80);
        for (let i = 0; i < 3; i++) {
            this.ctx.fillStyle = i < this.lives ? COLORS.player : COLORS.shadow;
            this.ctx.fillText('♥', GAME_WIDTH / 2 - 20 + i * 20, GAME_HEIGHT / 2 + 80);
        }
    }
    
    renderGameOverScreen() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Game Over text
        this.ctx.fillStyle = COLORS.player;
        this.ctx.font = 'bold 36px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', GAME_WIDTH / 2, 200);
        
        // Stats
        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = '18px monospace';
        this.ctx.fillText(`Final Score: ${this.score}`, GAME_WIDTH / 2, 250);
        this.ctx.fillText(`Carrots Caught: ${this.caughtCarrots}`, GAME_WIDTH / 2, 280);
        
        const accuracy = this.totalCarrots > 0 ? Math.round((this.caughtCarrots / this.totalCarrots) * 100) : 0;
        this.ctx.fillText(`Accuracy: ${accuracy}%`, GAME_WIDTH / 2, 310);
        this.ctx.fillText(`Max Combo: ${this.maxCombo}`, GAME_WIDTH / 2, 340);
        
        // Best score
        if (this.bestScore > 0) {
            this.ctx.fillStyle = COLORS.carrot;
            this.ctx.fillText(`Best Score: ${this.bestScore}`, GAME_WIDTH / 2, 380);
        }
        
        // Restart instruction
        this.ctx.fillStyle = COLORS.ui;
        this.ctx.font = 'bold 16px monospace';
        this.ctx.fillText('Press SPACE to Play Again', GAME_WIDTH / 2, 450);
        
        this.ctx.fillStyle = COLORS.text;
        this.ctx.font = '12px monospace';
        this.ctx.fillText('M: Mute | C: CRT Effect', GAME_WIDTH / 2, 500);
    }
    
    gameLoop() {
        const now = Date.now();
        this.deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        this.update(this.deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new BunnyBagGame();
});
