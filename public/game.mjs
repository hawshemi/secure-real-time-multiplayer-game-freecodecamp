//import Player from './Player.mjs';
//import Collectible from './Collectible.mjs';
const Player = require('./Player.mjs');
const Collectible = require('./Collectible.mjs');

const socket = io();
const canvas = document.getElementById('game-window');

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 500

canvas.width = CANVAS_WIDTH
canvas.height = CANVAS_HEIGHT

const context = canvas.getContext('2d');
let initialColor = getRandomColor()
context.fillStyle = initialColor

let allPlayers = []
let cPlayer
let cBait

socket.on('connect', function () {

  let playerId = socket.io.engine.id
  // create a new player
  cPlayer = new Player({
    x: Math.floor(Math.random() * CANVAS_WIDTH - 30),
    y: Math.floor(Math.random() * CANVAS_HEIGHT - 30),
    score: 0,
    id: playerId,
  })

  socket.emit("start", cPlayer)

  socket.on("player_updates", (players) => {
    allPlayers = players
    drawPlayers(allPlayers)
  })

  socket.on("bait", (bait) => {
    cBait = bait
    drawBait(bait.x, bait.y, bait.value)
  })

  window.addEventListener("keydown", (e) => {
    let cur_key = e.key.toLowerCase()
    let direction = cur_key === "d" ? "right" :
      cur_key === "a" ? "left" :
        cur_key === "w" ? "up" :
          cur_key === "s" ? "down" : null

    if (direction) {
      context.clearRect(...getCoord(cPlayer))
      cPlayer.movePlayer(direction, 10)
      checkBoundary(cPlayer)
      context.fillRect(...getCoord(cPlayer))
      allPlayers = allPlayers.map(p => {
        if (p.id === cPlayer.id) {
          return cPlayer
        } else {
          return p
        }
      })
      socket.emit("player_updates", allPlayers)
    }

    if (cPlayer.collision(cBait)) {
      context.clearRect(...getBaitCoord(cBait))
      cBait = { value: 0 }
      context.fillRect(...getCoord(cPlayer))
      socket.emit("collision", cPlayer)
      let rank = cPlayer.calculateRank(allPlayers)
      document.getElementById("rank").innerText = rank
    }
  })

});

// format player(square box) coordinate x, y, width, height
function getCoord(player) {
  return [player.x, player.y, 20, 20]
}

// get random colors for player
function getRandomColor() {
  let r, g, b
  r = Math.floor(Math.random() * 256)
  g = Math.floor(Math.random() * 256)
  b = Math.floor(Math.random() * 256)
  return `rgb(${r}, ${g}, ${b})`
}

// check boundary collision 
function checkBoundary(player) {
  if (player.x < 5) {
    player.x = 5
  }
  if (player.x > CANVAS_WIDTH - 25) {
    player.x = CANVAS_WIDTH - 25
  }
  if (player.y < 5) {
    player.y = 5
  }
  if (player.y > CANVAS_HEIGHT - 25) {
    player.y = CANVAS_HEIGHT - 25
  }
}

// draw bait or collectible for player to catch
function drawBait(x, y, value) {
  // value 1-5
  // bait of different colors and size acc. to value
  let colors = ["#f542cb", "#f55742", "#f5f242", "#428df5", "#42f56c"]
  context.beginPath()
  context.arc(x, y, value * 2 + 10, 0, 2 * Math.PI, false)
  context.fillStyle = colors[value - 1]
  context.fill()
}

// format bait coordinate 
// to clear it from screen
function getBaitCoord(bait) {
  let radFactor = bait.value * 2 + 10
  return [bait.x - radFactor, bait.y - radFactor, bait.x + radFactor, bait.y + radFactor]
}

// draw all players
function drawPlayers(players) {
  for (let p of players) {
    context.fillRect(...getCoord(p))
  }
}

