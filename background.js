console.log("Ramya, you're starting here!");
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

var knownWordsRef = db.collection("known_words");
var unknownWordsRef = db.collection("unknown_words");


// knownWordsRef.doc("தண்டனை").set({
//     word: "தண்டனை",
//     meanings: ["penalty", "punishment, impunity"] });
// knownWordsRef.doc("அலை").set({
//     word: "அலை",
//     meanings: ["wave", "shake", "sea", "stray about", "wander"] });

// knownWordsRef.get().then((querySnapshot) => {
//     querySnapshot.forEach((doc) => {
//         // doc.data() is never undefined for query doc snapshots
//         console.log(doc.id, " => ", doc.data());
//     });
// });

// Inject the payload.js script into the current tab after the popout has loaded
window.addEventListener('load', function (evt) {
    chrome.tabs.executeScript(null, { file: "content_script.js" });
});

// Listen to messages from the content_script.js script
// On Click word is added to known list in DB
chrome.runtime.onMessage.addListener(function (message) {
	
    
    console.log('From background.js: ' + message);

    // TODO: Use lookup dictionary or API to get meaning
    // knownWordsRef.doc(message).set({
    // word: message,
    // meanings: ["test_meaning1", "test_meaning2"] });

});

