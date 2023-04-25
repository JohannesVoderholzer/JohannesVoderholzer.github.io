
import "../styles/stylesBlog.css";
import "../styles/blogCreateStyle.css";
import "../styles/style.css";
import { htmlParser } from "./blogCompiler";
import { db, firebaseApp } from './firebaseInit';
import { deleteDoc, deleteField, setDoc, doc, updateDoc } from "firebase/firestore";
import hljs from "highlight.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
console.log("loaded CreateBlog");

var mainUser = null;
const auth = getAuth(firebaseApp);
const monitorAuthState = async () => {
  onAuthStateChanged(auth, user => {
    if (user) {
      mainUser = user;
    }
    else {
      mainUser = null;
    }
  })
}
monitorAuthState();

export async function addBlog(blognametext, blogtext, blogImgUrl) {
  if (mainUser == null){
    showLoginError("You need to login before adding blogs!", null);
    return;
  }
  else if (blognametext.length < 4) {
    showLoginError("blog name should be at least 4 letters", null);
    return;
  }
  try { 
    const docRef = await setDoc(doc(db, "blogposts", blognametext), { 
      blogname: blognametext,
      text: blogtext,
      userName: mainUser.displayName,
      comments: {},
      changedCommentId : "",
      userID: mainUser.uid
    });
    const docRef2 = await setDoc(doc(db, "blogpostsreactions", blognametext), {userID: mainUser.uid})
    const docRef3 = await updateDoc(doc(db, "blogpostsAll", "allPosts"), {
      [blognametext]: {
        blogUserIcon: mainUser.photoURL,
        blogauthor: mainUser.displayName,
        blogname: blognametext,
        blogLikes: 0,
        blogImageURL: blogImgUrl
      }
    })
  } catch (e) {
    console.log(e);
    showLoginError("Zugriff verweigert:(", null);
    return;
  }
}

export async function deleteBlog(blognametext) {
  if (mainUser == null){
    showLoginError("You need to login before deleting blogs!", null);
    return;
  }
  try {
    await deleteDoc(doc(db, "blogposts", blognametext));
    await deleteDoc(doc(db, "blogpostsreactions", blognametext));
    await updateDoc(doc(db, "blogpostsAll", "allPosts"), {
      [blognametext]: deleteField()
    });
  } catch (e) {
    console.log(e);
    showLoginError("Zugriff verweigert:(", null);
    return;
  }
  showGreenMessage("Successfully deleted blog!");
}

const inputField = document.getElementById('input');
const outputField = document.getElementById('output');
inputField.addEventListener('input', function(event) {
    HandleInputChange(event.target.value);
});

function AddToInput(string){
  inputField.value += string;
  HandleInputChange(inputField.value);
}

document.getElementById('addSnippedFrame').addEventListener('click', (event) => {
  AddToInput(`
\`\`\`
.mainHeader
{
    position: absolute;
    top: 0;
    Left:0;
    width:100%;
    padding:15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 50;
}
\`\`\` 
`)
})

document.getElementById('addRefFrame').addEventListener('click', (event) => {
  AddToInput(`#[name='Example Reference', text='Hallo', authors='cool person 1 and cool person 2', link='https://de.wikipedia.org/wiki/Test', year='2023']#`);
})

document.getElementById('addPointsFrame').addEventListener('click', (event) => {
  AddToInput(`
* numbered point
  - point 1
  - point 2
* another numbered point
- point 2`);
});

document.getElementById('addImgFrame').addEventListener('click', (event) => {
  AddToInput(`#I[href="https://picsum.photos/536/354", caption="A cool image", size="100%"]I#`);
});

let curr_html = "";

function HandleInputChange(new_input){
  let changed_input = new_input.replaceAll("$", "*");
  changed_input = changed_input.replaceAll("§", "#");
  changed_input = changed_input.replaceAll("ß", "-");
  curr_html = htmlParser("\n" + changed_input + "\n\n");
  outputField.innerHTML = curr_html;
  // outputField2.innerHTML = curr_html;
  hljs.highlightAll();
}


export const btnAddBlog = document.querySelector('#btnAddBlog');
export const btnDeleteBlog = document.querySelector('#btnDeleteBlog');

btnAddBlog.addEventListener('click', (event) => {
  const blognametext = document.getElementById("lblBlogname").value;
  const blognameurl = document.getElementById("lblBlogUrltxt").value;
  const currentDate = new Date();
  const isoString = currentDate.toISOString();
  const html_text = `<div id="creationDate">${isoString}</div>` + "<div id='testdiv'>" + curr_html + '</div>'
  addBlog(blognametext, html_text, blognameurl);
})

btnDeleteBlog.addEventListener('click', (event) => {
  const blognametext = document.getElementById("lblBlogname").value;
  deleteBlog(blognametext);
})

function showLoginError(text){
  console.log(text);
}