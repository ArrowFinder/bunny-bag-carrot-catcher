# Bunny Bag — Carrot Catcher Game

## 🎮 Game Overview

**Bunny Bag — Carrot Catcher** is a retro-style HTML5 Canvas arcade game featuring a bunny character who must catch falling carrots while avoiding moving obstacles. The game features progressive difficulty, power-ups, and a classic 8-bit aesthetic.

## 🚀 Quick Start

### Prerequisites
- Modern web browser with HTML5 Canvas support
- No additional dependencies required

### Installation
1. Download the `index.html` file
2. Open in any modern web browser
3. No build process or server required

### Running the Game
```bash
# Simply open the HTML file in a browser
open index.html
# or
start index.html
# or double-click the file
```

## 🎯 Game Features

### Core Gameplay
- **Character**: 8-bit bunny with brown sack
- **Objective**: Catch falling carrots (+10 points each)
- **Challenge**: Avoid moving obstacles (lose 1 life per hit)
- **Controls**: Arrow keys or WASD for movement and jumping
- **Lives**: Start with 3 lives, lose lives only when hit by obstacles

### Progressive Difficulty
- **Score-Based Scaling**: Difficulty increases based on total score
- **Carrot Speed**: Gradually increases but capped at reasonable levels
- **Obstacle Variety**: 5 different obstacle types with unique movement patterns
- **Spawn Rates**: Obstacles become more frequent as score increases

### Power-Up System
- **Mystery Boxes**: Appear mid-air, hit from below to activate
- **Positive Rewards**: Extra points, extra life, invincibility, slow motion
- **Negative Penalties**: Point loss, fast forward effect
- **Rarity**: 80% positive, 20% negative outcomes

### Visual Effects
- **8-Bit Aesthetic**: Pixel-perfect retro graphics
- **CRT Effect**: Optional scanline overlay
- **Particle Systems**: Visual feedback for all game events
- **Screen Tints**: Power-up state indicators

## 🎮 Controls

| Action | Primary | Alternative |
|--------|---------|-------------|
| Move Left | ← | A |
| Move Right | → | D |
| Jump | ↑ | W or S |
| Start/Pause | Space | - |
| Mute | M | - |
| Toggle CRT | C | - |

## 🏗️ Technical Architecture

### File Structure
```
Bunny Bag/
├── index.html          # Complete game (HTML + CSS + JavaScript)
├── README.md           # This documentation
└── (no dependencies)
```

### Core Components

#### 1. Game Engine (`BunnyBagGame` class)
- **Purpose**: Main game controller and state management
- **Key Methods**:
  - `init()`: Initialize game and start render loop
  - `update()`: Game logic update cycle
  - `render()`: Rendering pipeline
  - `resetGame()`: Reset to initial state

#### 2. Game States
- `TITLE`: Main menu screen
- `PLAYING`: Active gameplay
- `PAUSED`: Game paused by player
- `HIT_PAUSE`: Paused after taking damage
- `GAME_OVER`: End game screen

#### 3. Game Objects

##### Player Character
- **Properties**: Position, velocity, jump state, ground detection
- **Rendering**: Detailed 8-bit bunny with sack
- **Physics**: Gravity-based jumping system

##### Carrots
- **Behavior**: Fall straight down at variable speeds
- **Scoring**: +10 points per carrot caught
- **Rendering**: Pixel art carrot with green top

##### Obstacles (5 Types)
1. **Log**: Static wooden obstacle
2. **Rock**: Static stone obstacle  
3. **Flying Bug**: Moves in sine wave pattern
4. **Jumping Spider**: Bounces vertically
5. **Slithering Snake**: Slithers side to side

##### Mystery Boxes
- **Spawn**: Mid-air at fixed height
- **Activation**: Hit from below while jumping
- **Rewards**: Points, lives, power-ups
- **Penalties**: Point loss, speed effects

#### 4. Difficulty System
- **Score Thresholds**: Progressive difficulty milestones
- **Dynamic Scaling**: Real-time parameter adjustment
- **Balanced Progression**: Carrots stay catchable, obstacles become challenging

## 🔧 Integration Guide

### For Web Developers

#### Basic Integration
```html
<!-- Include the game in your webpage -->
<iframe src="bunny-bag/index.html" width="800" height="600"></iframe>
```

#### Standalone Integration
```html
<!-- Copy the entire index.html content into your page -->
<div id="gameContainer">
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <div id="crtOverlay"></div>
</div>
```

### For Game Developers

#### Customization Points

