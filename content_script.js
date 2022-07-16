console.log('Content script is a go')

let popup = document.createElement("div");
popup.id = "popup";
popup.title = "";
popup.hidden="hidden";

const firebaseConfig = {

};

var meaning_map = {
    "அரசர்" : "king",
    "ஏன்" : "why",
    "அந்த" : "that",
    "தெனாலிராமன்" : "Tenali Raman"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();
var knownWordsRef = db.collection("known_words");
var unknownWordsRef = db.collection("unknown_words");


$(document).ready(function() {
    console.log('trying to letter');
    $("p").lettering('words');
    // $("a").lettering('words');
    // $("h1").lettering('words');
    // $("h3").lettering('words');

    //scanUnknownWords();

    //alert('going to popup after');

    // var someP = document.getElementsByTagName('p')[0];
    // someP.appendChild(popup);

    // $( "#popup" ).dialog({
    //     autoOpen: false
    //   });

    // TODO: Hover to show meaning?
    $("[class^=word]").hover(function () {

       for (elt of document.getElementsByClassName(this.className)) {
           if (elt.innerText === this.innerText){ 
               console.log('Meaning of ' + this.innerText);
           }
       }
    });

    // TODO: Click to add the word from unknown to known?
    $("[class^=word]").click(function(e){

        var $this = $( this ),
        _parent = $this.parent("p");
        _parent.addClass("parent");
        for (elt of document.getElementsByClassName(this.className)) {
            if (elt.innerText === this.innerText){ 

               
                var spanTag = document.querySelector(this.className);
                var pTag = document.querySelector(".parent");
                console.log('need to insert popup first');
                console.log('popup', popup);
                console.log('pTag', pTag);
                console.log('spanTag', spanTag);

                pTag.insertBefore(popup, spanTag);
                console.log('added popup to DOM');

                var word = this.innerText;

                var punctuationless = word.replace(/[.,\/#!\?\"$%\^&\*;:{}=\-_`~()]/g,"");
                var finalWord = punctuationless.replace(/\s{2,}/g," ");

                console.log('Adding to known:  ', finalWord);

                e.stopPropagation();

                console.log('Trying to open dialog');
                var dialogContent = meaning_map[finalWord.toLowerCase()];
                if(dialogContent && dialogContent.length > 0) {
                    $( "#popup" ).dialog({
                        "autoOpen": false,
                        "modal": true,
                        "title": finalWord
                    }).html(dialogContent);

                    $( "#popup" ).dialog('open');
                    console.log('after');
                }

                
                chrome.runtime.sendMessage(finalWord);
            }
        }
        
         });
         
});

function scanUnknownWords() {
    // unknownWordsRef.doc(finalWord).set({
    //     word: finalWord,
    //     meanings: ["test_meaning1", "test_meaning2"] });
    // console.log('from content_Script.js: ')
    // knownWordsRef.get().then((querySnapshot) => {
    //     querySnapshot.forEach((doc) => {
    //         // doc.data() is never undefined for query doc snapshots
    //         console.log(doc.id, " => ", doc.data());
    //     });
    // });
}