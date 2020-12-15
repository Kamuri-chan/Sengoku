const key =  "AIzaSyApP7-NbSAlXMvTEiVnKmcMbkIB3yXmmCw";
const _cx = "25e272f0370315288"



const {google} = require('googleapis');
const customsearch = google.customsearch('v1');

// let search = customsearch('integral gaussiana');

customsearch.cse.list( {q: "integral gaussiana", auth: key, cx: _cx }).then((result) => {
    console.log(result.data.items);
});