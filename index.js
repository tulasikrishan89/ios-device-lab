const fs = require('fs')
const express = require('express')

const path = require('path')

const app = express()

app.use('/static', express.static(path.join(__dirname, 'uploads')))

app.get('/getimages', (req, res) => {
    let images = getImagesFromDir(path.join(__dirname, 'uploads'))

    res.render('index', {title: 'Node.js - Auto Generate Gallery from a Directory'})
})
function getImagesFromDir(dirPath) {

    let allImages = []

    let files = fs.readdirSync(dirPath)

    for(file in files){
        let fileLocation = path.join(dirPath, file)
        var stat = fs.statSync(fileLocation)

        if(stat && stat.isDirectory){
            getImagesFromDir(fileLocation)
        }
        else if (stat && stat.isFile() && ['.jpg', '.png']
        .indexOf(path.extname(fileLocation)) !== -1){
            allImages.push('static/'+file)
        }
    }

    return allImages
}

app.listen(5000)