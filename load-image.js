import { loadImageCanvas } from "./image-canvas.js"

//https://publications.chitkara.edu.in/wp-content/uploads/2020/09/nmbr.jpg

/** @type {HTMLInputElement} */
const loadImageInput = document.querySelector("#load-image-url")
/** @type {HTMLButtonElement} */
const loadImageButton = document.querySelector("#load-image-button")
/** @type {HTMLInputElement} */
const loadLocalImageInput = document.querySelector("#upload-local-image-input")

loadImageButton.addEventListener("click", e => {
  loadImageCanvas(loadImageInput.value)
})

loadLocalImageInput.addEventListener("change", e => {
  /** @type {FileList} */
  const files = e.target.files

  if (files.length > 0) {
    var fileReader = new FileReader();
    fileReader.onload = function () {
      loadImageCanvas(fileReader.result)
    }
    fileReader.readAsDataURL(files[0]);
  }
})