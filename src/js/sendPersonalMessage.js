import {db} from './firebaseInit';
import { updateDoc, doc, arrayUnion, getDoc } from "firebase/firestore";
import { showError, showGreenMessage } from './showErrors';
console.log("loaded personalMessages.js");

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export async function SendPersonalMessage(type) {
  const name = document.getElementById("personalName").value;
  const message = document.getElementById("personalmessage").value;
  const email = document.getElementById("personalemail").value;

  if (name == null || name == ""){
      showError("Please enter a name!");
      return;
  }
  else if (message == null || message == ""){
      showError("Please enter a message!");
      return;
  }
  else if (email == null || email == ""){
      showError("Please enter an e-mail!");
      return;
  }
  const IsValidEmail = validateEmail(email);

  if (!IsValidEmail){
      showError("Email is not valid!");
      return;
  }

  try {
      const docRef = doc(db, "personalMessages", "messages");
      updateDoc(docRef, {
          messages: arrayUnion({ name: name, email: email, message: message, message_type: type })
      }).then((result) => {
          showGreenMessage("Message has been successfully sent!");
          document.getElementById("personalName").value = "";
          document.getElementById("personalmessage").value = "";
          document.getElementById("personalemail").value = "";
      });
  } catch (e) {
      showError(e);
  }
}

export async function getAllBlogs() {
  const docRef = doc(db, "blogpostsAll", "allPosts");
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const blogs = docSnap.data();
      delete blogs["changedBlogId"];
      return Object.values(blogs);
    } else {
      return [];
    }
  }
  catch(ex){
    return ex;
  }
}
