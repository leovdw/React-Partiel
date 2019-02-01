import React from 'react';
import ReactDOM from 'react-dom';
import './views/style/index.css';
import List from './components/List';
import * as serviceWorker from './serviceWorker';
import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyB0Bf2jaYs0Kj-244UqSsrhe2ZIWpbwUmY",
    authDomain: "testproject-96ee4.firebaseapp.com",
    databaseURL: "https://testproject-96ee4.firebaseio.com",
    projectId: "testproject-96ee4",
    storageBucket: "testproject-96ee4.appspot.com",
    messagingSenderId: "954237118615"
};

firebase.initializeApp(firebaseConfig);

ReactDOM.render(<List />, document.getElementById('root'));

serviceWorker.unregister();


