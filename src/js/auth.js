
import '../styles/style.css';

import { 
  hideLoginError, 
  showLoginState, 
  showLoginForm, 
  showApp, 
  showLoginError, 
  btnLogin,
  btnSignup,
  btnLogout,
  showLoginScreen,
  hideUserIcon,
  btnChangeProfilePic,
  btnActivateLogin
} from './loginui'

import { 
    getAuth,
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';

import {FilterString, LoadBlog} from './blog';

import {firebaseApp} from './firebaseInit';

export const ADMIN = "fduu7Wj57Nh72Bzn6Me8lXp1qU93";

// main user object:
var mainuser = null;

export function GetUser(){
  return mainuser;
}

// Login using email/password
const loginEmailPassword = async () => {
  const loginEmail = txtEmail.value
  const loginPassword = txtPassword.value

  // step 2: add error handling
  try {
    await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
  }
  catch(error) {
    console.log(`There was an error: ${error}`)
    ShowError(error);
  }
}

// Create new account using email/password
const createAccount = async () => {
  const email = txtEmail.value;
  const password = txtPassword.value;
  const username = FilterString(txtUsername.value);
  const imgURL = txtImage.value;

  if (username == null || username.length <= 5){
    showLoginError("Enter a username with at least 5 letters!", null);
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
        // Signed in 
        mainuser = userCredential.user;
        await updateProfile(mainuser, {
          displayName: username,
          photoURL: imgURL
        }).then(function() {
          showLoginState(mainuser);
        }, function(error) {
          console.log("Error:" + error);
        });
      })
  }
  catch(error) {
    ShowError(error);
  } 
}

// Monitor auth state
const monitorAuthState = async () => {
  onAuthStateChanged(auth, user => {
    if (user) {
      mainuser = user;
      if (mainuser.uid == ADMIN){
        document.querySelector("#btnAddNewBlog").style.display = "block";
      }
      showApp();
      showLoginState(mainuser);
      hideLoginError();
      LoadBlog();
    }
    else {
      mainuser = null;
      showLoginForm();
      hideUserIcon();
      LoadBlog();
    }
  })
}

var logged_out = false;
// Log out
const logout = async () => {
  logged_out = true;
  await signOut(auth);
}

async function changeUserIcon(){
    const imgURL = profileUrlChange.value;
    console.log(imgURL);
    await updateProfile(mainuser, {
      photoURL: imgURL
    }).then(function() {
      showLoginState(mainuser);
    }, function(error) {
      console.log("Error:" + error);
    });
}

btnLogin.addEventListener("click", loginEmailPassword) 
btnSignup.addEventListener("click", createAccount)
btnLogout.addEventListener("click", logout)
btnActivateLogin.addEventListener("click", showLoginScreen);
btnChangeProfilePic.addEventListener("click", changeUserIcon);
console.log("loaded auth.js");
const auth = getAuth(firebaseApp);
monitorAuthState();

function ShowError(error){
    switch (error.code) {
        case 'auth/email-already-in-use':
            showLoginError("Email address already in use!", error.code);
            break;
        case 'auth/invalid-email':
            showLoginError("Email address not valid!", error.code);
            break;
        case 'auth/missing-email':
            showLoginError("Enter an email adress!", error.code);
            break;
        case 'auth/operation-not-allowed':
            showLoginError("operation not allowed!", error.code);
            break;
        case 'auth/weak-password':
            showLoginError("password to weak!", error.code);
            break;
        default:
            showLoginError(error.code, error.code);
            break;
    }
}