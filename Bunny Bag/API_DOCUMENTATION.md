# Bunny Bag Game - API Documentation

## 🎮 Game Class: BunnyBagGame

### Constructor
```javascript
new BunnyBagGame()
```
Initializes a new game instance with default settings.

### Properties

#### Game State
- `state` (string): Current game state (`TITLE`, `PLAYING`, `PAUSED`, `HIT_PAUSE`, `GAME_OVER`)
- `score` (number): Current player score
- `lives` (number): Remaining lives (0-3)
- `bestScore` (number): Highest score achieved (persisted in localStorage)

#### Game Objects
- `player` (Object): Player character with position, velocity, and state
- `carrots` (Array): Active carrot objects
- `obstacles` (Array): Active obstacle objects
- `mysteryBoxes` (Array): Active mystery box objects
- `particles` (Array): Visual effect particles

#### Power-Up States
- `invincible` (boolean): Invincibility power-up active
- `slowMotion` (boolean): Slow motion power-up active
- `fastForward` (boolean): Fast forward power-up active

### Methods

#### Core Game Control
```javascript
init()
```
Initialize the game and start the main game loop.

```javascript
startGame()
```
Start a new game session.

```javascript
pauseGame()
```
Pause the current game.

```javascript
resumeGame()
```
Resume a paused game.

```javascript
resetGame()
```
Reset game to initial state.

```javascript
gameOver()
```
End the current game and show game over screen.

#### Input Handling
```javascript
handleKeyPress(event)
```
Process keyboard input events.

```javascript
handleJump()
```
Handle player jump input.

```javascript
toggleMute()
```
Toggle audio mute state.

```javascript
toggleCRT()
```
Toggle CRT scanline effect.

#### Game Logic
```javascript
update(deltaTime)
```
Main game update loop.

```javascript
updatePlayer(deltaTime)
```
Update player physics and movement.

```javascript
updateCarrots(deltaTime)
```
Update carrot positions and collisions.

```javascript
updateObstacles(deltaTime)
```
Update obstacle positions and collisions.

```javascript
updateMysteryBoxes(deltaTime)
```
Update mystery box positions and collisions.

#### Difficulty System
```javascript
getDifficultyConfig()
```
Calculate difficulty parameters based on current score.

**Returns:** Object with difficulty settings:
- `spawnInterval`: Carrot spawn interval in milliseconds
- `fallSpeed`: Carrot fall speed
- `multiSpawn`: Multi-carrot spawn chance (0-1)
- `obstacles`: Whether obstacles are enabled
- `obstacleSpawn`: Obstacle spawn rate (0-1)
- `obstacleSpeed`: Obstacle movement speed

#### Collision Detection
```javascript
checkCarrotCollision(carrot)
```
Check if player caught a carrot.

```javascript
checkObstacleCollision(obstacle)
```
Check if player hit an obstacle.

```javascript
checkMysteryBoxCollision(mysteryBox)
```
Check if player hit a mystery box from below.

#### Rendering
```javascript
render()
```
Main rendering pipeline.

```javascript
renderTitleScreen()
```
Render the main menu.

```javascript
renderGameplay()
```
Render the game world and objects.

```javascript
renderUI()
```
Render the heads-up display.

```javascript
renderGameOverScreen()
```
Render the game over screen.

#### Object Creation
```javascript
createCarrot()
```
Spawn a new carrot.

```javascript
createObstacle()
```
Spawn a new obstacle.

```javascript
createMysteryBox()
```
Spawn a new mystery box.

#### Visual Effects
```javascript
createParticles(x, y, count, color)
```
Create particle effects at specified location.

```javascript
createRewardText(text, color)
```
Create floating reward text.

## 🎯 Game Objects

### Player Object
```javascript
{
    x: number,              // X position
    y: number,              // Y position
    width: number,          // Width
    height: number,         // Height
    velocityY: number,      // Vertical velocity
    onGround: boolean,      // Whether on ground
    canJump: boolean        // Whether can jump
}
```

### Carrot Object
```javascript
{
    x: number,              // X position
    y: number,              // Y position
    width: number,          // Width
    height: number,         // Height
    speed: number           // Fall speed
}
```

### Obstacle Object
```javascript
{
    x: number,              // X position
    y: number,              // Y position
    width: number,          // Width
    height: number,         // Height
    speed: number,          // Movement speed
    type: string,           // Obstacle type
    originalY: number,      // Original Y position for movement
    movementOffset: number, // Movement animation offset
    movementSpeed: number,  // Movement animation speed
    direction: number       // Movement direction (-1 or 1)
}
```

