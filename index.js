import { loadImageCanvas, mouseAreaColorsData, pickedColor } from "./image-canvas.js"
import { resizeCanvas } from "./colorpicker-canvas.js"
import "./load-image.js"
import { elementLocalToGlobal } from "./utils.js"

loadImageCanvas("cat.jpg")

resizeCanvas()

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas[id='draw-canvas']")
const ctx = canvas.getContext("2d")

const clearCanvasBackground = () => {
  ctx.fillStyle = "black"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

canvas.width = 300
canvas.height = canvas.width

let isMouseDown = false

let mousePosition = [-1, -1]

const getBoxSize = () => {
  return canvas.width / 3
}

let activeTool = 0
let lastToolPosition = [-1, -1]

const getBrushSize = () => {
  return canvas.width / 15
}

const getRectFromPosition = (inputX, inputY) => {
  const boxSize = getBoxSize()

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
  lastToolPosition = [-1, -1]
})
canvas.addEventListener("touchstart", () => {
  lastToolPosition = [-1, -1]
})

const operateTool = (mousePosition) => {
  const brushSize = getBrushSize()

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
  } else if (activeTool == 1) {
    const mouseRect = getRectFromPosition(mousePosition[0], mousePosition[1])

    if (mouseRect[0] > -1) {
      const boxSize = getBoxSize()
      const canvasColors = ctx.getImageData(mouseRect[2], mouseRect[3], boxSize, boxSize)
      const dataLength = canvasColors.data.length / 4

      const boxMouseX = (mousePosition[0] - mouseRect[2])
      const boxMouseY = (mousePosition[1] - mouseRect[3])

      const boxMouseIndex = (boxMouseX + boxMouseY * boxSize) * 4

      const mouseRed = canvasColors.data[boxMouseIndex]
      const mouseGreen = canvasColors.data[boxMouseIndex + 1]
      const mouseBlue = canvasColors.data[boxMouseIndex + 2]

      const colorPositions = new Set()

      for (let i = 0; i < dataLength; i++) {
        const red = canvasColors.data[i * 4 + 0]
        const green = canvasColors.data[i * 4 + 1]
        const blue = canvasColors.data[i * 4 + 2]

        if (red == mouseRed && green == mouseGreen && blue == mouseBlue) {
          colorPositions.add(i)
        }
      }

      const closedFillPositions = new Set()
      const openFillPositions = new Set([boxMouseIndex / 4])

      while (openFillPositions.size > 0) {
        for (const openPosition of openFillPositions) {
          const x = openPosition % boxSize
          const y = (openPosition / boxSize) >> 0 //fast floor bit operation for positive numbers

          const leftIndex = ((x - 1) + y * boxSize)
          const rightIndex = ((x + 1) + y * boxSize)
          const topIndex = (x + (y - 1) * boxSize)
          const bottomIndex = (x + (y + 1) * boxSize)

          if (colorPositions.has(leftIndex) && !closedFillPositions.has(leftIndex)) {
            openFillPositions.add(leftIndex)
          }
          if (colorPositions.has(rightIndex) && !closedFillPositions.has(rightIndex)) {
            openFillPositions.add(rightIndex)
          }
          if (colorPositions.has(topIndex) && !closedFillPositions.has(topIndex)) {
            openFillPositions.add(topIndex)
          }
          if (colorPositions.has(bottomIndex) && !closedFillPositions.has(bottomIndex)) {
            openFillPositions.add(bottomIndex)
          }

          closedFillPositions.add(openPosition)
          openFillPositions.delete(openPosition)
        }
      }

      ctx.fillStyle = `rgb(${pickedColor[0]}, ${pickedColor[1]}, ${pickedColor[2]})`
      for (const closedPosition of closedFillPositions) {
        const x = closedPosition % boxSize
        const y = (closedPosition / boxSize) >> 0 //fast floor bit operation for positive numbers

        ctx.fillRect(mouseRect[2] + x, mouseRect[3] + y, 1, 1)
      }


      // ctx.fillStyle = `rgb(${averageRed}, ${averageGreen}, ${averageBlue})`
      // for (let y = 0; y < brushSize; y++) {
      //   for (let x = 0; x < brushSize; x++) {
      //     const drawX = mousePosition[0] + x - brushSize / 2
      //     const drawY = mousePosition[1] + y - brushSize / 2

      //     const rect = getRectFromPosition(drawX, drawY)

      //     if (rect[0] == -1 || (rect[0] != mouseRect[0] || rect[1] != mouseRect[1])) {
      //       continue
      //     }

      //     ctx.fillRect(
      //       drawX,
      //       drawY,
      //       1,
      //       1
      //     )
      //   }
      // }
    }
  } else if (activeTool == 2) {
    const mouseRect = getRectFromPosition(mousePosition[0], mousePosition[1])

    if (mouseRect[0] > -1) {
      const boxSize = getBoxSize()
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

const operateToolSmoothly = (mousePosition) => {
  if (lastToolPosition[0] == -1) {
    operateTool(mousePosition)
  } else {
    const distance = Math.sqrt(Math.pow(mousePosition[0] - lastToolPosition[0], 2) + Math.pow(mousePosition[1] - lastToolPosition[1], 2))

    const loopDistance = Math.max(1, distance)

    const rawDirection = [
      lastToolPosition[0] - mousePosition[0],
      lastToolPosition[1] - mousePosition[1],
    ]
    const magnitude = Math.sqrt(rawDirection[0] * rawDirection[0] + rawDirection[1] * rawDirection[1])
    const direction = [ // normalized direction
      rawDirection[0] / magnitude,
      rawDirection[1] / magnitude
    ]

    for (let i = 0; i < loopDistance; i++) {
      const toolFinalPosition = [
        Math.round(mousePosition[0] + direction[0] * i),
        Math.round(mousePosition[1] + direction[1] * i),
      ]

      operateTool(toolFinalPosition)
    }
  }

  lastToolPosition = mousePosition
}

canvas.addEventListener("touchmove", e => {
  if (e.touches.length > 0 && activeTool != 1) {
    const canvasRect = canvas.getBoundingClientRect()

    const [offsetX, offsetY] = elementLocalToGlobal(canvas, e.touches[0].clientX, e.touches[0].clientY)

    operateToolSmoothly([
      Math.round(offsetX / canvasRect.width * canvas.width),
      Math.round(offsetY / canvasRect.height * canvas.height)
    ])
  }
})

canvas.addEventListener("touchstart", e => {
  if (e.touches.length > 0 && activeTool == 1) {
    const canvasRect = canvas.getBoundingClientRect()

    const [offsetX, offsetY] = elementLocalToGlobal(canvas, e.touches[0].clientX, e.touches[0].clientY)

    operateToolSmoothly([
      Math.round(offsetX / canvasRect.width * canvas.width),
      Math.round(offsetY / canvasRect.height * canvas.height)
    ])
  }
})

canvas.addEventListener("mousemove", e => {
  if (isMouseDown && activeTool != 1) {
    const canvasRect = canvas.getBoundingClientRect()

    mousePosition = [
      Math.round(e.offsetX / canvasRect.width * canvas.width),
      Math.round(e.offsetY / canvasRect.height * canvas.height)
    ]

    operateToolSmoothly(mousePosition)
  }
})

canvas.addEventListener("mousedown", e => {
  if (isMouseDown && activeTool == 1) {
    const canvasRect = canvas.getBoundingClientRect()

    mousePosition = [
      Math.round(e.offsetX / canvasRect.width * canvas.width),
      Math.round(e.offsetY / canvasRect.height * canvas.height)
    ]

    operateToolSmoothly(mousePosition)
  }
})

const drawBrushButton = document.querySelector("#draw-brush-button")
const drawFillButton = document.querySelector("#draw-fill-button")
const smudgeButton = document.querySelector("#smudge-button")

const createButton = document.querySelector("#create-button")

const highlightActiveTool = () => {
  drawBrushButton.setAttribute("data-selected", activeTool == 0)
  drawFillButton.setAttribute("data-selected", activeTool == 1)
  smudgeButton.setAttribute("data-selected", activeTool == 2)
}
highlightActiveTool()

drawBrushButton.addEventListener("click", e => {
  activeTool = 0
  highlightActiveTool()
})
drawFillButton.addEventListener("click", e => {
  activeTool = 1
  highlightActiveTool()
})
smudgeButton.addEventListener("click", e => {
  activeTool = 2
  highlightActiveTool()
})

/** @type {HTMLDivElement} */
const imageCanvasContainer = document.querySelector("#image-canvas-container")

let imageVisible = true;

document.querySelector("#toggle-image-button").addEventListener("click", () => {
  imageVisible = !imageVisible

  if (imageVisible) {
    imageCanvasContainer.style.display = null
  } else {
    imageCanvasContainer.style.display = "none"
  }
})

const createTextsDivs = document.querySelectorAll("#create-texts-container div")
const prompts = ["Background", "Hair", "Top", "Bottom", "Skin", "Eyes", "Shoes", "Accessories", "Extra"]

createButton.addEventListener("click", e => {
  if (createTextsDivs[0].textContent == "") {
    const openDivs = [...createTextsDivs]
    const openPrompts = [...prompts]

    while (openDivs.length > 0) {
      const randomDivIndex = Math.floor(Math.random() * openDivs.length)
      const randomDiv = openDivs[randomDivIndex]

      const randomPromptIndex = Math.floor(Math.random() * openPrompts.length)
      const randomPrompt = openPrompts[randomPromptIndex]

      randomDiv.textContent = randomPrompt

      openDivs.splice(randomDivIndex, 1)
      openPrompts.splice(randomPromptIndex, 1)
    }
  } else {
    for (const div of createTextsDivs) {
      div.textContent = ""
    }
  }
})

clearCanvasBackground()

function render() {
  const boxSize = getBoxSize()

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
  render()

  window.requestAnimationFrame(gameLoop)
}

window.requestAnimationFrame(gameLoop)