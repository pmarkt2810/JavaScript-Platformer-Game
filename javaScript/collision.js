//function to check collisions
function checkCollision(element1, element2) {
    return element1.x < element2.x + element2.width &&
    element1.x + element1.width > element2.x &&
    element1.y < element2.y + element2.height &&
    element1.y + element1.height > element2.y
}

//function to resolve collisions
function resolveCollision(player, object, options = {}) {
    if (!checkCollision(player, object)) return false
    const previousX = player.x - player.velocityX
    const previousY = player.y - player.velocityY
    //collision from above
    if (
        previousY + player.height <= object.y &&
        player.velocityY > 0
    ) {
        player.y = object.y - player.height
        player.velocityY = 0
        player.grounded = true
        options.onTopHit?.(object)
        return "top"
    }
    //collision from below
    if (
        previousY >= object.y + object.height &&
        player.velocityY < 0
    ) {
        player.y = object.y + object.height
        player.velocityY = 0
        options.onBottomHit?.(object)
        return "bottom"
    }
    //collision from the left
    if (
        previousX + player.width <= object.x &&
        player.velocityX > 0
    ) {
        player.x = object.x - player.width
        player.velocityX = 0
        options.onLeftHit?.(object)
        return "left"
    }
    //collision from the right
    if (
        previousX >= object.x + object.width &&
        player.velocityX < 0
    ) {
        player.x = object.x + object.width
        player.velocityX = 0
        options.onRightHit?.(object)
        return "right"
    }
    return false
}