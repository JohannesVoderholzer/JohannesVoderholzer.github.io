
console.log("loaded script_elements.js");

class SkillBar {
    constructor(name, level) {
        this.element = document.createElement("div");
        this.element.style.padding = "9px";
        this.level = level;
        this.container = document.createElement("div");
        this.container.className = "container";
        this.container.style.backgroundColor = "whitesmokes";
        this.container.style.width = "100%";
        this.leftText = document.createElement("div");
        this.leftText.className = "normalText";
        this.leftText.textContent = name;
        this.rightText = document.createElement("div");
        this.rightText.className = "normalText";
        this.rightText.textContent = level + "%";
        this.container.appendChild(this.leftText);
        this.container.appendChild(this.rightText);
        this.element.appendChild(this.container);
    
        this.healthBar = document.createElement("div");
        this.healthBar.className = "health-bar";
        this.currentHealth = document.createElement("div");
        this.currentHealth.className = "current-health";
        this.healthBar.appendChild(this.currentHealth);
        this.element.appendChild(this.healthBar);
    }
  
    setLevel(level) {
        this.rightText.textContent = level + "%";
        this.currentHealth.style.width = level + "%";
    }
}
const bar_div = document.getElementById("bars");

let skillnames = [
    ["python", "C#", "C"],
    ["Java", "Javascript", "html/css"],
];

let skillPercents = [
    [85, 60, 20],
    [45, 20, 20],
  ];

var skillbars = [];

for (var j = 1; j <= 2; j++) {
    var column = document.createElement("div");
    column.className = "column hidden; width: 500px";

    for (var i = 1; i <= 3; i++) {
        const healthBar = new SkillBar(skillnames[j-1][i-1], skillPercents[j-1][i-1]);
        column.appendChild(healthBar.element);
        skillbars.push(healthBar);
    }
    bar_div.appendChild(column);
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting){
            entry.target.classList.add('show');
        }
        else{
            entry.target.classList.remove('show');
        }
    });
});

const observerTabs = new IntersectionObserver((entry) => {
    if (entry[0].isIntersecting){
        skillbars.forEach(element => {
            element.setLevel(element.level);
        });
    }
    else{
        skillbars.forEach(element => {
            element.setLevel(0);
        });
    }
});

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));
observerTabs.observe(bar_div);

