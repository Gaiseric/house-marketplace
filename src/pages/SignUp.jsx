import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";
import OAuth from "../components/OAuth";

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const { name, email, password } = formData;

    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;
            updateProfile(auth.currentUser, {
                displayName: name,
            });
            const formDataCopy = { ...formData };
            delete formDataCopy.password;
            formDataCopy.timestamp = serverTimestamp();
            await setDoc(doc(db, "users", user.uid), formDataCopy);
            navigate("/");
        } catch {
            toast.error("Something went wrong with registration");
        }
    };

    return (
        <div className="pageContainer">
            <header>
                <p className="pageHeader">Create Account</p>
            </header>
            <form onSubmit={onSubmit}>
                <input
                    type="text"
                    className="nameInput"
                    placeholder="Name"
                    id="name"
                    value={name}
                    onChange={onChange}
                />
                <input
                    type="email"
                    autoComplete="email"
                    className="emailInput"
                    placeholder="Email"
                    id="email"
                    value={email}
                    onChange={onChange}
                />
                <div className="passwordInputDiv">
                    <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className="passwordInput"
                        placeholder="Password"
                        id="password"
                        value={password}
                        onChange={onChange}
                    />
                    {formData.password && (
                        <img
                            src={visibilityIcon}
                            alt="show pass"
                            className="showPassword"
                            onClick={() =>
                                setShowPassword((prevState) => !prevState)
                            }
                        />
                    )}
                </div>
                <Link to="/sign-in" className="registerLink">
                    Sign In Instead
                </Link>
                <div className="signUpBar">
                    <p className="signUpText">Sign Up</p>
                    <button className="signUpButton">
                        <ArrowRightIcon
                            fill="#ffffff"
                            width="34px"
                            height="34px"
                        />
                    </button>
                </div>
            </form>
            <OAuth />
        </div>
    );
}

export default SignUp;
