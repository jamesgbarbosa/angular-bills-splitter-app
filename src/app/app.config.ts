import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { expenseReducer } from './store/expense/expense.reducer';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
// import { environment } from '../environments/environment';

const firebaseConfig = {
  apiKey: "AIzaSyDtzDGTgBgvdbj2IZPjjlTHlw--ihn4E4I",
  authDomain: "splitbillapp-c8f1f.firebaseapp.com",
  projectId: "splitbillapp-c8f1f",
  storageBucket: "splitbillapp-c8f1f.appspot.com",
  messagingSenderId: "842401796749",
  appId: "1:842401796749:web:f8522a221179940bc708c4",
  measurementId: "G-FWZW3K5H3C"
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideStore({ expense: expenseReducer }),
    importProvidersFrom([
      provideFirestore(() => getFirestore()),
      provideFirebaseApp(() => initializeApp(firebaseConfig))
    ])
  ]
};
