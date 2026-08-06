//function to create elements
function createElement(type, className, styles = {}) {
    const element = document.createElement('div')
    element.className = className
    Object.assign(element.style, styles)
    return element
}

//update elements position
function updateElementPosition(element, x, y) {
    element.style.left = x + 'px'
    element.style.top = y + 'px'
}

//function to show if player won or lose
function showGameOver(won) {
    gameState.gameRunning = false
    document.getElementById('gameOverTitle').textContent = won ? 'Congrats! You won!' : 'Game Over'
    document.getElementById('finalScore').textContent = gameState.score
    document.getElementById('gameOver').style.display = 'block'
}

//clear level
function clearLevel() {
    Object.values(gameObjects).flat().forEach(obj => {
        if (obj.element && obj.element.parentNode) {
            obj.element.remove()
        }
    })
    gameObjects = {
        platforms: [],
        enemies: [],
        rockets: [],
        rocketLaunchers: [],
        fireballs: [],
        fireballLaunchers: [],
        coins: [],
        surpriseBlocks: [],
        pipes: []
    }
}