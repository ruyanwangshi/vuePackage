import utils from './utils.js'

try {
    utils.foo(() => {
        console.log(aaa)
    })
    utils.registerErrorHandler((err) =>{
        console.log('123', err)
    })
} catch (error) {
    // console.dir(error)
    console.log(error)
}

