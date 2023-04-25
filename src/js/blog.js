

import "../styles/stylesBlog.css";
import "../styles/style.css";
console.log("loaded blog.js");

import {confirmCustomFunction, showError, showGreenMessage} from './showErrors';
import {ADMIN, GetUser} from './auth';
import {getBlogWithComments, LikeComment, AddReactionToBlogpost, addCommentToBlogPost, deleteCommentFromPost} from './database';

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
    image.setAttribute("href", "./icons/icons.svg#check");
    curr_button.onclick = "";
    curr_button.setAttribute('data-title', 'copied to clipboard');

    // Change the background color back after 3 seconds
    setTimeout(() => {
      image.setAttribute("href", "./icons/icons.svg#copy");
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

window.addEventListener('load', function() {
  document.body.style.display = '';
});

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export var blogname = getParameterByName("blogid");
if (blogname == null){
    blogname = "standart";
}
else{
  blogname = blogname.replace(/%20/g, " ");
}

import hljs from 'highlight.js';
import { getAllBlogs, SendPersonalMessage } from "./sendPersonalMessage";

document.getElementById("btnSendPersonalMessage").addEventListener("click", (event) => {SendPersonalMessage("bug")});

let blogEl = null;
let blogElReactions = null;
let blogComments = null; 

// reactions:
let reactions = [0, 0, 0, 0];

function SortComments(sorting_function){
  let combinedArray = blogComments.map((comment, index) => {
    return {id: comment.commentKey, this_comment: comment};
  });
  combinedArray.sort((a, b) => sorting_function(a.this_comment, b.this_comment));
  blogComments = combinedArray.map(item => item.this_comment);
}

async function GetData(blogname){
  try {
    blogEl = null;
    const blogElArr = await getBlogWithComments(blogname);
    blogEl = blogElArr[0];
    blogElReactions = blogElArr[2];
    blogComments = blogElArr[1];

    
    // sort comments by number of likes:
    SortComments((a, b) => {
      if (GetUser() != null && a.userID !== b.userID){
        
        if (b.userID === GetUser().uid || b.userID === ADMIN) { return 1; };
        if (a.userID === GetUser().uid || a.userID === ADMIN) { return -1; };
      }
      return b.likes - a.likes;
    });
    
    for (const [userId, reaction] of Object.entries(blogElReactions)) {
      reactions[reaction] += 1;
    }
    return blogEl.text;
  } catch (error) {
    console.log("Blog not in database(" + error + ")");
    try{
      const response = await fetch('blogs/' + blogname  + ".html");
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text();
    } catch (error){
      return '<div id="creationDate">2023-03-31T09:39:50.456Z</div><div id="testdiv"><p>404 blog not Found😟</p><div>';
    }
  }
}

function PickFromBlogPreviews(all_blogs) {
  const size = 4;
  if (all_blogs.length <= size){
    return all_blogs;
  }
  const half_size = size/2;
  all_blogs = all_blogs.filter(blog => blog.blogname !== blogname);
  all_blogs.sort((a, b) => b.blogLikes - a.blogLikes);
  const topBlogs = all_blogs.slice(0, half_size);
  all_blogs.splice(0, half_size);

  for (let i = all_blogs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all_blogs[i], all_blogs[j]] = [all_blogs[j], all_blogs[i]];
  }
  const randomBlogs = all_blogs.slice(0, half_size);
  return [...topBlogs, ...randomBlogs];
}

async function ShowOtherBlogsPreviews() {
  let all_blogs = await getAllBlogs();
  if (all_blogs == null){
    return;
  } 
  all_blogs = PickFromBlogPreviews(all_blogs);
  const morePosts = document.querySelector("#morePosts");
  morePosts.innerHTML = "";
  if (Array.isArray(all_blogs)) {
    const cardTemplate = document.querySelector("#cardTemplate");
    
    for (const blog of all_blogs) {
      const card = cardTemplate.content.cloneNode(true);
      card.querySelector(".backgroundIMG").src = blog.blogImageURL;
      card.querySelector(".content d").textContent = blog.blogname;
      card.querySelector(".nav-left d").textContent = `by ${blog.blogauthor}`;
      card.querySelector(".nav-right span").textContent = blog.blogLikes;
      
      const link = document.createElement("a");
      link.classList.add('noDecoration');
      link.href = "./blog.html?blogid=" + blog.blogname;
      link.appendChild(card);
      morePosts.appendChild(link);
    }
  } else {
    showError(all_blogs);
  }
}

export function LoadBlog(){
  ShowOtherBlogsPreviews();
  reactions = [0, 0, 0, 0];
  const fetch = require('node-fetch');
  GetData(blogname)
  .then((data) => {
    let parser = new DOMParser();
    let doc = parser.parseFromString(data, 'text/html');
  
    const blogLikeButtons = document.querySelectorAll('.BlogReactionButton');
      blogLikeButtons.forEach(blogLikeButton => {
        blogLikeButton.classList.remove("likedHeart");
    });
    const scriptTags = doc.getElementsByTagName("script");
  
    for (let i = scriptTags.length - 1; i >= 0; i--) {
      scriptTags[i].parentNode.removeChild(scriptTags[i]);
    }
  
    let testDiv = doc.querySelector('#testdiv');
    const blogtextDiv = document.getElementById('blogtext');
    blogtextDiv.innerHTML = testDiv.innerHTML;
    blogtextDiv.classList.remove("skeleton");
  
    // set time
    const time = doc.querySelector('#creationDate').innerHTML;
    let time_el = document.querySelector('#timediff');
    time_el.innerHTML = timeDifference(new Date(time)) + " ago";
    const mainTitle = document.querySelector('#blogTitle');
    mainTitle.innerHTML = blogname;
    if (blogEl != null){
      const byName = document.querySelector('#authorName');
      mainTitle.innerHTML = blogEl.blogname;
      byName.innerHTML = "by " + blogEl.userName;
      const blogLikes = document.querySelector('#bloglikeCount');
      const blogAngries = document.querySelector('#blogAngryCount');
      const blogDisgusted = document.querySelector('#blogDisgustedCount');
      const reactionDivs = [null, blogLikes, blogAngries, blogDisgusted];
      blogLikes.textContent = reactions[1];
      blogAngries.textContent = reactions[2];
      blogDisgusted.textContent = reactions[3];
      const main_user = GetUser();
      if (main_user != null){
        const curr_reaction = blogElReactions[main_user.uid];
        if (curr_reaction != null && curr_reaction != 0){
          reactionDivs[curr_reaction].parentNode.classList.add("likedHeart");
        }
      }
      blogComments = FilterComments(blogComments);
      LoadComments(blogComments);
    }
    AfterLoading();
  });
}


function ShowReplies(expand_content){
  let comm_id = parseInt(expand_content.dataset.comm_id);
  const this_comment = blogComments[comm_id];
  
  const replies = this_comment.replies;
  // fill div with replies:
  let c = 0;
  replies.forEach((reply) => {
    var template = document.querySelector('#commentTemplate');
    const commentFilled = FillComment(reply, template);
    commentFilled.dataset.parentCommentId = comm_id;
    commentFilled.dataset.replyId = c;
    const footer = commentFilled.querySelector('#expandFooter');
    footer.remove();
    const replyButton = commentFilled.querySelector('#expandContent');
    replyButton.remove();
    const expandButton = commentFilled.querySelector('.expandButton');
    expandButton.remove();
    if (reply.lastLiked != undefined && GetUser() != null && reply.lastLiked == GetUser().uid){
      commentFilled.querySelector('.likeButton').classList.add("likedHeart");
    }
    expand_content.appendChild(commentFilled);
    commentFilled.querySelector('.likeButton').addEventListener('click', AddLikeClick);
    c += 1;
  });

  expand_content.style.display = "block";
}

function HideReplies(expand_content){
  expand_content.innerHTML = "";
  expand_content.style.display = "none";
}

function ExpandEvent(event){
  const this_button = event.currentTarget;
  const expand_content = this_button.parentNode.parentNode.querySelector('#expandContent');
  const this_icon = this_button.querySelector("use");
  let expand_type = expand_content.dataset.type;

  if (expand_content.style.display == "none"){
    if (expand_type == "normal"){
      expand_content.style.display = "block";
    }
    else{
      ShowReplies(expand_content);
    }
    this_icon.setAttribute('href', './icons/icons.svg#caret-up');
  }
  else{
    if (expand_type == "normal"){
      expand_content.style.display = "none";
    }
    else{
      HideReplies(expand_content);
    }
    this_icon.setAttribute('href', './icons/icons.svg#caret-down');
  }
}

async function ReplyButtonClick(event){
  const reply_button = event.currentTarget;
  let commentInd = reply_button.parentNode.dataset.comm_id;
  const reply_text = reply_button.parentNode.querySelector('textarea');
  if (GetUser() == null){
    showError("You have to login to submit a reply!")
    return;
  }
  if (reply_text.value.length == 0){
    showError("You can't submit an empty comment!");
    return;
  }
  const result = await addCommentToBlogPost(blogname, FilterString(reply_text.value), new Date(), GetUser(), blogComments[commentInd].commentKey);

  if (result != "ok"){
    const errorDiv = reply_button.parentNode.querySelector('#errorDiv');
    errorDiv.textContent = result;
    errorDiv.style.display = 'block';
  }
  else{
    const errorDiv = reply_button.parentNode.querySelector('#errorDiv');
    reply_button.parentNode.style.display = 'none';
    reply_button.parentNode.innerHTML = "";
    errorDiv.style.display = 'none';
  }
}

function AddExpandClickEvents(){
  // adds functions to every expand button so that it replies for comments can be seen
  const myExpands = document.querySelectorAll('.expandButton');
  myExpands.forEach((button) => {
    button.addEventListener('click', ExpandEvent);
  })

  const myReplybuttons = document.querySelectorAll('.replybutton');
  myReplybuttons.forEach((button) => {
    button.addEventListener('click', ReplyButtonClick);
  })
}

async function AddLikeClick(event){
  const reply_button = event.currentTarget;
  if (!reply_button.classList.contains("likedHeart")){
    const likeCounter = reply_button.querySelector("span");
    const currLikeCount = parseInt(likeCounter.textContent);
    if (currLikeCount >= 50){
      return;
    }
    reply_button.classList.add("likedHeart");
    likeCounter.textContent = currLikeCount + 1;
    const expandContent = reply_button.parentNode.parentNode.querySelector("#expandContent");
    if (expandContent != null){
      let commentInd = expandContent.dataset.comm_id;
      const result = await LikeComment(blogname, blogComments[commentInd].commentKey, GetUser());
      if (result != "ok"){
        showError(result);
        likeCounter.textContent = parseInt(likeCounter.textContent) - 1;
        reply_button.classList.remove("likedHeart");
      }
      else{
        blogComments[commentInd].lastLiked = GetUser().uid;
        blogComments[commentInd].likes += 1;
      }
    }
    else{
      let commentInd = reply_button.parentNode.parentNode.parentNode.dataset.parentCommentId;
      let replyId = reply_button.parentNode.parentNode.parentNode.dataset.replyId;
      const result = await LikeComment(blogname, blogComments[commentInd].replies[replyId].commentKey, GetUser());
      if (result != "ok"){
        showError(result);
        likeCounter.textContent = parseInt(likeCounter.textContent) - 1;
        reply_button.classList.remove("likedHeart");
      }
      else{
        blogComments[commentInd].replies[replyId].lastLiked = GetUser().uid;
        blogComments[commentInd].replies[replyId].likes += 1;
      }
    }
  }
}

function AddLikeButtonClickEvents(){
  // for comments:
  const myLikeButtons = document.querySelectorAll('.likeButton');
  myLikeButtons.forEach((button) => {
    button.removeEventListener('click', AddLikeClick);
  });
  myLikeButtons.forEach((button) => {
    button.addEventListener('click', AddLikeClick);
  });
}

function SetReactionHighlight(reaction){
  var previous_react = 0;
  const blogLikeButtons = document.querySelectorAll('.BlogReactionButton');
    blogLikeButtons.forEach(blogLikeButton => {
      const this_data = parseInt(blogLikeButton.dataset.reaction); 
      const like_counter = blogLikeButton.querySelector(".likeCounterSpan");

      if (blogLikeButton.classList.contains("likedHeart")){
        blogLikeButton.classList.remove("likedHeart");
        like_counter.textContent = parseInt(like_counter.textContent) - 1;
      }
      if (this_data == reaction){
        blogLikeButton.classList.add("likedHeart");
        like_counter.textContent = parseInt(like_counter.textContent) + 1;
      }
  });
  return previous_react;
}

let num_reactions = 0;
function CheckReactionLimit(){
  if (num_reactions >= 10){
    return false;
  }
  num_reactions += 1
  return true;
}

let isUpdating = false;

async function BlogLikeClick(event){
  if (GetUser() == null){
    showError("You need to log in before reacting to the blogpost!");
    return;
  }
  if (isUpdating){
    return;
  }
  if (!CheckReactionLimit()){
    showError("Exceeded number of reaction switches");
    return;
  }
  
  isUpdating = true;
  const likebutton = event.currentTarget;
  const reaction = parseInt(likebutton.dataset.reaction);

  if (!likebutton.classList.contains("likedHeart")){
    const likeCounter = likebutton.querySelector("span");
    const original_reaction = SetReactionHighlight(reaction);
    const result = await AddReactionToBlogpost(blogname, GetUser(), reaction, blogElReactions);
    
    if (result != "ok"){
      likebutton.classList.remove("likedHeart");
      likeCounter.textContent = parseInt(likeCounter.textContent) - 1;
      SetReactionHighlight(original_reaction);
    }
  }
  else{
    const likeCounter = likebutton.querySelector("span");
    likebutton.classList.remove("likedHeart");
    const result = await AddReactionToBlogpost(blogname, GetUser(), reaction, blogElReactions);

    if (result == "ok"){
      likeCounter.textContent = parseInt(likeCounter.textContent) - 1;
    }
    else{
      likebutton.classList.add("likedHeart");
    }
  }
  isUpdating = false;
}

function AfterLoading(){
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
  hljs.highlightAll();

  // Like button for main blog:
  const blogLikeButtons = document.querySelectorAll('.BlogReactionButton');
  blogLikeButtons.forEach(blogLikeButton => {
    blogLikeButton.addEventListener('click', BlogLikeClick);
  });
}

export function addNewComment(comment){
  if (comment.hasOwnProperty('parentComment')){
    blogComments.forEach((parentComm) => {
      if (parentComm.commentKey == comment.parentComment)
      {
        parentComm.replies.push(comment);
        LoadComments(blogComments);
        return;
      }
    });
  }
  else{
    blogComments = [comment].concat(blogComments);
    LoadComments(blogComments);
  }
}

export function removeCommentLocal(commentId) {
  const commentIndex = blogComments.findIndex(comment => comment.commentKey === commentId);
  if (commentIndex === -1) return;
  blogComments.splice(commentIndex, 1);
  LoadComments(blogComments);
}

function FillComment(comment, template) {
  var commentElement = template.content.querySelector('.comment').cloneNode(true);
  // Update the comment data here
  commentElement.querySelector('#commentText').textContent = FilterString(comment.text);
  commentElement.querySelector('#nameP').textContent = FilterString(comment.username);
  commentElement.querySelector('#dateDiv').textContent = timeDifference(new Date(comment.date)) + " ago";
  commentElement.querySelector('#likeCount').textContent = comment.likes;
  if (comment.IconUrl != null) {
    commentElement.querySelector('#UserImg').src = FilterString(comment.IconUrl);
  }
  return commentElement;
}

function FilterComments(comments){
  const num_best = 20;
  if (comments.length <= num_best*2){
    return comments;
  }
  const topComments = comments.slice(0, num_best);
  comments.splice(0, num_best);

  for (let i = comments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [comments[i], comments[j]] = [comments[j], comments[i]];
  }
  const randomComments = comments.slice(0, num_best);
  return [...topComments, ...randomComments];
}

export function LoadComments(comments){
  blogComments = comments;
  var commentSection = document.querySelector('#commentSection');
  var commentCounts = document.querySelector('#commentCounts');
  commentSection.innerHTML = "";
  commentCounts.textContent = comments.length + " comments";

  var template = document.querySelector('#commentTemplate');
  var curr_id = 0;
  comments.forEach((comment) => {
    var commentLay = FillComment(comment, template);
    
    if (comment.replies.length == 0){
      const footer = commentLay.querySelector('#expandFooter');
      footer.remove();
    }
    else{
      commentLay.querySelectorAll('#commentExpand')[1].textContent = "view Replies (" + comment.replies.length + ")"
    }
  
    commentLay.querySelectorAll('#expandContent').forEach((element) => {
      element.dataset.comm_id = curr_id;
    });

    if (GetUser() != null){
      if (comment.lastLiked != undefined && comment.lastLiked == GetUser().uid){
        commentLay.querySelector('.likeButton').classList.add("likedHeart");
      }
      if (comment.commentKey.split("_")[0] == GetUser().uid){
        const trashIcon = commentLay.querySelector('#trash');
        trashIcon.style.display = "block";
        trashIcon.addEventListener("click", async (event) => {
          if (await confirmCustomFunction('Are you sure you want to delete this comment?')) {
            const result = await deleteCommentFromPost(blogname, comment.commentKey);
            if (result == "ok"){
                showGreenMessage("Successfully removed comment!");
                removeCommentLocal(comment.commentKey);
            }
            else{
                showError(result);
            }
          }
        });
      }
    }
    const trashIcon = commentLay.querySelector('#trash');
    commentSection.appendChild(commentLay);
    curr_id += 1;
  })
  AddExpandClickEvents();
  AddLikeButtonClickEvents();
}


export function FilterString(input) {
  return input.replace(/[<>]/g, '');
}