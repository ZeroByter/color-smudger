import { mouseAreaColorsData } from "./image-canvas.js"
import { elementLocalToGlobal } from "./utils.js"


/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas[id='colorpicker-canvas']")
const ctx = canvas.getContext("2d")

const canvasParent = canvas.parentElement

export const resizeCanvas = () => {
  const rect = canvasParent.getBoundingClientRect()

  canvas.width = rect.width
  canvas.height = rect.height
}

new ResizeObserver(resizeCanvas).observe(canvasParent)

export const pickerSize = 60

canvasParent.addEventListener("mousemove", e => {
  const mouseX = e.offsetX
  const mouseY = e.offsetY

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "rgba(0,0,0,0.75)"
  const yOffset = Math.min(Math.max(0, mouseY - pickerSize / 2), canvas.height - pickerSize)
  if (mouseX < canvas.width / 2) {
    ctx.drawImage(mouseAreaColorsData, canvas.width - pickerSize, yOffset)
    ctx.fillRect(canvas.width - pickerSize / 2 - 2, yOffset + pickerSize / 2 - 2, 4, 4)
  } else {
    ctx.drawImage(mouseAreaColorsData, 0, yOffset)
    ctx.fillRect(pickerSize / 2 - 2, yOffset + pickerSize / 2 - 2, 4, 4)
  }
})

const onTouchMove = e => {
  if (e.touches.length > 0) {
    const [mouseX, mouseY] = elementLocalToGlobal(canvasParent, e.touches[0].clientX, e.touches[0].clientY)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "rgba(0,0,0,0.75)"
    const yOffset = Math.min(Math.max(0, mouseY - pickerSize / 2), canvas.height - pickerSize)
    if (mouseX < canvas.width / 2) {
      ctx.drawImage(mouseAreaColorsData, canvas.width - pickerSize, yOffset)
      ctx.fillRect(canvas.width - pickerSize / 2 - 2, yOffset + pickerSize / 2 - 2, 4, 4)
    } else {
      ctx.drawImage(mouseAreaColorsData, 0, yOffset)
      ctx.fillRect(pickerSize / 2 - 2, yOffset + pickerSize / 2 - 2, 4, 4)
    }
  }
}

canvasParent.addEventListener("touchmove", onTouchMove)
canvasParent.addEventListener("touchstart", onTouchMove)

canvasParent.addEventListener("mouseleave", e => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
})

canvasParent.addEventListener("touchend", e => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
})
canvasParent.addEventListener("touchcancel", e => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
})
