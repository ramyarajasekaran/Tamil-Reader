console.log("This is from background.js");
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

var knownWordsRef = db.collection("known_words");
var unknownWordsRef = db.collection("unknown_words");

// Inject the payload.js script into the current tab after the popout has loaded
window.addEventListener('load', function (evt) {
    chrome.tabs.executeScript(null, { file: "content_script.js" });
});

// Listen to messages from the content_script.js script
// On Click word is added to known list in DB
chrome.runtime.onMessage.addListener(function (message) {
    
    console.log('Word: ' + message.word);
    console.log('Meaning: ' + message.meaning);

    console.log("added to DB");
});

