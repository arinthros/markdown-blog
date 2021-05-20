const Client = require('ssh2-sftp-client')
const sftp = new Client()

async function uploadBlogFiles() {
  try {
    console.log('Deploying blog.')

    await sftp.connect({
      host: process.env.SFTP_H,
      port: process.env.SFTP_PORT,
      username: process.env.SFTP_U,
      password: process.env.SFTP_P,
    })
  
    // If granular file reporting is needed, uncomment this function.
    // sftp.on('upload', (info) => {
    //   console.log(`Uploaded ${info.source}`)
    // })
  
    await sftp.uploadDir(`${process.cwd()}\\dist\\blog`, '/home/arinthros/arinthros.com/blog')
    
    console.log('Successfully deployed blog!')
    process.exit(0)
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

uploadBlogFiles()