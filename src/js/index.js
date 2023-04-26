
import "../styles/style.css";
import "./script_elements.js";
import { SendPersonalMessage, getAllBlogs } from "./sendPersonalMessage";
import { showError } from "./showErrors";
const cookies = require('js-cookie');
console.log("loaded index.js");

const debug = document.getElementById('debug');
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');
var width = GetWindowWidth();
var height = GetWindowHeight();
canvas.width = width;
canvas.height = height;

function GetWindowWidth(){
    return window.innerWidth;
}

function GetWindowHeight(){
    return window.innerHeight;
}

var canvasDraw = document.createElement("canvas");
canvasDraw.width = width;
canvasDraw.height = height;
canvasDraw.style.display = "none";
document.body.appendChild(canvasDraw);
var ctxTransparency = canvasDraw.getContext('2d');

let particlesArr;
let main_colorHex = '#4493b8';
let add_colorHex = '#ffc766';
let randomizationMain = 5;
let randomizationAdd = 5;
let main_color = null;
let add_color = null;


// background: radial-gradient(#4493b8, #0d1e38);
function hexToHsla(hex) {
    // Convert the HEX color to RGB.
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
  
    // Find the maximum and minimum values of R, G, and B.
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
  
    // Calculate the hue.
    let h = 0;
    if (max === min) {
      h = 0;
    } else if (max === r) {
      h = 60 * (0 + (g - b) / (max - min));
    } else if (max === g) {
      h = 60 * (2 + (b - r) / (max - min));
    } else if (max === b) {
      h = 60 * (4 + (r - g) / (max - min));
    }
    if (h < 0) {
      h += 360;
    }
  
    // Calculate the saturation.
    let s = 0;
    if (max === 0 || min === 1) {
      s = 0;
    } else {
      s = (max - min) / (1 - Math.abs(max + min - 1));
    }
  
    // Calculate the lightness.
    const l = (max + min) / 2;
  
    // Return the HSLA values as an object.
    return { h: h, s: s * 100, l: l * 100, a: 1 };
}

function MixHslaColors(c1, c2, factor){
    return { h: (1-factor)*c1.h + (factor)*c2.h, s: (1-factor)*c1.s + (factor)*c2.s, l: (1-factor)*c1.l + (factor)*c2.l, a: (1-factor)*c1.a + (factor)*c2.a}
}

function IsInGrid(x, y){
    return x >= 2 && y >= 2 && x < rows-1 && y < cols-1;
}

// get mouse position
let mouse = {
    x: null, 
    y: null,
    radius: (canvas.height/80) * (canvas.width/80)
}

let gridSize = 25;
let allowedDirections = [];
let usedPositions = [];
let numberOfParticles = 5;
let maxNumParticles = 10;

// helper functions: 
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function printSet(set) {
    let result = "{";
    set.forEach(function(element) {
      result += element.toString() + ", ";
    });
    result = result.slice(0, -2); // remove the last ', '
    result += "}";
}

