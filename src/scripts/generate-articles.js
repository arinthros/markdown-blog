const showdown = require('showdown')
const fs = require('fs')

const basePaths = {
  source: `${process.cwd()}/src/blog`,
  output: `${process.cwd()}/dist/blog`
}

const converter = new showdown.Converter({ghCompatibleHeaderId: true, tasklists: true, simpleLineBreaks: true,})

const articles = fs.readdirSync(`${process.cwd()}/src/blog`)

const head = fs.readFileSync(`${process.cwd()}/src/templates/_head.html`)
const menu = fs.readFileSync(`${process.cwd()}/src/templates/_menu.html`)
const articleTemplate = fs.readFileSync(`${process.cwd()}/src/templates/article.html`)

// Reset the output folder.
if (fs.existsSync(basePaths.output)) {
  fs.rmSync(basePaths.output, { recursive: true })
}
fs.mkdirSync(basePaths.output, { recursive: true })

Promise.all(articles.map((article) => {
  return new Promise((resolve, reject) => {
    const fileData = {
      fileName: article.split('.').shift(),
      type: article.split('.').pop()
    }

    fs.readFile(`${process.cwd()}/src/blog/${article}`, (error, data) => {
      if (error) {
        console.error('Error reading file:', error.message)
        reject()
      }
      const dataString = data.toString()

      const title = dataString.match(/^# .*/gm)[0].slice(2)

      let description = dataString.match(/__\*.*\*__/gm)[0]
      description = description.slice(3, description.length - 3)

      let keywords = dataString.match(/<keywords>.*<\/keywords>/gm)[0]
      keywords = keywords.slice(10, keywords.length - 11)

      let imageUrl = dataString.match(/<imageUrl>.*<\/imageUrl>/gm)[0]
      imageUrl = imageUrl.slice(10, imageUrl.length - 11)
      
      let cleanedDataString = dataString.replace(/<keywords>.*<\/keywords>[\n]/gm, '')
      cleanedDataString = cleanedDataString.replace(/<imageUrl>.*<\/imageUrl>[\n]+/gm, '')

      const html = converter.makeHtml(cleanedDataString)
      resolve({ ...fileData, html, title, description, keywords, imageUrl })
    })
  })
})).then((values) => {
  Promise.all(values.map((value) => {

    const { html, fileName, title, description, keywords, imageUrl } = value

    let thisHead = head.toString()
    thisHead = thisHead.replaceAll('{{title}}', title)
    thisHead = thisHead.replaceAll('{{keywords}}', keywords)
    thisHead = thisHead.replaceAll('{{description}}', description)
    thisHead = thisHead.replaceAll('{{imageUrl}}', imageUrl)
    thisHead = thisHead.replaceAll('{{articleUrl}}', `https://arinthros.com/blog/${fileName}`)

    let thisArticle = articleTemplate.toString()
    thisArticle = thisArticle.replace('{{head}}', thisHead)
    thisArticle = thisArticle.replace('{{menu}}', menu.toString())
    thisArticle = thisArticle.replace('{{article}}', html)
    
    return fs.promises.mkdir(`${basePaths.output}/${fileName}`).then(() => fs.promises.writeFile(`${basePaths.output}/${fileName}/index.html`, thisArticle))
  })).then(() => {
    console.log('finished generating html from markdown')
    process.exit(0)
  }).catch((error) => console.error(error.message))
}).catch((error) => console.error(error.message))