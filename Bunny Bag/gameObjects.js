/**
 * Game Objects
 * Classes for game entities and objects
 */

import { GAME_CONFIG, COLOR_PALETTE } from './config.js';
import { MathUtils, CollisionUtils } from './utils.js';

/**
 * Base game object class
 */
export class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
    }

    update(deltaTime) {
        // Override in subclasses
    }

    render(ctx) {
        // Override in subclasses
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    isCollidingWith(other) {
        return CollisionUtils.checkRectCollision(this.getBounds(), other.getBounds());
    }
}

/**
 * Player character class
 */
export class Player extends GameObject {
    constructor(x, y) {
        super(x, y, GAME_CONFIG.PLAYER.WIDTH, GAME_CONFIG.PLAYER.HEIGHT);
        this.speed = GAME_CONFIG.PLAYER.SPEED;
        this.velocityY = 0;
        this.onGround = true;
        this.canJump = true;
        this.direction = 0; // -1 left, 0 none, 1 right
    }

    update(deltaTime) {
        // Apply gravity and jump physics
        if (!this.onGround) {
            this.velocityY += GAME_CONFIG.PLAYER.GRAVITY;
            this.y += this.velocityY;
            
            // Check ground collision
            if (this.y >= GAME_CONFIG.PLAYER.GROUND_Y - this.height) {
                this.y = GAME_CONFIG.PLAYER.GROUND_Y - this.height;
                this.velocityY = 0;
                this.onGround = true;
                this.canJump = true;
            }
        }
        
        // Keep player in bounds
        this.x = MathUtils.clamp(this.x, 0, GAME_CONFIG.CANVAS.WIDTH - this.width);
    }

    jump() {
        if (this.canJump && this.onGround) {
            this.velocityY = -GAME_CONFIG.PLAYER.JUMP_POWER;
            this.onGround = false;
            this.canJump = false;
        }
    }

    move(direction) {
        this.direction = direction;
        this.x += direction * this.speed;
    }

    render(ctx) {
        this.renderBag(ctx);
        this.renderBunny(ctx);
    }

    renderBag(ctx) {
        const bagX = this.x + (this.width - GAME_CONFIG.BAG.WIDTH) / 2;
        const bagY = this.y - GAME_CONFIG.BAG.HEIGHT;
        
        // Draw bag
        ctx.fillStyle = COLOR_PALETTE.BAG;
        ctx.fillRect(bagX, bagY, GAME_CONFIG.BAG.WIDTH, GAME_CONFIG.BAG.HEIGHT);
        
        // Draw bag opening
        ctx.fillStyle = COLOR_PALETTE.SHADOW;
        ctx.fillRect(bagX + 2, bagY + 2, GAME_CONFIG.BAG.WIDTH - 4, GAME_CONFIG.BAG.HEIGHT - 4);
        
        // Draw bag straps
        ctx.fillStyle = COLOR_PALETTE.SHADOW;
        ctx.fillRect(bagX + 4, bagY - 4, 2, 4);
        ctx.fillRect(bagX + GAME_CONFIG.BAG.WIDTH - 6, bagY - 4, 2, 4);
    }

    renderBunny(ctx) {
        // Draw rabbit body
        ctx.fillStyle = COLOR_PALETTE.PLAYER;
        ctx.fillRect(this.x + 4, this.y + 8, 24, 24);
        
        // Draw rabbit head
        ctx.fillStyle = COLOR_PALETTE.PLAYER;
        ctx.fillRect(this.x + 6, this.y + 2, 20, 16);
        
        // Draw ears
        this.renderEars(ctx);
        
        // Draw face
        this.renderFace(ctx);
        
        // Draw limbs
        this.renderLimbs(ctx);
        
        // Draw tail
        ctx.fillStyle = COLOR_PALETTE.BUNNY_PINK;
        ctx.fillRect(this.x + 14, this.y + 26, 4, 4);
    }

