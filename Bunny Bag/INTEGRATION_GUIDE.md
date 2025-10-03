# Bunny Bag Game - Developer Integration Guide

## 🚀 Quick Start Integration

### 1. Basic HTML Integration
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Game Site</title>
    <style>
        #gameContainer {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #1a1a2e;
        }
    </style>
</head>
<body>
    <div id="gameContainer">
        <canvas id="gameCanvas" width="800" height="600"></canvas>
        <div id="crtOverlay"></div>
    </div>
    
    <!-- Include the complete game code -->
    <script>
        // Copy the entire <script> content from index.html here
    </script>
</body>
</html>
```

### 2. Iframe Integration
```html
<iframe 
    src="bunny-bag/index.html" 
    width="800" 
    height="600"
    frameborder="0"
    allowfullscreen>
</iframe>
```

### 3. Module Integration (ES6)
```javascript
// game-module.js
export class BunnyBagGame {
    // Copy the entire class definition here
}

// main.js
import { BunnyBagGame } from './game-module.js';
const game = new BunnyBagGame();
```

## 🎮 Game Customization

### Visual Customization

#### 1. Color Scheme
```javascript
// Modify the COLORS object
const COLORS = {
    background: '#1a1a2e',      // Your brand color
    player: '#ff6b6b',          // Character color
    carrot: '#ffa500',          // Collectible color
    ui: '#00ff00',              // UI accent color
    // ... customize all colors
};
```

#### 2. Character Design
```javascript
// Modify renderBunnyCharacter() method
renderBunnyCharacter() {
    // Customize bunny appearance
    this.ctx.fillStyle = '#YOUR_COLOR';
    this.ctx.fillRect(x, y, width, height);
    // ... add custom details
}
```

#### 3. UI Layout
```javascript
// Modify renderUI() method
renderUI() {
    // Customize HUD layout
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = 'bold 20px monospace';
    this.ctx.fillText(`Score: ${this.score}`, 20, 30);
    // ... add custom UI elements
}
```

### Gameplay Customization

#### 1. Difficulty Scaling
```javascript
// Modify SCORE_THRESHOLDS
const SCORE_THRESHOLDS = {
    OBSTACLES_START: 50,        // Earlier obstacles
    SPEED_INCREASE: 100,        // Earlier speed increase
    MULTI_SPAWN_START: 150,     // Earlier multi-spawn
    RAPID_INCREASE: 300         // Earlier rapid increase
};
```

#### 2. Scoring System
```javascript
// Modify catchCarrot() method
catchCarrot(carrot, index) {
    this.carrots.splice(index, 1);
    this.score += 20; // Change from 10 to 20 points
    this.combo++;
    // ... rest of the method
}
```

#### 3. Power-Up System
```javascript
// Modify hitMysteryBox() method
hitMysteryBox(mysteryBox, index) {
    // Add custom rewards
    const customRewards = [
        () => { this.score += 500; },  // Big bonus
        () => { this.lives += 2; },    // Extra lives
        // ... add more custom rewards
    ];
}
```

## 🔧 Advanced Integration

### 1. Event System Integration
```javascript
// Add custom event system
class BunnyBagGame {
    constructor() {
        this.eventListeners = {};
        // ... existing constructor code
    }
    
    addEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }
    
    // Modify existing methods to emit events
    catchCarrot(carrot, index) {
        // ... existing code
        this.emit('carrotCaught', { score: this.score, combo: this.combo });
    }
}
```

### 2. Analytics Integration
```javascript
// Add analytics tracking
class BunnyBagGame {
    trackEvent(eventName, properties = {}) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
        
        // Custom analytics
        if (typeof customAnalytics !== 'undefined') {
            customAnalytics.track(eventName, properties);
        }
    }
    
    // Add tracking to key events
    startGame() {
        this.state = GAME_STATES.PLAYING;
        this.resetGame();
        this.trackEvent('game_started');
    }
    
    gameOver() {
        this.state = GAME_STATES.GAME_OVER;
        this.trackEvent('game_over', { 
            score: this.score, 
            lives: this.lives,
            duration: this.gameTime 
        });
    }
}
```

### 3. Save System Integration
```javascript
// Add save/load functionality
class BunnyBagGame {
    saveGame() {
        const saveData = {
            score: this.score,
            lives: this.lives,
            difficultyLevel: this.difficultyLevel,
            gameTime: this.gameTime,
            timestamp: Date.now()
        };
        localStorage.setItem('bunnyBagSave', JSON.stringify(saveData));
    }
    
    loadGame() {
        const saveData = localStorage.getItem('bunnyBagSave');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.score = data.score;
            this.lives = data.lives;
            this.difficultyLevel = data.difficultyLevel;
            this.gameTime = data.gameTime;
        }
    }
}
```

## 🎨 Theming System

### 1. Theme Manager
```javascript
class ThemeManager {
    constructor() {
        this.themes = {
            default: {
                background: '#1a1a2e',
                player: '#ff6b6b',
                carrot: '#ffa500',
                // ... default colors
            },
            dark: {
                background: '#000000',
                player: '#ffffff',
                carrot: '#ffff00',
                // ... dark theme colors
            },
            retro: {
                background: '#2d1b69',
                player: '#ff0040',
                carrot: '#00ff41',
                // ... retro theme colors
            }
        };
        this.currentTheme = 'default';
    }
    
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            this.applyTheme();
        }
    }
    
    applyTheme() {
        const theme = this.themes[this.currentTheme];
        Object.assign(COLORS, theme);
    }
}
```

### 2. Dynamic Theme Switching
```javascript
// Add theme switching to the game
class BunnyBagGame {
    constructor() {
        this.themeManager = new ThemeManager();
        // ... existing constructor code
    }
    
