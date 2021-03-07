import * as firebase from 'firebase';
require('@firebase/firestore');



var firebaseConfig = {
    apiKey: "AIzaSyDCyGscIXeAg2EDovCUroM6P49jdeAqlW0",
    authDomain: "wily-cd0f1.firebaseapp.com",
    projectId: "wily-cd0f1",
    storageBucket: "wily-cd0f1.appspot.com",
    messagingSenderId: "145448891810",
    appId: "1:145448891810:web:a7d17939b0c51151b0eefb"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


export default firebase.firestore();