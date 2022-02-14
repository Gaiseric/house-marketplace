import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import googleIcon from "../assets/svg/googleIcon.svg";

function OAuth() {
    const location = useLocation();

    const navigate = useNavigate();

    const onGoogleClick = async () => {
        try {
            const auth = getAuth();
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                await setDoc(docRef, {
                    name: user.displayName,
                    email: user.email,
                    timestamp: serverTimestamp(),
                });
            } else {
                const userData = docSnap.data();
                if (userData.name !== user.displayName) {
                    await updateDoc(docRef, { name: user.displayName });
                }
            }
            navigate("/");
        } catch {
            toast.error("Couldn't authorize with Google");
        }
    };

    return (
        <div className="socialLogin">
            <p className="socialText">
                Sign {location.pathname === "/sign-up" ? "up" : "in"} with{" "}
            </p>
            <button className="socialIconDiv" onClick={onGoogleClick}>
                <img className="socialIconImg" src={googleIcon} alt="google" />
            </button>
        </div>
    );
}

export default OAuth;
