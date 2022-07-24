/* ***************  HOW TO USE TAMIL READER **************
 * HOW HIGHLIGHT COLORS WORK:
 * all UNKNOWN (new) words highlighted in BLUE
 * all KNOWN words not highlighted
 * all words SEEN before but not yet known highlighted in YELLOW
 * 
 * TO LOOKUP A WORD:
 * To see the meaning of a word, click on it. Meaning will be shown in a popup box.
 * You can click the same word for popup to disappear.
 * 
 * TO LEARN A WORD:
 * Once you've learned a word, you can mark it as KNOWN by
 * 1. Clicking word to show meaning
 * 2. Hitting '+' button in the lower right corner
 * 3. Close meaning box by clicking word again
 */
var uniqueId = 0; // variable for generating unique ID for popup div
var isShown = false; // var to keep track of whether popup is showing or not

const API_KEY=""; //GTranslate

async function translate(text) {
    let res = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
        { q: text, target: "en", source: "ta" }
        );
        let translation = res.data.data.translations[0].translatedText;
        return translation;
}

class Word {
    constructor (word, meaning){
        this.word = word;
        this.meaning = meaning;
    }
    toString() {
        return this.word + ' means ' + this.meaning;
    }
}

var wordConverter = {
    toFirestore: function(data) {
        return {
            word: data.word,
            meaning: data.meaning
            };
    },
    fromFirestore: function(snapshot, options){
        const data = snapshot.data(options);
        return new Word(data.word, data.meaning);
    }
}

function addFloatingButton(){
    var outerDiv = document.createElement("div");
    outerDiv.classList.add("fab-container");

    var innerDiv = document.createElement("div");
    innerDiv.classList.add("button", "iconbutton");

    innerDiv.innerHTML = '<i class="fa-solid fa-plus" id="addButton"></i>';

    outerDiv.appendChild(innerDiv);
    document.body.appendChild(outerDiv);
}

function addPopup(para){
    var popup = document.createElement("div");
    popup.title = "";
    popup.id = uniqueId++ + "popup";
    popup.classList.add("popuptext");

    para.classList.add("popup");
    para.appendChild(popup);
}

