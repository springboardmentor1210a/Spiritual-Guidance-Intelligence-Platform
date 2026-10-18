import { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { ROLES } from "../config/roles";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({ ...firebaseUser, ...userData });
          } else {
            // Fallback for new Google users before their role is set
            setUser({ ...firebaseUser, role: ROLES.USER });
          }
        } catch (err) {
          console.error("Failed to load user data from Firestore:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      let role = ROLES.USER;
      if (userDocSnap.exists()) {
        role = userDocSnap.data().role || ROLES.USER;
      }
      return role;
    } catch (err) {
      throw new Error(err.message || "Login failed");
    }
  };

  const loginWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      let role = ROLES.USER;
      if (userDocSnap.exists()) {
        role = userDocSnap.data().role || ROLES.USER;
      } else {
        // First time Google login, create user doc
        await setDoc(userDocRef, {
          email: userCredential.user.email,
          name: userCredential.user.displayName,
          role: ROLES.USER,
          createdAt: new Date().toISOString()
        });
      }
      return role;
    } catch (err) {
      throw new Error(err.message || "Google Login failed");
    }
  };

  const register = async (name, email, password, role) => {
    try {
      if (role === ROLES.ADMIN) {
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        const q = query(collection(db, "users"), where("role", "==", ROLES.ADMIN));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          throw new Error("An admin account already exists. Only one admin is allowed.");
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      
      await setDoc(userDocRef, {
        email,
        name,
        role: role || ROLES.USER,
        createdAt: new Date().toISOString()
      });
      
      return role || ROLES.USER;
    } catch (err) {
      throw new Error(err.message || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const value = {
    user,
    token: user?.accessToken || null,
    role: user?.role || null,
    login,
    loginWithGoogle,
    register,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}