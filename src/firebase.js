import firebase from 'firebase'

// Initialize Firebase
var config = {
apiKey: "AIzaSyBSUocLgE0y2ulLud8U2njDN6zH6yDESx8",
	authDomain: "vimgolf-86fa8.firebaseapp.com",
	databaseURL: "https://vimgolf-86fa8.firebaseio.com",
	projectId: "vimgolf-86fa8",
	storageBucket: "vimgolf-86fa8.appspot.com",
	messagingSenderId: "323130708224"
};
firebase.initializeApp(config);
export const db = firebase.database()
export const auth = firebase.auth
export const provider = new firebase.auth.FacebookAuthProvider();
