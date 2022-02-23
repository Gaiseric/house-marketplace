import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    startAfter,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";

function Category() {
    const [listings, setListings] = useState(null);

    const [loading, setLoading] = useState(true);

    const [lastFetchedListing, setLastFetchedListing] = useState(null);

    const params = useParams();

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const listingRef = collection(db, "listings");
                const q = query(
                    listingRef,
                    where("type", "==", params.categoryName),
                    orderBy("timestamp", "desc"),
                    limit(10)
                );
                const querySnap = await getDocs(q);

                if (querySnap.size > 0) {
                    const lastVisible =
                        querySnap.docs[querySnap.docs.length - 1];
                    setLastFetchedListing(lastVisible);

                    let listings = [];
                    querySnap.forEach((doc) => {
                        return listings.push({
                            id: doc.id,
                            data: doc.data(),
                        });
                    });

                    setListings(listings);
                }

                setLoading(false);
            } catch (error) {
                toast.error("Couldn't receive listings");
            }
        };
        fetchListings();
    }, [params.categoryName]);

    const onFetchMoreListings = async () => {
        try {
            const listingRef = collection(db, "listings");
            const q = query(
                listingRef,
                where("type", "==", params.categoryName),
                orderBy("timestamp", "desc"),
                startAfter(lastFetchedListing),
                limit(10)
            );
            const querySnap = await getDocs(q);

            if (querySnap.size > 0) {
                const lastVisible = querySnap.docs[querySnap.docs.length - 1];
                setLastFetchedListing(lastVisible);

                let listings = [];
                querySnap.forEach((doc) => {
                    return listings.push({
                        id: doc.id,
                        data: doc.data(),
                    });
                });

                setListings((prevState) => [...prevState, ...listings]);
            } else {
                setLastFetchedListing(null);
            }

            setLoading(false);
        } catch (error) {
            toast.error("Couldn't receive listings");
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="category">
            <header>
                <p className="pageHeader">
                    {params.categoryName === "rent"
                        ? "Places for rent"
                        : "Places for sale"}
                </p>
            </header>
            {listings && listings.length > 0 ? (
                <main>
                    <ul className="categoryListings">
                        {listings.map((listing) => (
                            <ListingItem key={listing.id} listing={listing} />
                        ))}
                    </ul>
                    {lastFetchedListing && (
                        <p className="loadMore" onClick={onFetchMoreListings}>
                            Load More
                        </p>
                    )}
                </main>
            ) : (
                <p>No listings for {params.categoryName}</p>
            )}
        </div>
    );
}

export default Category;
