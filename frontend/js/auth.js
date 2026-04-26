import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const authScreen = document.getElementById('auth-screen');
const mainContent = document.getElementById('main-content');
const mainNav = document.getElementById('main-nav');
const userEmailSpan = document.getElementById('user-email');

export function initAuth() {
    const auth = window.firebaseAuth;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            authScreen.style.display = 'none';
            mainContent.style.display = 'block';
            mainNav.style.display = 'flex';
            userEmailSpan.textContent = user.email;
            window.dispatchEvent(new CustomEvent('auth-success'));
        } else {
            // User is signed out
            authScreen.style.display = 'block';
            mainContent.style.display = 'none';
            mainNav.style.display = 'none';
        }
    });

    let isLoginMode = true;
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const authToggleLink = document.getElementById('auth-toggle-link');

    authToggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Sign in to continue to Stellar Tasks.';
            authSubmitBtn.textContent = 'Sign In';
            authToggleLink.textContent = "Don't have an account? Sign up";
        } else {
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Join Stellar Tasks today.';
            authSubmitBtn.textContent = 'Sign Up';
            authToggleLink.textContent = "Already have an account? Sign in";
        }
    });

    authSubmitBtn.addEventListener('click', async () => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            let msg = isLoginMode ? "Login Failed: " : "Sign Up Failed: ";
            if (error.code === 'auth/invalid-credential') {
                msg += "Incorrect email or password. If you don't have an account, please Sign Up first.";
            } else if (error.code === 'auth/weak-password') {
                msg += "Password should be at least 6 characters.";
            } else if (error.code === 'auth/email-already-in-use') {
                msg += "This email is already registered. Please Sign In.";
            } else {
                msg += error.message;
            }
            alert(msg);
        }
    });

    // Login with Google
    document.getElementById('google-login-btn').addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            alert(error.message);
        }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        signOut(auth);
    });
}

initAuth();
