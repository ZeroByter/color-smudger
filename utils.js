/**
 * 
 * @param {HTMLElement} element 
 * @param {*} x 
 * @param {*} y 
 * @returns 
 */
export const elementLocalToGlobal = (element, x, y) => {
  const rect = element.getBoundingClientRect()

  return [
    x - rect.x,
    y - rect.y
  ]
}