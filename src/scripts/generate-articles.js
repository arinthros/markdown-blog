const showdown = require('showdown')
const fs = require('fs')

const basePaths = {
  source: `${process.cwd()}/src/blog`,
  output: `${process.cwd()}/dist/blog`
}

const converter = new showdown.Converter({ghCompatibleHeaderId: true, tasklists: true, simpleLineBreaks: true,})

const articles = fs.readdirSync(`${process.cwd()}/src/blog`)

const menu = fs.readFileSync(`${process.cwd()}/src/templates/_menu.html`)
const articleHeadTemplate = fs.readFileSync(`${process.cwd()}/src/templates/article/_head.html`)
const articleTemplate = fs.readFileSync(`${process.cwd()}/src/templates/article/article.html`)
const listHead = fs.readFileSync(`${process.cwd()}/src/templates/blog-list/_head.html`)
const listItemTemplate = fs.readFileSync(`${process.cwd()}/src/templates/blog-list/_item.html`)
const listTemplate = fs.readFileSync(`${process.cwd()}/src/templates/blog-list/list.html`)

let listHtml = listTemplate.toString()
    listHtml = listHtml.replace('{{head}}', listHead.toString())
    listHtml = listHtml.replace('{{menu}}', menu.toString())
    listHtml = listHtml.replace('<li><a href="https://arinthros.com/blog">', '<li class="active"><a href="https://arinthros.com/blog">')


const listArticles = []

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
      
      let cleanedDataString = dataString.replace(/<keywords>.*<\/keywords>/gm, '')
      cleanedDataString = cleanedDataString.replace(/<imageUrl>.*<\/imageUrl>/gm, '')

      const html = converter.makeHtml(cleanedDataString)
      resolve({ ...fileData, html, title, description, keywords, imageUrl })
    })
  })
})).then((values) => {
  Promise.all(values.map((value) => {

    const { html, fileName, title, description, keywords, imageUrl } = value

    const articleUrl = `https://arinthros.com/blog/${fileName}`

    let articleHead = articleHeadTemplate.toString()
    articleHead = articleHead.replace(/{{title}}/g, title)
    articleHead = articleHead.replace(/{{keywords}}/g, keywords)
    articleHead = articleHead.replace(/{{description}}/g, description)
    articleHead = articleHead.replace(/{{imageUrl}}/g, imageUrl)
    articleHead = articleHead.replace(/{{articleUrl}}/g, articleUrl)

    let article = articleTemplate.toString()
    article = article.replace('{{head}}', articleHead)
    article = article.replace('{{menu}}', menu.toString())
    article = article.replace('{{article}}', html)

    let listItem = listItemTemplate.toString()
    listItem = listItem.replace(/{{articleUrl}}/g, articleUrl)
    listItem = listItem.replace(/{{title}}/g, title)
    listItem = listItem.replace(/{{description}}/g, description)
    
    listArticles.push(listItem)
    
    return fs.promises.mkdir(`${basePaths.output}/${fileName}`).then(() => fs.promises.writeFile(`${basePaths.output}/${fileName}/index.html`, article))
  })).then(() => {

    listHtml = listHtml.replace('{{list}}', listArticles.join('\n'))
    fs.writeFileSync(`${basePaths.output}/index.html`, listHtml)

    console.log('finished generating html from markdown')
    process.exit(0)
  }).catch((error) => console.error(error.message))
}).catch((error) => console.error(error.message))