const firebaseConfig = {
    apiKey: "AIzaSyDeSlFnzC9u6gboHrpgvD2schGIg4TQKEg",
    authDomain: "tamil-reader.firebaseapp.com",
    projectId: "tamil-reader",
    storageBucket: "tamil-reader.appspot.com",
    messagingSenderId: "508821920207",
    appId: "1:508821920207:web:1f21f886c117edeca8daba",
    measurementId: "G-D9CNW7NNT4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();
var knownWordsRef = db.collection("known_words");
var unknownWordsRef = db.collection("unknown_words");


$(document).ready(function () {
    addFloatingButton();

    $("p").lettering('words');
    // $("a").lettering('words');
    // $("h1").lettering('words');
    // $("h3").lettering('words');

    var allWords = document.querySelectorAll("[class^=word]")
    for (word of allWords) {
        addPopup(word);
        isWordUnknown(word);
    }

    // SHOW MEANING
    $(".popup").click(function (e) {

        var $this = $(this)
        var word = this.innerText;

        var punctuationless = word.replace(/[.,\/#!\?\"$%\^&\*;:{}=\-_`~()]/g, "");
        var finalWord = punctuationless.replace(/\s{2,}/g, " ");

        let res = finalWord.split("\n");

        var currentDialog = document.getElementById($this[0].lastElementChild.id);

        if (res.length == 1) {
            if (isShown) {
                currentDialog.classList.remove("show");
                this.classList.remove("link");
                isShown = false;
            } else {
                knownWordsRef.doc(res[0])
                .withConverter(wordConverter)
                .get().then((doc) => {
                    if (doc.exists) {
                        var word = doc.data();

                        console.log("Meaning of " + res[0] + " from known DB: ", word.toString());
                        currentDialog.innerText = word.meaning;
                        currentDialog.classList.add("show");
                        this.classList.add("link");
                        isShown = true;
                    }
                    else {
                        unknownWordsRef.doc(res[0])
                            .withConverter(wordConverter)
                            .get().then((doc) => {
                                if (doc.exists) {
                                    var word = doc.data();
        
                                    // word has valid meaning
                                    if(word.meaning !== "empty_meaning") {
                                        console.log("Meaning of " + res[0] + " from unknown DB: ", word.toString());
                                        currentDialog.innerText = word.meaning;
                                        currentDialog.classList.add("show");
                                        this.classList.add("link");
                                        isShown = true;

                                        this.classList.remove("unknown");
                                        this.classList.add("seen");
                                    } 
                                    else { // word does not have valid meaning yet, so we need to look it up
                                        console.log("GTranslate API called to translate: ", finalWord);
                                        translate(finalWord).then(
                                            (data) => {
                                                currentDialog.innerText = data;
                                                var translation = new Word(finalWord, currentDialog.innerText);
                                                // Adding to unknown DB, resetting the meaning to be valid
                                                unknownWordsRef.doc(finalWord)
                                                    .withConverter(wordConverter)
                                                    .set(translation);

                                                this.classList.remove("unknown");
                                                this.classList.add("seen");
                                            }
                                        );
                                        currentDialog.classList.add("show");
                                        this.classList.add("link");
                                        isShown = true;
                                    }

                                    // scan doc for all unknown occurences of this word and add 'SEEN' highlight
                                    for (elt of document.getElementsByClassName('unknown')) {
                                        if (elt.innerText === word) {
                                            elt.classList.remove("unknown");
                                            elt.classList.add("seen");
                                        }
                                    }
                                }
                            }).catch((error) => {
                                console.log("Error getting document:", error);
                            });
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });   
            }
        } else {
            currentDialog.classList.remove("show");
            this.classList.remove("link");
            isShown = false;
        }

    });

    // adding word to KNOWN from UNKOWN
    $("#addButton").click(function (e) {
    
        let shownElement = document.querySelectorAll(".show");
        let meaning = shownElement[0].innerText

        let parentHTML =  shownElement[0].parentNode.innerHTML;
        let word = parentHTML.split("<div")[0];
        var punctuationless = word.replace(/[.,\/#!\?\"$%\^&\*;:{}=\-_`~()]/g,"");
        var finalWord = punctuationless.replace(/\s{2,}/g," ");

        let translation = new Word(finalWord, meaning);

        // removing word from UNKNOWN db
        unknownWordsRef.doc(finalWord)
        .withConverter(wordConverter)
        .delete().then((doc) => {
            console.log("Removed " + finalWord + " from UNKNOWN db");
        }).catch((error) => {
            console.log("Error deleting document:", error);
        });

        // moving from UNKNOWN db to KNOWN db
        console.log("adding to KNOWN DB: ", translation);
        knownWordsRef.doc(finalWord)
            .withConverter(wordConverter)
            .set(translation);

        shownElement[0].parentNode.classList.remove("unknown");
        shownElement[0].parentNode.classList.remove("seen");
        shownElement[0].parentNode.classList.add("known");

        // scan doc for all occurences of this word and remove highlight
        for (elt of document.getElementsByClassName('seen')) {
            if (elt.innerText === finalWord){ 
                elt.classList.remove("unknown");
                elt.classList.remove("seen");
                elt.classList.add("known");
            }
        }

        for (elt of document.getElementsByClassName('unknown')) {
            if (elt.innerText === finalWord){ 
                elt.classList.remove("unknown");
                elt.classList.remove("seen");
                elt.classList.add("known");
            }
        }

    });
});

// all UNKNOWN (new) words highlighted in BLUE
function isWordUnknown(wordElement) {

    var cleanedWord = wordElement.innerText;
    var punctuationless = cleanedWord.replace(/[.,\/#!\?\"$%\^&\*;:{}=\-_`~()]/g,"");
    var finalWord = punctuationless.replace(/\s{2,}/g," ");

    if(finalWord === ""){
        // Adding this bc it breaks without lol
        return 0;
    }

    var englishRegExp = /[a-zA-Z]/g;             
    if(englishRegExp.test(finalWord)){
        // this is an english word. we want to ignore this.
        return 0;
    }

    knownWordsRef.doc(finalWord)
        .withConverter(wordConverter)
        .get().then((doc) => {
            if (doc.exists) {
                // we know the word
                // no need to highlight
                if (wordElement.classList.item(0).startsWith('word')) {
                    wordElement.classList.remove(wordElement.classList.item(0));
                    wordElement.classList.add("known");
                } 
            } else {
                // we don't know the word yet
                unknownWordsRef.doc(finalWord)
                .withConverter(wordConverter)
                .get().then((doc) => {
                    if (doc.exists) {
                        // mark as yellow because we have seen this before
                        if (wordElement.classList.item(0).startsWith('word')) {
                            wordElement.classList.remove(wordElement.classList.item(0));
                            wordElement.classList.remove("unknown");
                            wordElement.classList.add("seen");
                        }
                    } else {
                        // change highlight of unknown word
                        if (wordElement.classList.item(0).startsWith('word')) {        
                            wordElement.classList.remove(wordElement.classList.item(0));
                            wordElement.classList.add("unknown");
                        } 
        
                        // adding to unknown db
                        var translation = new Word(finalWord, "empty_meaning");
                        unknownWordsRef.doc(finalWord)
                        .withConverter(wordConverter)
                        .set(translation);
        
                    } 
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
}