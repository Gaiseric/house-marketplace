import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
import { toast } from "react-toastify";
import visibilityIcon from "../assets/svg/visibilityIcon.svg";
import OAuth from "../components/OAuth";

function SignIn() {
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const { email, password } = formData;

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
            const userCredentials = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            if (userCredentials.user) {
                navigate("/");
            }
        } catch {
            toast.error("Bad user Credentials");
        }
    };

    return (
        <>
            <div className="pageContainer">
                <header>
                    <p className="pageHeader">Welcome Back!</p>
                </header>
                <form onSubmit={onSubmit}>
                    <input
                        type="email"
                        className="emailInput"
                        placeholder="Email"
                        id="email"
                        value={email}
                        onChange={onChange}
                        autoComplete="email"
                    />
                    <div className="passwordInputDiv">
                        <input
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
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
                    <Link to="/sign-up" className="registerLink">
                        Sign Up Instead
                    </Link>
                    <Link to="/forgot-password" className="forgotPasswordLink">
                        Forgot Password
                    </Link>
                    <div className="signInBar">
                        <p className="signInText">Sign In</p>
                        <button className="signInButton">
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
        </>
    );
}

export default SignIn;