    renderEars(ctx) {
        ctx.fillStyle = COLOR_PALETTE.PLAYER;
        
        if (!this.onGround) {
            // Jumping - ears bounce up
            ctx.fillRect(this.x + 8, this.y - 8, 3, 8);
            ctx.fillRect(this.x + 21, this.y - 8, 3, 8);
        } else if (this.direction !== 0) {
            // Moving - ears tilt
            if (this.direction === -1) {
                ctx.fillRect(this.x + 6, this.y - 6, 3, 8);
                ctx.fillRect(this.x + 19, this.y - 6, 3, 8);
            } else {
                ctx.fillRect(this.x + 10, this.y - 6, 3, 8);
                ctx.fillRect(this.x + 23, this.y - 6, 3, 8);
            }
        } else {
            // Normal ears
            ctx.fillRect(this.x + 8, this.y - 6, 3, 8);
            ctx.fillRect(this.x + 21, this.y - 6, 3, 8);
        }
        
        // Draw inner ears
        ctx.fillStyle = COLOR_PALETTE.BUNNY_PINK;
        ctx.fillRect(this.x + 9, this.y - 4, 1, 4);
        ctx.fillRect(this.x + 22, this.y - 4, 1, 4);
    }

    renderFace(ctx) {
        // Draw eyes
        ctx.fillStyle = COLOR_PALETTE.SHADOW;
        ctx.fillRect(this.x + 10, this.y + 6, 2, 2);
        ctx.fillRect(this.x + 20, this.y + 6, 2, 2);
        
        // Draw eye highlights
        ctx.fillStyle = COLOR_PALETTE.TEXT;
        ctx.fillRect(this.x + 11, this.y + 7, 1, 1);
        ctx.fillRect(this.x + 21, this.y + 7, 1, 1);
        
        // Draw nose
        ctx.fillStyle = COLOR_PALETTE.BUNNY_NOSE;
        ctx.fillRect(this.x + 15, this.y + 10, 2, 1);
        
        // Draw mouth
        ctx.fillStyle = COLOR_PALETTE.SHADOW;
        ctx.fillRect(this.x + 14, this.y + 12, 4, 1);
        
        // Draw whiskers
        ctx.fillStyle = COLOR_PALETTE.SHADOW;
        ctx.fillRect(this.x + 8, this.y + 11, 6, 1);
        ctx.fillRect(this.x + 18, this.y + 11, 6, 1);
    }

    renderLimbs(ctx) {
        // Draw arms
        ctx.fillStyle = COLOR_PALETTE.PLAYER;
        ctx.fillRect(this.x + 2, this.y + 12, 4, 8);
        ctx.fillRect(this.x + 26, this.y + 12, 4, 8);
        
        // Draw legs
        ctx.fillStyle = COLOR_PALETTE.PLAYER;
        ctx.fillRect(this.x + 8, this.y + 28, 6, 4);
        ctx.fillRect(this.x + 18, this.y + 28, 6, 4);
        
        // Draw feet
        ctx.fillStyle = COLOR_PALETTE.BUNNY_PINK;
        ctx.fillRect(this.x + 7, this.y + 30, 8, 2);
        ctx.fillRect(this.x + 17, this.y + 30, 8, 2);
    }
}

/**
 * Carrot class
 */
export class Carrot extends GameObject {
    constructor(x, y, speed) {
        super(x, y, GAME_CONFIG.CARROT.SIZE, GAME_CONFIG.CARROT.SIZE);
        this.speed = speed;
        this.rotation = 0;
    }

    update(deltaTime) {
        this.y += this.speed * deltaTime * 0.1;
    }

    render(ctx) {
        // Draw detailed pixel art carrot based on custom design
        this.renderCarrotBody(ctx);
        this.renderCarrotTop(ctx);
    }

