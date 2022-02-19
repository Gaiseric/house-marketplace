import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

function Contact() {
    const [message, setMessage] = useState("");
    const [landlord, setLandLord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const getLandLord = async () => {
            const docRef = doc(db, "users", params.landlordId);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setLandLord(docSnap.data());
                    setLoading(false);
                }
            } catch {
                toast.error("Couldn't get landlord data");
                navigate(-1);
            }
        };

        getLandLord();
    }, [navigate, params.landlordId]);

    const onChange = (e) => {
        setMessage(e.target.value);
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="pageContainer">
            <header>
                <p className="pageHeader">Contact Landlord</p>
            </header>
            {landlord !== null && (
                <main>
                    <div className="contactLandlord">
                        <p className="landlordName">Contact {landlord.name}</p>
                    </div>
                    <form className="messageForm">
                        <div className="messageDiv">
                            <label htmlFor="message" className="messageLabel">
                                Message
                            </label>
                            <textarea
                                name="message"
                                id="message"
                                className="textarea"
                                value={message}
                                onChange={onChange}
                            ></textarea>
                        </div>
                        <a
                            href={`mailto:${
                                landlord.email
                            }?Subject=${searchParams.get(
                                "listingName"
                            )}&body=${message}`}
                        >
                            <button type="button" className="primaryButton">
                                Send Message
                            </button>
                        </a>
                    </form>
                </main>
            )}
        </div>
    );
}

export default Contact;
