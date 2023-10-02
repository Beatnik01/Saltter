import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBj0wCmL6Es9zUusROqMkcDzKELYDN5p7k",
  authDomain: "saltter-b693f.firebaseapp.com",
  projectId: "saltter-b693f",
  storageBucket: "saltter-b693f.appspot.com",
  messagingSenderId: "250791356185",
  appId: "1:250791356185:web:625a806a53196102c78788",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
