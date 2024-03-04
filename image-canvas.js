import { pickerSize } from "./colorpicker-canvas.js"
import { elementLocalToGlobal } from "./utils.js"

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas[id='image-canvas']")
const ctx = canvas.getContext("2d")

canvas.width = 300
canvas.height = 300

export let pickedColor = [0, 0, 0]

const mouseAreaSize = 15
export let mouseAreaColorsData = undefined

export const loadImageCanvas = (url) => {
  const image = new Image()
  image.crossOrigin = "anonymous";
  image.src = url
  image.onload = () => {
    canvas.width = image.width
    canvas.height = image.height

    ctx.drawImage(image, 0, 0)
  }
  image.onerror = () => {
    alert("Failed to import image, trying importing the image from a different website/source?")
  }
}

const getColorAtPosition = (x, y) => {
  const data = ctx.getImageData(x, y, 1, 1)

  const red = data.data[0]
  const green = data.data[1]
  const blue = data.data[2]

  return [red, green, blue]
}

canvas.addEventListener("mousemove", async e => {
  const canvasRect = canvas.getBoundingClientRect()

  const x = e.offsetX / 300 * canvas.width
  const y = e.offsetY / canvasRect.height * canvas.height

  const imageData = ctx.getImageData(x - mouseAreaSize / 2, y - mouseAreaSize / 2, mouseAreaSize, mouseAreaSize)

  mouseAreaColorsData = await createImageBitmap(imageData, {
    resizeWidth: pickerSize,
    resizeHeight: pickerSize,
    resizeQuality: "pixelated"
  })
})

const onTouchMove = async e => {
  if (e.touches.length > 0) {
    const canvasRect = canvas.getBoundingClientRect()
    const [offsetX, offsetY] = elementLocalToGlobal(canvas, e.touches[0].clientX, e.touches[0].clientY)

    const x = offsetX / 300 * canvas.width
    const y = offsetY / canvasRect.height * canvas.height

    const imageData = ctx.getImageData(x - mouseAreaSize / 2, y - mouseAreaSize / 2, mouseAreaSize, mouseAreaSize)

    mouseAreaColorsData = await createImageBitmap(imageData, {
      resizeWidth: pickerSize,
      resizeHeight: pickerSize,
      resizeQuality: "pixelated"
    })

    pickedColor = getColorAtPosition(x, y)
  }
}

canvas.addEventListener("touchmove", onTouchMove)
canvas.addEventListener("touchstart", onTouchMove)

canvas.addEventListener("mousedown", e => {
  const canvasRect = canvas.getBoundingClientRect()

  const x = e.offsetX / 300 * canvas.width
  const y = e.offsetY / canvasRect.height * canvas.height

  pickedColor = getColorAtPosition(x, y)
})
