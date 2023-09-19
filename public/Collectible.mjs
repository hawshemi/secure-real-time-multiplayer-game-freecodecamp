class Collectible {
  constructor({ x, y, value, id }) {
    this.x = x
    this.y = y
    this.value = value
    this.id = id
  }
}

/*
  Note: Export using CommonJS module system
*/
module.exports = Collectible;
