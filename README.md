# Super Mario Bros

A 2D platformer inspired by the classic Super Mario Bros, built entirely with HTML, CSS, and JavaScript.
The project recreates many of the mechanics from the original game while implementing custom game logic, collision detection, enemy AI, power-ups, projectiles, level progression, and a camera system.

## Features

- Multi-level platformer
- Side-scrolling camera that follows the player
- Gravity and jumping physics
- Collision detection system
- Platform and pipe interactions
- Multiple enemy types
- Rocket projectiles
- Fireball hazards
- Surprise blocks
- Collectible coins
- Mushroom power-up
- Temporary player growth
- Score system
- Lives system
- Level progression
- Game Over screen
- Restart functionality

## Built With

- HTML5
- CSS3
- JavaScript (ES6)

## Project Structure

```
├── img/
├── javaScript/
│    ├── helpers.js
│    ├── levels.js
│    ├── player.js
│    ├── collision.js
│    ├── game.js
│    ├── main.js
├── index.html
├── styles.css
└── README.md
```

## Gameplay

The player controls Mario through different levels while avoiding enemies, collecting coins, activating surprise blocks, and reaching the exit pipe.

Current mechanics include:

- Walking and jumping
- Enemy stomping
- Power-up collection
- Temporary size increase
- Projectile hazards
- Dynamic camera movement
- Score tracking
- Multiple lives
- Level transitions

## Enemies

Standard Enemy

- Patrols platforms
- Changes direction at edges
- Collides with pipes
- Can be defeated by jumping on top

Rocket

- Launches from cannons
- Travels horizontally
- Can be defeated by stomping
- Damages the player on side or bottom collisions

Fireball

- Launches vertically from underground launchers
- Cannot be destroyed
- Instantly damages the player upon contact

## Power-Ups

Mushroom

- Increases Mario's size
- Increases jump height
- Effect expires after a limited time

Collectibles

- Coins increase the player's score and encourage exploration throughout each level.

Camera System

- The game features a smooth side-scrolling camera that follows the player while respecting the world boundaries.

## Technical Highlights

This project demonstrates:

- Object-oriented style game architecture
- Game loop using requestAnimationFrame()
- Collision detection and collision resolution
- Physics simulation
- Enemy AI
- Dynamic object spawning
- Camera movement
- DOM manipulation
- State management
- Modular JavaScript organization
