import {db} from './firebaseInit';
// TODO: ADD REMOVE COMMENT, transactions needed where?
console.log("loaded database.js");
// Import the functions you need from the SDKs you need
import { increment , deleteDoc, deleteField, getDoc, setDoc, doc, updateDoc, runTransaction} from "firebase/firestore";
import {
  ReturnAddBlog,
  showLoginError,
  writeCommentText,
  addCommentbtn,
} from './loginui';

import { GetUser } from './auth';
import { blogname, addNewComment, FilterString } from './blog';
import { showError, showGreenMessage } from './showErrors';


addCommentbtn.addEventListener("click", addComment);

export async function AddReactionToBlogpost(blogpostId, user, reaction, blogpostData) {
  if (user == null){
    return "You have to login to react to a blogpost!";
  }
  const blogpostRef = doc(db, "blogpostsreactions", blogpostId);
  
  if (blogpostData != null) {
    try {
      await updateDoc(blogpostRef, {
        [user.uid]: reaction,
      });
      const original_reaction = blogpostData[user.uid];
      blogpostData[user.uid] = reaction;
      if (reaction == 1 || original_reaction == 1) {
        try{
          var numLikes = 0;
          for (const [userId, reaction] of Object.entries(blogpostData)) {
            if (reaction == 1) {numLikes += 1;}
          }
          const allPostsRef = doc(db, "blogpostsAll", "allPosts");
          await updateDoc(allPostsRef, {
            "changedBlogId": blogpostId,
            [`${blogpostId}.blogLikes`]: numLikes
          });
        } catch(error){
          console.log("error while liking blogpost: " + error.toString());
        }
      }
      return "ok";
    } catch (error) {
      console.log("error while liking blogpost: " + error.toString());
      return error.toString();
    }
  }
}

async function addComment(){
  const mainUser = GetUser();
  const comment_text = FilterString(writeCommentText.value);
  if (comment_text.length == 0){
    showError("You can't submit an empty comment!");
    return;
  }
  const result = await addCommentToBlogPost(blogname, comment_text, new Date(), mainUser);
  if (result == "ok"){
    writeCommentText.value = "";
  }
  else{
    showError(result);
  }
}

var isAdding = false;

export async function addCommentToBlogPost(blogpostId, Ctext, Cdate, CUser, parentCommentID) {
  if (isAdding){return "Already adding comment!";}
  isAdding = true;
  const new_comment = {
    text: Ctext,
    likes: 0,
    username: CUser.displayName,
    userID: CUser.uid,
    IconUrl: CUser.photoURL,
    lastLiked: "",
    date: Cdate.toString()
  };
  if (parentCommentID != null){
    new_comment.parentComment = parentCommentID;
  }
  try {
    const blogpostRef = doc(db, "blogposts", blogpostId);
    const commentId = `${CUser.uid}_${Cdate.getTime()}`;
    await runTransaction(db, async (transaction) => {
      transaction.update(blogpostRef, { 
        [`comments.${commentId}`]: new_comment,
        changedCommentId: commentId
      });
      new_comment.replies = [];
    });
    new_comment.commentKey = commentId;
    addNewComment(new_comment);
  } catch (error) {
    console.log("Error while adding comment: " + error);
    isAdding = false;
    return error.toString();
  }
  isAdding = false;
  showGreenMessage("Successfully added comment!");
  return "ok";
}

export async function deleteCommentFromPost(blogpostId, commentId) {
  if (isAdding){return "Already adding comment!";}
  isAdding = true;
  try {
    const blogpostRef = doc(db, "blogposts", blogpostId);
    await runTransaction(db, async (transaction) => {
      transaction.update(blogpostRef, { 
        [`comments.${commentId}`]: deleteField(),
        changedCommentId: commentId
      });
    });
  } catch (error) {
    isAdding = false;
    console.log("Error while deleting comment: " + error);
    return error.toString();
  }
  isAdding = false;
  return "ok";
}

export async function LikeComment(blogpostId, commentId, user) {
  if (user == null){
    return "You have to login to like comments!";
  }
  try {
    if (commentId == undefined){
      throw "comment not defined!";
    }
    const blogpostRef = doc(db, "blogposts", blogpostId);
    await runTransaction(db, async (transaction) => {
      transaction.update(blogpostRef, { 
        [`comments.${commentId}.likes`]: increment(1),
        [`comments.${commentId}.lastLiked`]: user.uid,
        changedCommentId: commentId
      });
    });
  } catch (error) {
    console.log("Error while liking comment: " + error);
    return error.toString();
  }
  return "ok";
}

export async function getBlogWithComments(blogname){
  try {
    const docRef = doc(db, "blogposts", blogname);
    const docSnap = await getDoc(docRef);
    const docRefReactions = doc(db, "blogpostsreactions", blogname);
    const docSnapReactions = await getDoc(docRefReactions);
    if (docSnap.exists() && docSnapReactions.exists()) {
      const docData = docSnap.data();
      
      // construct real commentsArray:
      for (let commentKey in docData.comments) {
        let commentValue = docData.comments[commentKey];
        commentValue.commentKey = commentKey;
        if (commentValue.parentComment != undefined){
          let parent_comment = docData.comments[commentValue.parentComment];
          if (parent_comment != null){
            if (!parent_comment.hasOwnProperty('replies')){
              parent_comment.replies = [];
            }
            parent_comment.replies.push(commentValue);
          }
        }
      }
      let commentsArray = []
      for (let commentKey in docData.comments) {
        let commentValue = docData.comments[commentKey];
        if (!commentValue.hasOwnProperty('parentComment')){
          if (!commentValue.hasOwnProperty('replies')){
            commentValue.replies = [];
          }
          commentsArray.push(commentValue);
        }
      }
      const commentIdsArray = Object.keys(docData.comments || {});
      return [docData, commentsArray, docSnapReactions.data()];
    } else {
        return null;
    }
  } catch (e) {
    console.error("Error getting document: ", e);
    return null;
  }
}