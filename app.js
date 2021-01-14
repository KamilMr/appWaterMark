const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

/* process.stdout.write('Type "E" to exit, type "H" to say hello!');
process.stdin.on('readable', () => {
const input = process.stdin.read();
const instruction = input.toString().trim();
if (instruction === 'E') {
process.stdout.write('Exiting app...');
process.exit();
}
else if (instruction === 'H') {process.stdout.write('Hi! How are you?');;
}
else {
process.stdout.write('Wrong instruction!\n');
}
});
 */

const addTextWatermarkToImage = async function(inputFile, outputFile, text){
    
    
    try {
        const image = await Jimp.read(inputFile);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        const textData = {
            text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        };
        image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
        await image.quality(100).writeAsync(outputFile);
        console.log('Your file is ready in ./img/  as '+ outputFile);
        
        
    }
    catch(error) {
    console.log('Something Went wrong. Try again!');
    startApp();
    }
}


const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
    try {
        const image = await Jimp.read(inputFile);
        const watermark = await Jimp.read(watermarkFile);
    
        const x = image.getWidth() / 2 - watermark.getWidth() / 2;
        const y = image.getHeight() / 2 - watermark.getHeight() / 2;
    
        image.composite(watermark, x, y, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 0.5,
        });
        await image.quality(100).writeAsync(outputFile);
        console.log('Your file is ready in ./img/  as '+ outputFile);

    }
    catch(error){
        console.log('Something went wrong. Try again!');
        startApp();
    }
    
};

const prepareOutputFilename = param => {
    let file = param;
    let splitedFile = file.split('.');
    let addWithWatermark = splitedFile[0] + 'WithWatermark';
    let connectedWords = addWithWatermark + '.'+splitedFile[1];
    return connectedWords;
}

const startApp = async () => {

    const answer = await inquirer.prompt([{
        name: 'start',
        message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img`',
        type: 'confirm'
    }]);

    if(!answer.start) process.exit();

    const options = await inquirer.prompt([{
        name: 'inputImage',
        type: 'input',
        message: 'What file do you want to mark?',
        default: 'test.jpg'
    }, {
        name: 'watermarkType',
        type: 'list',
        choices: ['Text watermark', 'Image watermark']
    }]);

    if(options.watermarkType === 'Text watermark') {
        const text = await inquirer.prompt([{
        name: 'value',
        type: 'input',
        message: 'Type your watermark text:',
        }]);
        options.watermarkText = text.value;
        if (fs.existsSync('./img/' + options.inputImage)) {
            addTextWatermarkToImage('./img/' + options.inputImage, './img/'+ prepareOutputFilename(options.inputImage), text.value)
          } else {console.log('Something went wrong... Try again');
          startApp();
        }
    } else {
        const image = await inquirer.prompt([{
        name: 'filename',
        type: 'input',
        message: 'Type your watermark name:',
        default: 'logo.png',
        }]);
        options.watermarkImage = image.filename;
        if (fs.existsSync('./img/' + options.inputImage) && fs.existsSync('./'+ image.filename)) {
            addImageWatermarkToImage('./img/' + options.inputImage, './img/'+ prepareOutputFilename(options.inputImage), image.filename)
          } else {console.log('Something went wrong... Try again');
          startApp();
        }
    }
}

startApp();