    switchTheme(themeName) {
        this.themeManager.setTheme(themeName);
        this.render(); // Re-render with new theme
    }
}
```

## 📱 Mobile Integration

### 1. Touch Controls
```javascript
// Add touch support
class BunnyBagGame {
    setupEventListeners() {
        // ... existing keyboard listeners
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            // Convert touch to game action
            if (x < GAME_WIDTH / 2) {
                this.keys['ArrowLeft'] = true;
            } else {
                this.keys['ArrowRight'] = true;
            }
            
            if (y < GAME_HEIGHT / 2) {
                this.handleJump();
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys = {};
        });
    }
}
```

### 2. Responsive Design
```css
/* Make game responsive */
#gameContainer {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

#gameCanvas {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
}

@media (max-width: 800px) {
    #gameCanvas {
        width: 100vw;
        height: 75vh;
    }
}
```

## 🔌 Plugin System

### 1. Plugin Architecture
```javascript
class GamePlugin {
    constructor(game) {
        this.game = game;
        this.name = 'BasePlugin';
    }
    
    init() {
        // Plugin initialization
    }
    
    update(deltaTime) {
        // Plugin update logic
    }
    
    render() {
        // Plugin rendering
    }
    
    destroy() {
        // Plugin cleanup
    }
}

// Example: Sound Plugin
class SoundPlugin extends GamePlugin {
    constructor(game) {
        super(game);
        this.name = 'SoundPlugin';
        this.sounds = {};
    }
    
    init() {
        // Load sound files
        this.sounds.jump = new Audio('sounds/jump.mp3');
        this.sounds.catch = new Audio('sounds/catch.mp3');
    }
    
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }
}
```

### 2. Plugin Integration
```javascript
class BunnyBagGame {
    constructor() {
        this.plugins = [];
        // ... existing constructor code
    }
    
    addPlugin(plugin) {
        this.plugins.push(plugin);
        plugin.init();
    }
    
    update(deltaTime) {
        // ... existing update code
        
        // Update plugins
        this.plugins.forEach(plugin => plugin.update(deltaTime));
    }
    
    render() {
        // ... existing render code
        
        // Render plugins
        this.plugins.forEach(plugin => plugin.render());
    }
}
```

## 🧪 Testing Integration

### 1. Unit Testing
```javascript
// test/game.test.js
describe('BunnyBagGame', () => {
    let game;
    
    beforeEach(() => {
        game = new BunnyBagGame();
    });
    
    test('should initialize with correct default values', () => {
        expect(game.score).toBe(0);
        expect(game.lives).toBe(3);
        expect(game.state).toBe(GAME_STATES.TITLE);
    });
    
    test('should increase score when catching carrot', () => {
        const initialScore = game.score;
        game.catchCarrot({}, 0);
        expect(game.score).toBe(initialScore + 10);
    });
});
```

### 2. Integration Testing
```javascript
// test/integration.test.js
describe('Game Integration', () => {
    test('should complete full game cycle', () => {
        const game = new BunnyBagGame();
        game.startGame();
        
        // Simulate gameplay
        game.update(16); // One frame
        game.render();
        
        expect(game.state).toBe(GAME_STATES.PLAYING);
    });
});
```

## 📊 Performance Optimization

### 1. Object Pooling
```javascript
class ObjectPool {
    constructor(createFn, resetFn) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
    }
    
    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this.createFn();
    }
    
    release(obj) {
        this.resetFn(obj);
        this.pool.push(obj);
    }
}

// Use object pooling for particles
class BunnyBagGame {
    constructor() {
        this.particlePool = new ObjectPool(
            () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '' }),
            (particle) => { particle.life = 0; }
        );
    }
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const particle = this.particlePool.get();
            particle.x = x;
            particle.y = y;
            particle.vx = (Math.random() - 0.5) * 4;
            particle.vy = (Math.random() - 0.5) * 4 - 2;
            particle.life = 1000;
            particle.color = color;
            this.particles.push(particle);
        }
    }
}
```

### 2. Rendering Optimization
```javascript
// Only render visible objects
class BunnyBagGame {
    renderCarrots() {
        this.carrots.forEach(carrot => {
            // Only render if on screen
            if (carrot.x > -CARROT_SIZE && carrot.x < GAME_WIDTH + CARROT_SIZE) {
                this.renderCarrot(carrot);
            }
        });
    }
}
```

## 🔒 Security Considerations

### 1. Input Validation
```javascript
class BunnyBagGame {
    handleKeyPress(event) {
        // Validate key codes
        const validKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space', 'KeyM', 'KeyC'];
        
        if (!validKeys.includes(event.code)) {
            return;
        }
        
        // ... existing key handling
    }
}
```

### 2. Data Sanitization
```javascript
class BunnyBagGame {
    saveGame() {
        const saveData = {
            score: Math.max(0, this.score),
            lives: Math.max(0, Math.min(3, this.lives)),
            difficultyLevel: Math.max(1, this.difficultyLevel),
            // ... sanitize all data
        };
        localStorage.setItem('bunnyBagSave', JSON.stringify(saveData));
    }
}
```

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Modern browsers with HTML5 Canvas support
