const fs = require("fs").promises
const path = require("path")

void async function () {
    try {
        let p = path.resolve(__dirname, "../dist")
        
        let paths = await fs.readdir(p)
        
        // console.log(paths)
        let stack = [... paths]
        let count = 0
        // stack.length
        while (count++ === 0) {
            let top = stack.pop()
            let pat = path.resolve(p, top)
            let stat = await fs.stat(pat)
            if (stat.isDirectory()) {
                let temp = await fs.readdir(pat)
                if (temp) {
                    for (let i of temp) {
                        stack.push(path.join(top, i))
                    }
                }
            } else {
                // console.log(pat)

                let personList = await fs.readFile(pat, {encoding: "utf8"})
                
                var regexpNames = /(?:export|import)(?:\s)*?(?:\{)??.*?(?:\})??(?:\s)*?from(?:\s)*?["|'](.+?)["|'];?/gm

                var match = personList.match(regexpNames);
                             
                let count = 0
                console.log("解析的内容", match)
                for (let item of match) {
                    if (/.js("|');?$/.test(item)) {
                        continue
                    }
                    let temp = item
                    let index = item.index + count
                    let now = item
                    let past = personList.slice(0, index)
                    let feature = personList.slice(index + temp.length, personList.length)
                    personList = `${past}${now}${feature}`
                    count = count + 3
                }

                await fs.writeFile(pat, personList, {encoding: "utf8"})
            }
        }
        // for (let item of paths) {
        //     let pat = path.resolve(p, item)
        //     console.log(pat)
        //     let stat = await fs.stat(pat)
        //     console.log(stat.isDirectory())
        // }
    } catch (error) {
        console.log(error)
    }

}()