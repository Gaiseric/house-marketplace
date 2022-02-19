import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";

function Offers() {
    const [listings, setListings] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const listingRef = collection(db, "listings");
                const q = query(
                    listingRef,
                    where("offer", "==", true),
                    orderBy("timestamp", "desc"),
                    limit(10)
                );
                const querySnap = await getDocs(q);
                let listings = [];
                querySnap.forEach((doc) => {
                    return listings.push({
                        id: doc.id,
                        data: doc.data(),
                    });
                });
                setListings(listings);
                setLoading(false);
            } catch {
                toast.error("Couldn't receive listings");
            }
        };
        fetchListings();
    }, []);

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="category">
            <header>
                <p className="pageHeader">Offers</p>
            </header>
            {listings && listings.length > 0 ? (
                <main>
                    <ul className="categoryListings">
                        {listings.map((listing) => (
                            <ListingItem key={listing.id} listing={listing} />
                        ))}
                    </ul>
                </main>
            ) : (
                <p>No listings for offers</p>
            )}
        </div>
    );
}

export default Offers;
