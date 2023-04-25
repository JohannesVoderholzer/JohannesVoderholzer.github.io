const fs = require('fs');
const path = require('path');
const compileModule = require('./js/blogCompiler');


function creationDate(filePath) {
  if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const mtime = stats.mtime;
      return mtime.toISOString();
  } else {
      return null;
  }
}

function convertToHtml(filePath, layout, timediff, blogname) {
    let content = fs.readFileSync(filePath);
    content = content.toString().replace(/\r/g, '');
    content = content.replaceAll("$", "*");
    content = content.replaceAll("§", "#");
    content = content.replaceAll("ß", "-");
    /*let htmlContent = layout.replace("[blogtext here]", htmlParser(content));
    htmlContent = htmlContent.replace("[timediff]", timediff);
    htmlContent = htmlContent.replace("[title]", blogname);*/
    return `<div id="creationDate">${timediff}</div><div id='testdiv'>` + compileModule.htmlParser("\n" + content + "\n\n") + "</div>";

}

function main() {
    const layoutFilePath = path.join('src', 'blogtemplates', '00_blogLayout.html')
    const layout = fs.readFileSync(layoutFilePath, 'utf8').toString().replace(/\r/g, '');;

    const templatepath = path.join('src', 'blogtemplates', '00_template.html')
    templateStr = fs.readFileSync(templatepath, 'utf8').toString().replace(/\r/g, '').replace(/\n/g, '');

    // Create the blogs folder if it doesn't exist
    const blogsDir = path.join('src', 'blogs');
    if (!fs.existsSync(blogsDir)) {
        fs.mkdirSync(blogsDir);
    }
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    const blogsrawDir = path.join('src', 'blogsraw');
    fs.readdirSync(blogsrawDir).forEach(fileName => {
        if (fileName.endsWith(".txt")) {
            const filePath = path.join(blogsrawDir, fileName);
            const htmlContent = convertToHtml(filePath, layout, creationDate(filePath), fileName.split(".")[0]);
            const newFileName = fileName.replace(".txt", ".html");
            const newFilePath = path.join(blogsDir, newFileName);
            if (fs.existsSync(newFilePath)) {
                const existingContent = fs.readFileSync(newFilePath, 'utf8');
                if (existingContent !== htmlContent) {
                    fs.writeFileSync(newFilePath, htmlContent);
                }
            } else {
                fs.writeFileSync(newFilePath, htmlContent);
            }
        }
    });
  }

main();