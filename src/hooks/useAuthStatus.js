import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function useAuthStatus() {
    const [checkingStatus, setCheckingStatus] = useState(true);

    const [loggedUser, setLoggedUser] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setLoggedUser(user);
            }
            setCheckingStatus(false);
        });
        return () => {
            unsubscribe();
        };
    }, []);

    return { loggedUser, checkingStatus };
}