    renderCarrotBody(ctx) {
        // Main carrot body with shading
        const x = this.x;
        const y = this.y;
        
        // Base orange color
        ctx.fillStyle = '#FF8C00'; // Orange
        ctx.fillRect(x + 2, y + 8, 12, 8);
        
        // Darker orange shading for depth
        ctx.fillStyle = '#FF7F00'; // Darker orange
        ctx.fillRect(x + 3, y + 9, 10, 6);
        ctx.fillRect(x + 4, y + 10, 8, 4);
        
        // Lighter orange highlights
        ctx.fillStyle = '#FFA500'; // Lighter orange
        ctx.fillRect(x + 1, y + 8, 2, 8);
        ctx.fillRect(x + 13, y + 8, 2, 8);
        
        // Carrot tip
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(x + 6, y + 16, 4, 2);
        ctx.fillRect(x + 7, y + 18, 2, 1);
    }

    renderCarrotTop(ctx) {
        const x = this.x;
        const y = this.y;
        
        // Main green leafy top
        ctx.fillStyle = '#32CD32'; // Lime green
        ctx.fillRect(x + 4, y + 2, 8, 6);
        
        // Darker green for depth
        ctx.fillStyle = '#228B22'; // Forest green
        ctx.fillRect(x + 5, y + 3, 6, 4);
        
        // Individual leaf structures
        ctx.fillStyle = '#32CD32';
        // Left leaf
        ctx.fillRect(x + 2, y + 1, 3, 4);
        ctx.fillRect(x + 1, y + 2, 2, 2);
        
        // Right leaf
        ctx.fillRect(x + 11, y + 1, 3, 4);
        ctx.fillRect(x + 13, y + 2, 2, 2);
        
        // Center leaves
        ctx.fillRect(x + 5, y, 2, 3);
        ctx.fillRect(x + 9, y, 2, 3);
        
        // Small tendrils/wisps
        ctx.fillStyle = '#90EE90'; // Light green
        ctx.fillRect(x + 6, y - 1, 1, 2);
        ctx.fillRect(x + 9, y - 1, 1, 2);
        ctx.fillRect(x + 7, y - 2, 1, 1);
        ctx.fillRect(x + 8, y - 2, 1, 1);
    }

    isOffScreen() {
        return this.y > GAME_CONFIG.CANVAS.HEIGHT - 20;
    }
}

/**
 * Obstacle class
 */
export class Obstacle extends GameObject {
    constructor(x, y, speed, type = 'log') {
        super(x, y, GAME_CONFIG.OBSTACLE.WIDTH, GAME_CONFIG.OBSTACLE.HEIGHT);
        this.speed = speed;
        this.type = type;
    }

    update(deltaTime) {
        this.x -= this.speed;
    }

    render(ctx) {
        if (this.type === 'log') {
            this.renderLog(ctx);
        } else if (this.type === 'rock') {
            this.renderRock(ctx);
        }
    }

    renderLog(ctx) {
        // Draw log
        ctx.fillStyle = COLOR_PALETTE.OBSTACLE;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Log texture
        ctx.fillStyle = COLOR_PALETTE.OBSTACLE_TOP;
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 4);
        ctx.fillRect(this.x + 2, this.y + 8, this.width - 4, 2);
        ctx.fillRect(this.x + 2, this.y + 14, this.width - 4, 2);
    }

    renderRock(ctx) {
        // Draw rock
        ctx.fillStyle = COLOR_PALETTE.SHADOW;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Rock texture
        ctx.fillStyle = COLOR_PALETTE.OBSTACLE;
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        
        // Rock details
        ctx.fillStyle = COLOR_PALETTE.OBSTACLE_TOP;
        ctx.fillRect(this.x + 4, this.y + 4, 4, 4);
        ctx.fillRect(this.x + 12, this.y + 8, 4, 4);
        ctx.fillRect(this.x + 8, this.y + 16, 4, 4);
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

/**
 * Particle class
 */
export class Particle extends GameObject {
    constructor(x, y, vx, vy, life, color) {
        super(x, y, 2, 2);
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime * 0.1;
        this.y += this.vy * deltaTime * 0.1;
        this.life -= deltaTime;
    }

    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}