function GetRandomDirection(curr_pos){
    shuffle(allowedDirections);
    for (let i = 0; i < allowedDirections.length; i++) {
        let dir = allowedDirections[i];
        let resultPos = curr_pos.add(dir.mul(gridSize));
        if (usedPositions[resultPos.x/gridSize][resultPos.y/gridSize] == 0){
            return resultPos;
        }
    }
    return -1;
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    hashCode() {
        return this.x ^ this.y;
    }

    sub(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    mul(fac) {
        return new Vector(this.x * fac, this.y * fac);
    }
    
    round() {
        return new Vector(Math.round(this.x), Math.round(this.y));
    }

    abs(){
        return new Vector(Math.abs(this.x), Math.abs(this.y));
    }

    equals(other) {
        return this.x == other.x && this.y == other.y;
    }

    toString() {
        return `Vector(${this.x}, ${this.y})`;
    }
}

class Particle{
    constructor(start_pos, size, color, headColor, movementSpeed){
        this.pos = start_pos;
        this.next = start_pos;
        this.size = size;
        this.HSLScolor = color;
        this.HSLSheadColor = headColor;
        this.movementSpeed = movementSpeed;
        this.trail = [new Vector(this.pos.x, this.pos.y)];
        this.isActive = true;
        this.fadeColor = 1;
    }

    draw() {
        /*
        // draw last line connection the leading dot with the trail:
        if (this.trail.length >= 2){
            const lastPoint = this.trail[this.trail.length-2];
            ctx.lineWidth = this.size/4;
            ctx.beginPath();
            ctx.strokeStyle = 'hsla(' + this.HSLScolor.h + ', ' + this.HSLScolor.s + '%, ' + this.HSLScolor.l + '%, ' + this.HSLScolor.a*this.fadeColor + ')';
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(this.pos.x, this.pos.y);
            ctx.stroke();
            ctx.closePath(); // Close the current path.
            ctx.lineWidth = 1;
        }
        */
        
        ctx.globalAlpha = 1;
        
        // Draw the current position of the particle
        ctx.beginPath();
        const fillColor = this.HSLScolor;
        ctx.fillStyle = 'hsla(' + fillColor.h + ', ' + fillColor.s + '%, ' + fillColor.l + '%, ' + 1 + ')';
        ctx.arc(this.pos.x, this.pos.y, this.size/4, 0, Math.PI*2, false);
        ctx.fill();
        ctx.closePath();
        let progress = (Math.abs(this.pos.x - this.next.x) + Math.abs(this.pos.y - this.next.y))/gridSize;
        

        
        // Draw the trail by looping through the points in the trail array
        for (let i = 1; i < this.trail.length-1; i++) {
            var randomNumber = Math.random();
            if (randomNumber < 1){
                let alpha = (i/this.trail.length)*this.fadeColor;
                const point1 = this.trail[i].mul(progress);
                const next_point = this.trail[i+1].mul(1 - progress);
                const point = point1.add(next_point);
                ctx.beginPath();
                ctx.arc(point.x, point.y, this.size/6, 0, Math.PI*2, false); 
                const fillColor = this.HSLScolor;
                ctx.fillStyle = 'hsla(' + fillColor.h + ', ' + fillColor.s + '%, ' + fillColor.l + '%, ' + alpha + ')';
                ctx.fill();
                }
        }
    }

    addPosition(pos){
        this.trail.push(pos);
        usedPositions[pos.x/gridSize][pos.y/gridSize] = 1;
    }
    
    kill(){
        this.isActive = false;
    }

    update(){
        if (this.isActive){
            var nextXDirect = this.next.x - this.pos.x;
            var nextYDirect = this.next.y - this.pos.y;
            if (Math.abs(nextXDirect) > this.movementSpeed){
                this.pos.x = this.pos.x + Math.sign(nextXDirect)*this.movementSpeed;
            }
            else{
                this.pos.x = this.next.x;
            }
            if (Math.abs(nextYDirect) > this.movementSpeed){
                this.pos.y = this.pos.y + Math.sign(nextYDirect)*this.movementSpeed;
            }
            else{
                this.pos.y = this.next.y;
            }
    
            if (this.next.equals(this.pos)){
                this.next = GetRandomDirection(this.pos);
                if (this.next == -1)
                {
                    this.kill();
                    this.draw();
                    return;
                }
                this.addPosition(this.next);
            }
            this.draw();
        }
        else{
            // delete yourself from array:
            particlesArr.splice(particlesArr.indexOf(this), 1);
            // remove trail from disallowed positions:
            this.trail.forEach(element => {
                usedPositions[element.x/gridSize][element.y/gridSize] = 0;
            });
        }
    }
}

function print(inpt){
    debug.innerHTML = inpt;
}

function ToNearestGridPosition(x, gridSize){
    return Math.round(x / gridSize) * gridSize
}

function ToGridPosition(x, gridSize){
    return Math.floor(x / gridSize) * gridSize
}

function randomizeColor(hslaCol, value){
    let hsla = {h:hslaCol.h, s: hslaCol.s, l: hslaCol.l, a: hslaCol.a};
    hsla.h += (Math.random()-0.5)*2*Math.min(value, hsla.h, 255-hsla.h);
    hsla.s += (Math.random()-0.5)*2*Math.min(value, hsla.s, 255-hsla.s);
    hsla.l += (Math.random()-0.5)*2*Math.min(value, hsla.l, 255-hsla.l);
    return hsla;
}

function TryAddNewPoint(){
    let size = gridSize;
    let x = (Math.random()* ((width - size*2) - (size*2)) + size* 2);
    let y = (Math.random()* ((height - size*2) - (size*2)) + size* 2);
    x = ToGridPosition(x, gridSize);
    y = ToGridPosition(y, gridSize);
    let rand_color = main_color;
    rand_color = randomizeColor(rand_color, randomizationMain);
    TryAddNewPointAt(x, y, rand_color);
}

function TryAddNewPointAt(x, y, color){
    let size = gridSize*(1 - (Math.random() - 0.6)*1);
    let headColor = color;
    if (usedPositions[x/gridSize][y/gridSize] == 1){
        return;
    }
    usedPositions[x/gridSize][y/gridSize] = 1;
    particlesArr.push(new Particle(new Vector(x, y), size, color, headColor, gridSize*0.11));
}

let rows = 0;
let cols = 0;
let scale = 1;

function init(){
    main_color = hexToHsla(main_colorHex);
    add_color = hexToHsla(add_colorHex);
    width = GetWindowWidth();
    height = GetWindowHeight();
    scale = 1800/width;
    width *=scale;
    height *=scale;
    canvas.width = width;
    canvas.height = height;
    canvasDraw.width = width;
    canvasDraw.height = height;
    ctxTransparency = canvasDraw.getContext('2d');
    ctxTransparency.globalAlpha = draw_alpha;
    ctxTransparency.filter = "blur(1px)";

    gridSize = Math.round((height+width)/100);
    if (GetWindowWidth() <= 992){
        gridSize = Math.round(gridSize*1.3);
    }
    // init used positions map:
    rows = Math.round(width/gridSize);
    cols = Math.round(height/gridSize);; // number of columns
    usedPositions = new Array(rows); // create an array with the number of rows

    for (let i = 0; i < rows; i++) {
        usedPositions[i] = new Array(cols); // create an array with the number of columns in each row
        for (let j = 0; j < cols; j++) {
            if (i == 0 || j == 0 || i == rows-1 || j == cols-1){
                usedPositions[i][j] = 1;
            }
            else {
                usedPositions[i][j] = 0; // set each element to 0
            }
        }
    }

    allowedDirections = [new Vector(-1, 0), new Vector(1, 0), new Vector(0, 1), new Vector(0, -1)];
    particlesArr = [];
}



const draw_alpha = 0.9;
ctxTransparency.globalAlpha = draw_alpha;


function animate(){
    ctxTransparency.clearRect(0,0,width,height);
    ctxTransparency.drawImage(canvas,0,0);
    ctx.clearRect(0,0,width,height);
    ctx.drawImage(canvasDraw,0,0);

    particlesArr.forEach(element => {
        element.update();
    });
    
    if (particlesArr.length < numberOfParticles){
        TryAddNewPoint();
    }
    if (particlesArr.length - maxNumParticles > 0){
        let rand_part = particlesArr[numberOfParticles+1];
        rand_part.kill();
    }
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove',
    function(event){
        mouse.x = event.offsetX*scale;
        mouse.y = event.offsetY*scale;
        let x = ToNearestGridPosition(mouse.x, gridSize);
        let y = ToNearestGridPosition(mouse.y, gridSize);
        if (IsInGrid(x/gridSize, y/gridSize)){
            let color = add_color;
            TryAddNewPointAt(x, y, randomizeColor(color, randomizationAdd)); // TryAddNewPointAt(x, y, '#ffc766');
        }
    }
);


window.addEventListener('resize',
    function(){
        init();
    }
)


init();
let cookie = cookies.get('theme');

if (cookie == null){
    cookie = "dark-theme";
}
  
document.body.className = cookie;
add_colorHex = getComputedStyle(document.body).getPropertyValue('--secondary-worm').trim();
main_colorHex = getComputedStyle(document.body).getPropertyValue('--primary-worm').trim();
animate();

// init theme icon:
document.getElementById('themeIcon').style.fill = "var(--mainbackground-primary)";

function ChangeTheme(){
    var element = document.body;
    if (element.className == "dark-theme"){
        element.className = "light-theme";
        cookies.set('theme', 'light-theme', { expires: 100 });
        // document.cookie = "theme=light-theme; path=/";
    }
    else{
        element.className = "dark-theme";
        cookies.set('theme', 'dark-theme', { expires: 100 });
        // document.cookie = "theme=dark-theme; path=/";
    }
    
    add_colorHex = getComputedStyle(document.body).getPropertyValue('--secondary-worm').trim();
    main_colorHex = getComputedStyle(document.body).getPropertyValue('--primary-worm').trim();

    document.getElementById('themeIcon').style.fill = "var(--mainbackground-primary)";
    init();
}

document.getElementById("themeButton").addEventListener("click", ChangeTheme);
document.getElementById("btnSendPersonalMessage").addEventListener("click", (event) => {SendPersonalMessage("normal")});

// initialize blogposts: 

function PickFromBlogPreviews(all_blogs) {
    all_blogs.sort((a, b) => b.blogLikes - a.blogLikes);
    const topBlogs = all_blogs.slice(0, 3);
    all_blogs.splice(0, 3);
  
    for (let i = all_blogs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all_blogs[i], all_blogs[j]] = [all_blogs[j], all_blogs[i]];
    }
    const randomBlogs = all_blogs.slice(0, 3);
    return [...topBlogs, ...randomBlogs];
}

async function InitBlogpostsPreview(){
    let blogposts = await getAllBlogs();
    if (blogposts == null){
        return;
    } 
    blogposts = PickFromBlogPreviews(blogposts);
    const preview_div = document.querySelector("#grid");
    const cardTemplate = document.querySelector("#cardTemplate");
    
    for (const blog of blogposts) {
        const card = cardTemplate.content.cloneNode(true);
        card.querySelector(".backgroundIMG").src = blog.blogImageURL;
        card.querySelector(".content d").textContent = blog.blogname;
        card.querySelector(".nav-left d").textContent = `by ${blog.blogauthor}`;
        card.querySelector(".nav-right span").textContent = blog.blogLikes;
        
        const link = document.createElement("a");
        link.classList.add('noDecoration');
        link.href = "./blog.html?blogid=" + blog.blogname;
        link.appendChild(card);
        preview_div.appendChild(link);
    }
}

InitBlogpostsPreview();
