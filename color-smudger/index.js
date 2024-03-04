import { loadImageCanvas, pickedColor } from "./image-canvas.js"
import { resizeCanvas } from "./colorpicker-canvas.js"
import "./load-image.js"
import { elementLocalToGlobal } from "./utils.js"

loadImageCanvas("/color-smudger/cat.jpg")

resizeCanvas()

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas[id='draw-canvas']")
const ctx = canvas.getContext("2d")

canvas.width = 300
canvas.height = 300

let isMouseDown = false

let mousePosition = [-1, -1]

let boxSize = 100

let activeTool = 0

let brushSize = 20

const getRectFromPosition = (inputX, inputY) => {
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      const topLeftX = canvas.width / 2 - boxSize / 2 - ((x - 1) * boxSize)
      const topLeftY = canvas.height / 2 - boxSize / 2 - ((y - 1) * boxSize)

      const bottomRightX = canvas.width / 2 + boxSize / 2 - ((x - 1) * boxSize)
      const bottomRightY = canvas.height / 2 + boxSize / 2 - ((y - 1) * boxSize)

      if (inputX > topLeftX && inputX < bottomRightX && inputY > topLeftY && inputY < bottomRightY) {
        return [2 - x, 2 - y, topLeftX, topLeftY]
      }
    }
  }

  return [-1, -1, 0, 0]
}

canvas.addEventListener("mousedown", e => {
  isMouseDown = true
})
canvas.addEventListener("mouseup", e => {
  isMouseDown = false
})

const operateTool = (mousePosition) => {
  if (activeTool == 0) {
    ctx.fillStyle = `rgb(${pickedColor[0]}, ${pickedColor[1]}, ${pickedColor[2]})`

    for (let y = 0; y < brushSize; y++) {
      for (let x = 0; x < brushSize; x++) {
        const drawX = mousePosition[0] + x - brushSize / 2
        const drawY = mousePosition[1] + y - brushSize / 2

        const rect = getRectFromPosition(drawX, drawY)

        if (rect[0] == -1) {
          continue
        }

        ctx.fillRect(
          drawX,
          drawY,
          1,
          1
        )
      }
    }
  } else {
    const mouseRect = getRectFromPosition(mousePosition[0], mousePosition[1])

    if (mouseRect[0] > -1) {
      const canvasColors = ctx.getImageData(mouseRect[2] + 1, mouseRect[3] + 1, boxSize - 2, boxSize - 2)
      const dataLength = canvasColors.data.length / 4

      let averageRed = 0
      let averageGreen = 0
      let averageBlue = 0

      for (let i = 0; i < dataLength; i++) {
        averageRed += canvasColors.data[i * 4 + 0]
        averageGreen += canvasColors.data[i * 4 + 1]
        averageBlue += canvasColors.data[i * 4 + 2]
      }

      averageRed = averageRed / dataLength
      averageGreen = averageGreen / dataLength
      averageBlue = averageBlue / dataLength

      ctx.fillStyle = `rgb(${averageRed}, ${averageGreen}, ${averageBlue})`
      for (let y = 0; y < brushSize; y++) {
        for (let x = 0; x < brushSize; x++) {
          const drawX = mousePosition[0] + x - brushSize / 2
          const drawY = mousePosition[1] + y - brushSize / 2

          const rect = getRectFromPosition(drawX, drawY)

          if (rect[0] == -1 || (rect[0] != mouseRect[0] || rect[1] != mouseRect[1])) {
            continue
          }

          ctx.fillRect(
            drawX,
            drawY,
            1,
            1
          )
        }
      }
    }
  }
}

canvas.addEventListener("touchmove", e => {
  if (e.touches.length > 0) {
    const [offsetX, offsetY] = elementLocalToGlobal(canvas, e.touches[0].clientX, e.touches[0].clientY)

    operateTool([offsetX, offsetY])

  }
})

canvas.addEventListener("mousemove", e => {
  if (isMouseDown) {
    mousePosition = [e.offsetX, e.offsetY]

    operateTool(mousePosition)
  }
})

document.querySelector("#draw-button").addEventListener("click", e => {
  activeTool = 0
})
document.querySelector("#smudge-button").addEventListener("click", e => {
  activeTool = 1
})

function think(timeDelta) {

}

ctx.fillStyle = "black"
ctx.fillRect(0, 0, canvas.width, canvas.height)

function render() {
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      ctx.strokeStyle = "white"
      ctx.strokeRect(
        canvas.width / 2 - boxSize / 2 + ((x - 1) * boxSize),
        canvas.height / 2 - boxSize / 2 + ((y - 1) * boxSize),
        boxSize,
        boxSize
      )
    }
  }
}

function gameLoop(time) {
  think(1)

  render()

  window.requestAnimationFrame(gameLoop)
}

window.requestAnimationFrame(gameLoop)