### Mystery Box Object
```javascript
{
    x: number,              // X position
    y: number,              // Y position
    width: number,          // Width
    height: number,         // Height
    speed: number,          // Movement speed
    hit: boolean            // Whether already hit
}
```

### Particle Object
```javascript
{
    x: number,              // X position
    y: number,              // Y position
    vx: number,             // X velocity
    vy: number,             // Y velocity
    life: number,           // Life remaining in ms
    color: string,          // Particle color
    text: string,           // Text content (if text particle)
    isText: boolean         // Whether this is a text particle
}
```

## 🎨 Obstacle Types

### Static Obstacles
- `log`: Wooden log with bark texture
- `rock`: Stone obstacle with rough texture

### Moving Creatures
- `flyingBug`: Yellow bug that flies in sine wave pattern
- `jumpingSpider`: Dark spider that bounces vertically
- `slitheringSnake`: Green snake that slithers side to side

## 🎁 Mystery Box Rewards

### Positive Rewards
- **Extra Points**: +50, +100, or +200 points
- **Extra Life**: +1 life (or +100 points if at max lives)
- **Invincibility**: 15 seconds of damage immunity
- **Slow Motion**: 5 seconds of slowed gameplay

### Negative Penalties
- **Point Loss**: -10, -20, -30, -40, or -50 points
- **Fast Forward**: 3 seconds of accelerated gameplay

## 🎮 Game States

### State Machine
```
TITLE → PLAYING → PAUSED → PLAYING
  ↓        ↓
GAME_OVER ← HIT_PAUSE
```

### State Descriptions
- `TITLE`: Main menu with instructions
- `PLAYING`: Active gameplay
- `PAUSED`: Game paused by player (Space key)
- `HIT_PAUSE`: Paused after taking damage (Space to continue)
- `GAME_OVER`: End game screen with final score

## 🔧 Customization Points

### Constants
```javascript
// Game dimensions
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// Player properties
const PLAYER_WIDTH = 58;
const PLAYER_HEIGHT = 58;

// Physics
const JUMP_POWER = 14;
const GRAVITY = 0.5;

// Difficulty thresholds
const SCORE_THRESHOLDS = {
    OBSTACLES_START: 100,
    SPEED_INCREASE: 200,
    MULTI_SPAWN_START: 300,
    RAPID_INCREASE: 500
};
```

### Color Palette
```javascript
const COLORS = {
    background: '#1a1a2e',      // Dark blue background
    player: '#ff6b6b',          // Light red for bunny
    carrot: '#ffa500',          // Orange for carrots
    bag: '#8b4513',             // Brown for sack
    text: '#ffffff',            // White text
    ui: '#00ff00',              // Green UI elements
    // ... more colors
};
```

## 🚀 Integration Examples

### Basic Integration
```html
<div id="gameContainer">
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <div id="crtOverlay"></div>
</div>
<script>
    const game = new BunnyBagGame();
</script>
```

### Custom Event Handling
```javascript
// Listen for game events
game.addEventListener('scoreUpdate', (score) => {
    console.log('New score:', score);
});

game.addEventListener('gameOver', (finalScore) => {
    console.log('Game over! Final score:', finalScore);
});
```

### Difficulty Customization
```javascript
// Override difficulty thresholds
const customThresholds = {
    OBSTACLES_START: 50,    // Earlier obstacles
    SPEED_INCREASE: 100,    // Earlier speed increase
    MULTI_SPAWN_START: 150, // Earlier multi-spawn
    RAPID_INCREASE: 300     // Earlier rapid increase
};
```

## 📊 Performance Considerations

### Frame Rate
- Target: 60 FPS
- Uses delta time for smooth animation
- Automatic frame rate adaptation

### Memory Management
- Automatic cleanup of off-screen objects
- Particle lifecycle management
- Efficient collision detection

### Browser Compatibility
- Modern browsers with HTML5 Canvas support
- No external dependencies
- Mobile-friendly (keyboard controls only)

## 🔍 Debugging

### Console Logging
```javascript
// Enable debug mode
if (window.location.search.includes('debug=true')) {
    console.log('Debug mode enabled');
    // Add debug logging throughout the game
}
```

### Performance Monitoring
```javascript
// Monitor frame rate
const frameStart = performance.now();
// ... game logic
const frameEnd = performance.now();
console.log(`Frame time: ${frameEnd - frameStart}ms`);
```

## 📝 Error Handling

### Common Issues
1. **Canvas not found**: Ensure `gameCanvas` element exists
2. **Context not available**: Check browser Canvas support
3. **Input not working**: Ensure window has focus
4. **Performance issues**: Check system resources

### Error Recovery
- Graceful degradation for unsupported features
- Automatic fallbacks for missing elements
- Console warnings for non-critical errors

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Modern browsers with HTML5 Canvas support
