// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyDX02z0txD8x1hsW2A-MC7KSh9aMY_gHtE",
	authDomain: "openhci-880b9.firebaseapp.com",
	projectId: "openhci-880b9",
	storageBucket: "openhci-880b9.appspot.com",
	messagingSenderId: "149604924509",
	appId: "1:149604924509:web:9bf171319ae99081b1a1b4",
	measurementId: "G-MNX51NYJJP",
	databaseURL: "https://openhci-880b9-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

export default app;
export { analytics, auth, database, storage, provider };
