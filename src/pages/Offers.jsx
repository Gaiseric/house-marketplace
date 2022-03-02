import { useLayoutEffect, useState } from "react";
import { where, orderBy, limit, startAfter } from "firebase/firestore";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import useListingsDbOperations, {
    createListingsFromQuerySnap,
} from "../hooks/useListingsDbOperations";

function Offers() {
    const [listings, setListings] = useState(null);
    const { loading, fetchListingsFromDb } = useListingsDbOperations();
    const [lastFetchedListing, setLastFetchedListing] = useState(null);

    useLayoutEffect(() => {
        fetchListingsFromDb([
            where("offer", "==", true),
            orderBy("timestamp", "desc"),
            limit(1),
        ])
            .then((querySnap) => {
                if (querySnap) {
                    const lastVisible =
                        querySnap.docs[querySnap.docs.length - 1];
                    setLastFetchedListing(lastVisible);

                    let listings = createListingsFromQuerySnap(querySnap);
                    setListings(listings);
                }
            })
            .catch((error) => {
                toast.error(error);
            });
    }, [fetchListingsFromDb]);

    const onFetchMoreListings = async () => {
        fetchListingsFromDb([
            where("offer", "==", true),
            orderBy("timestamp", "desc"),
            startAfter(lastFetchedListing),
            limit(1),
        ])
            .then((querySnap) => {
                if (querySnap) {
                    const lastVisible =
                        querySnap.docs[querySnap.docs.length - 1];
                    setLastFetchedListing(lastVisible);

                    let listings = createListingsFromQuerySnap(querySnap);
                    setListings((prevState) => [...prevState, ...listings]);
                } else {
                    setLastFetchedListing(null);
                }
            })
            .catch((error) => {
                toast.error(error);
            });
    };

    return (
        <div className="category">
            <header>
                <p className="pageHeader">Offers</p>
            </header>
            {loading && <Spinner />}
            {listings ? (
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
                !loading && <p>No listings for offers</p>
            )}
        </div>
    );
}

export default Offers;
