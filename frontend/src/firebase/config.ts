import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Configuração fictícia de desenvolvimento local (usará emuladores)
const firebaseConfig = {
  apiKey: "mock-api-key-flav-atleta360",
  authDomain: "flav-atleta360-dev.firebaseapp.com",
  projectId: "flav-atleta360-dev",
  storageBucket: "flav-atleta360-dev.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:1234567890"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Conecta aos emuladores caso esteja rodando localmente
if (
  typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  console.log('--- Firebase Emulators Connected ---');
}

export { app, auth, db, storage };
