import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'


const firebaseConfig = {
  apiKey: "AIzaSyDLrknQmCRvqaaVg2MU4hNmeSm7uIDtd24",
  authDomain: "ecorecettes.firebaseapp.com",
  projectId: "ecorecettes",
  storageBucket: "ecorecettes.firebasestorage.app",
  messagingSenderId: "28185476548",
  appId: "1:28185476548:web:ac8f1e816d8f35d978b891",
  measurementId: "G-SQT1LZECYR"
};

export const firebaseApp = initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)