1. **Game Constants** (Lines 150-200)
   ```javascript
   const GAME_WIDTH = 800;
   const GAME_HEIGHT = 600;
   const PLAYER_WIDTH = 58;
   const PLAYER_HEIGHT = 58;
   ```

2. **Difficulty Scaling** (Lines 780-810)
   ```javascript
   getDifficultyConfig() {
       // Modify thresholds and multipliers here
   }
   ```

3. **Color Palette** (Lines 100-120)
   ```javascript
   const COLORS = {
       background: '#1a1a2e',
       player: '#D3D3D3',
       carrot: '#FF8C00',
       // ... add custom colors
   };
   ```

#### Adding New Features

1. **New Obstacle Types**:
   - Add to `obstacleTypes` array in `createObstacle()`
   - Add rendering logic in `renderObstacle()`
   - Add movement pattern in `updateObstacles()`

2. **New Power-Ups**:
   - Add to reward arrays in `hitMysteryBox()`
   - Implement effect in `updatePowerUps()`
   - Add visual feedback in `renderGameplay()`

3. **New Game States**:
   - Add to `GAME_STATES` object
   - Add handling in `update()` and `render()`
   - Add input handling in `handleSpaceKey()`

## 📊 Performance Considerations

### Optimization Features
- **Efficient Rendering**: Only redraws when necessary
- **Particle Cleanup**: Automatic particle lifecycle management
- **Memory Management**: Proper array cleanup for removed objects
- **Frame Rate**: 60 FPS target with delta time calculations

### Browser Compatibility
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile**: Touch controls not implemented (keyboard only)

## 🐛 Troubleshooting

### Common Issues

1. **Game Won't Start**
   - Check browser console for JavaScript errors
   - Ensure HTML5 Canvas is supported
   - Verify file is opened correctly

2. **Controls Not Working**
   - Ensure window has focus
   - Check for conflicting keyboard shortcuts
   - Verify key event listeners are attached

3. **Performance Issues**
   - Close other browser tabs
   - Check system resources
   - Disable CRT effect if needed

### Debug Mode
Add `?debug=true` to URL for console logging:
```javascript
// Add to game initialization
if (window.location.search.includes('debug=true')) {
    console.log('Debug mode enabled');
}
```

## 🎨 Customization Guide

### Visual Customization

#### Colors
```javascript
const COLORS = {
    background: '#1a1a2e',    // Main background
    player: '#D3D3D3',        // Bunny character
    carrot: '#FF8C00',        // Carrot color
    obstacle: '#8B4513',      // Obstacle color
    // ... modify as needed
};
```

#### Character Sprites
- Modify `renderBunnyCharacter()` for character appearance
- Modify `renderSack()` for bag appearance
- Modify `renderCarrotBody()` and `renderCarrotTop()` for carrot design

#### UI Elements
- Modify `renderTitleScreen()` for main menu
- Modify `renderUI()` for HUD elements
- Modify `renderGameOverScreen()` for end screen

### Gameplay Customization

#### Difficulty
```javascript
const SCORE_THRESHOLDS = {
    OBSTACLES_START: 100,     // When obstacles appear
    SPEED_INCREASE: 300,      // When speed increases
    RAPID_INCREASE: 800,      // When rapid scaling begins
    MULTI_SPAWN_START: 500    // When multi-spawn begins
};
```

#### Scoring
```javascript
// Points per carrot
this.score += 10;

// Mystery box rewards
() => { this.score += 50; },   // Small bonus
() => { this.score += 100; },  // Medium bonus
() => { this.score += 200; },  // Large bonus
```

## 📈 Analytics Integration

### Event Tracking
```javascript
// Add to relevant game events
function trackEvent(eventName, data) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, data);
    }
}

// Usage examples
trackEvent('carrot_caught', { score: this.score });
trackEvent('obstacle_hit', { lives: this.lives });
trackEvent('mystery_box_opened', { reward: rewardType });
```

### Performance Monitoring
```javascript
// Add performance tracking
const performanceStart = performance.now();
// ... game logic
const performanceEnd = performance.now();
console.log(`Frame time: ${performanceEnd - performanceStart}ms`);
```

## 🔒 Security Considerations

### Input Validation
- All user inputs are validated
- No external dependencies
- No server communication
- Safe for embedding in any website

### Data Privacy
- No data collection
- No external requests
- Local storage only for high score
- No user tracking

## 📝 License

This game is provided as-is for integration into larger projects. Modify and distribute as needed for your project requirements.

## 🤝 Support

For technical questions or integration support:
1. Check this documentation first
2. Review the code comments
3. Test in different browsers
4. Check browser console for errors

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Modern browsers with HTML5 Canvas support