
// TODO: Double \n\n makes new line 
// Add sidebar for output!!!

import "../styles/stylesBlog.css";
import "../styles/style.css";

console.log("loaded blogParser.js");

let cookie = getCookie('theme');

if (cookie == null){
  cookie = "dark-theme";
}

document.body.classList = cookie;

if (document.body.classList == "dark-theme")
{
  require('highlight.js/styles/github-dark.css');
}
else{
  require('highlight.js/styles/github.css');
}

import hljs from 'highlight.js';
hljs.highlightAll();

function getCookie(key) {
  let nameEQ = key + "=";
  let ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
    let c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function copyCodeSnippet(codeSnippet, image, curr_button) {
  let curr_button_func = curr_button.onclick;
  let old_title = curr_button.getAttribute('data-title');

  navigator.clipboard.writeText(codeSnippet)
  .then(() => {
    // Change the background color of the div
    image.setAttribute("href", "../icons/icons.svg#check");
    curr_button.onclick = "";
    curr_button.setAttribute('data-title', 'copied to clipboard');

    // Change the background color back after 3 seconds
    setTimeout(() => {
      image.setAttribute("href", "../icons/icons.svg#copy");
      curr_button.onclick = curr_button_func;
      curr_button.setAttribute('data-title', old_title);
    }, 3000);
    
    console.log("Code snippet copied to clipboard");
    // you can also show a success message to the user here
  })
  .catch((error) => {
    console.error("Failed to copy code snippet: ", error);
    // you can also show an error message to the user here
  });
}



function timeDifference(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(months / 12);

  if (years > 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
  } else if (months > 0) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
  } else if (days > 0) {
      return `${days} ${days === 1 ? 'day' : 'days'}`;
  } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  } else {
      return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  }
}

let time_el = document.getElementById("timediff");
time_el.innerHTML = timeDifference(new Date(time_el.innerHTML)) + " ago";

// Add CopyCode buttons functions:

const myButtons = document.querySelectorAll('.copyCodeButton');

myButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const preElement = button.parentNode.parentNode.parentNode.querySelector('pre');
    const codeElement = preElement.querySelector('code');
    const svgElement = button.querySelector('svg');
    const useElement = svgElement.querySelector('use');

    copyCodeSnippet(codeElement.textContent, useElement, button);
  });
});

window.addEventListener('load', function() {
  document.body.style.display = '';
});