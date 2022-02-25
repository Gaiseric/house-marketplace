import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import useDbOperations from "../hooks/useDbOperations";
import Spinner from "../components/Spinner";

function Contact() {
    const [message, setMessage] = useState("");
    const [landlord, setLandLord] = useState(null);
    const { loading, fetchDocFromDb } = useDbOperations();
    const params = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDocFromDb("users", params.landlordId)
            .then((docSnap) => {
                if (docSnap) {
                    setLandLord(docSnap);
                }
            })
            .catch((error) => {
                navigate(-1);
                toast.error(error);
            });
    }, [fetchDocFromDb, navigate, params.landlordId]);

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
            {landlord && (
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
