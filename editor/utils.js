/*!
 * Get all of an element's parent elements up the DOM tree until a matching parent is found
 * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Node}   elem   The element
 * @param  {String} stop   The test condition for the parent to stop at
 * @param  {String} filter The test condition to filter against [optional]
 * @return {Array}         The parent elements
 */
function getParentsUntil (elem, stop, filter) {
  // Setup parents array
  const parents = []
  let parent = elem.parentNode
  let index = 0

  // Make sure callbacks are valid
  if (stop && typeof stop !== 'function') { stop = null }
  if (filter && typeof filter !== 'function') { filter = null }

  // Get matching parent elements
  while (parent && parent !== document) {
    // If there's a stop test and the element matches, break
    if (stop) {
      if (stop(parent, index, elem)) break
    }

    // If there's a filter and the element matches, push it to the array
    // Otherwise, just add it to the array
    if (filter) {
      if (filter(parent, index, elem)) {
        parents.push(parent)
      }
    } else {
      parents.push(parent)
    }

    index++
    parent = parent.parentNode
  }

  return parents
}

export {
  getParentsUntil
}
