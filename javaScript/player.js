//stores the player's current state and physics properties
const player = {
    element: document.getElementById('mario'),
    x: 50,
    y: 340,
    width: 20,
    height: 20,
    velocityX: 0,
    velocityY: 0,
    grounded: false,
    big: false,
    bigTimer: 0
}
//reset the player to the default spawn position and state
function resetPlayer(){
    player.x = 50
    player.y = 340
    player.velocityX = 0
    player.velocityY = 0
    player.big = false
    player.bigTimer = 0
    player.width = 20
    player.height = 20
    player.element.classList.remove('big')
}
//remove one life from the player and reset the level state unless there are no remaining lives
function loseLife() {
    gameState.lives--
    if (gameState.lives <= 0) {
        showGameOver(false)
    } else {
        resetPlayer()
    }
}
//apply damage to the player
function damagePlayer() {
    if (player.big) {
        player.big = false;
        player.bigTimer = 0;
        player.element.classList.remove("big");
        player.width = 20;
        player.height = 20;
        jumpForce = -12
    } else {
        loseLife();
    }
}