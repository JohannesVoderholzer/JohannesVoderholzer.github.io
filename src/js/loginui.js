
import { AuthErrorCodes } from 'firebase/auth';
console.log("loaded loginui.js");

export const txtEmail = document.querySelector('#txtEmail')
export const txtPassword = document.querySelector('#txtPassword')
export const txtUsername = document.querySelector('#txtUsername')
export const txtImage = document.querySelector('#txtImage')

export const btnActivateLogin = document.querySelector('#btnActivateLogin');
export const btnActivateLoginLi = document.querySelector('#btnActivateLoginLi');

export const btnLogin = document.querySelector('#btnLogin');
export const btnSignup = document.querySelector('#btnSignup');
export const lblBlogname = document.querySelector('#lblBlogname');
export const lblBlogtext = document.querySelector('#lblBlogtext');
export const lblBlogtextSummary = document.querySelector('#lblBlogtextSummary');
export const lblBlogUrltxt = document.querySelector('#lblBlogUrltxt');

export const btnLogout = document.querySelector('#btnLogout')
export const btnLogoutLi = document.querySelector('#btnLogoutLi')
// export const divAuthState = document.querySelector('#divAuthState')
export const lblAuthState = document.querySelector('#lblAuthState')
export const UserImg = document.querySelector('#UserImg')
export const ProfileContainer = document.querySelector('#profile-container');
export const profileUrlChange = document.querySelector('#profileUrlChange');
export const btnChangeProfilePic = document.querySelector('#btnChangeProfilePic');

export const addCommentbtn = document.querySelector("#addCommentBtn");
export const writeCommentText = document.querySelector("#writeCommentText");
const addCommentDiv = addCommentbtn.parentNode;
const addCommentPlaceholder = document.querySelector('#addCommentPlaceholder');

var currentScreen = app;

function GetDivLoginError(){
  return currentScreen.querySelector('.divLoginError');
}

function GetLabelLoginError(){
  return currentScreen.querySelector('#lblLoginErrorMessage');
}

export const showLoginForm = () => {
  login.style.display = 'none';
  app.style.display = 'block';
  btnActivateLoginLi.style.display = 'block';
  btnLogoutLi.style.display = 'none';
  ProfileContainer.style.display = 'none';
  addCommentDiv.style.display = 'none';
  addCommentPlaceholder.style.display = 'block';
  currentScreen = login;
}

export const showApp = () => {
  login.style.display = 'none'
  app.style.display = 'block'
  btnActivateLoginLi.style.display = 'none';
  addCommentPlaceholder.style.display = 'none';
  btnLogoutLi.style.display = 'block';
  addCommentDiv.style.display = 'block';
  ProfileContainer.style.display = 'block';
  currentScreen = app;
}

export const hideLoginError = () => {
  const divLoginError = login.querySelector('.divLoginError');
  divLoginError.style.display = 'none';
}

export const hideBlogError = () => {
  const divBlogError = addBlog.querySelector('.divLoginError');
  divBlogError.style.display = 'none';
}

export const showLoginError = (errormessage, errorcode) => {
  const divLoginError = GetDivLoginError();
  const labLoginError = GetLabelLoginError();
  divLoginError.style.display = 'block'; 
  if (errorcode == AuthErrorCodes.INVALID_PASSWORD) {
    labLoginError.innerHTML = `Wrong password. Try again.`
  }
  else {
    labLoginError.innerHTML = `Error: ${errormessage}`      
  }
}

export const showLoginState = (user) => {
  lblAuthState.innerHTML = `${user.displayName}`;
  if (user.photoURL != null){
    UserImg.src = user.photoURL;
  }
  else{
    UserImg.src = "images/userIcon.png";
  }
  profileUrlChange.value = user.photoURL;
}

export const showLoginScreen = (user) => {
  login.style.display = 'block';
  app.style.display = 'none';
  currentScreen = login;
}

export const hideUserIcon = () => {
}

hideLoginError();
hideBlogError();
