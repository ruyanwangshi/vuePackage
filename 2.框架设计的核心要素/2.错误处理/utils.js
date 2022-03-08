let handlerError = null
export default {
  foo(callback) {
    callWithErrorHandling(callback)
  },
  registerErrorHandler(fn) {
    handlerError = fn
  },
}

function callWithErrorHandling(fn) {
  try {
    fn && fn()
  } catch (error) {
      if(handlerError) {
        handlerError(error)
      } else {
        console.log(error)
      }
  }
}
