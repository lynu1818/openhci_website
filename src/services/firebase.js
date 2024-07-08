import { database, storage } from "./firebaseConfig";

import {
	ref,
	set,
	remove,
	get,
	update,
	push,
	serverTimestamp,
} from "firebase/database";
import {
	ref as sRef,
	uploadBytesResumable,
	getDownloadURL,
} from "firebase/storage";

const metadata = {
	contentType: "image/jpeg",
};

export const fetchTextMessage = async () => {
	console.log(`Fetching messages from chat service for chatId: ${chatId}`);
};
