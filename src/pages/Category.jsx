import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { where, orderBy, limit, startAfter } from "firebase/firestore";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import useListingsDbOperations, {
    createListingsFromQuerySnap,
} from "../hooks/useListingsDbOperations";

function Category() {
    const [listings, setListings] = useState(null);
    const { loading, fetchListingsFromDb } = useListingsDbOperations();
    const [lastFetchedListing, setLastFetchedListing] = useState(null);
    const params = useParams();

    useLayoutEffect(() => {
        fetchListingsFromDb([
            where("type", "==", params.categoryName),
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
    }, [fetchListingsFromDb, params.categoryName]);

    const onFetchMoreListings = async () => {
        fetchListingsFromDb([
            where("type", "==", params.categoryName),
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
                <p className="pageHeader">
                    {params.categoryName === "rent"
                        ? "Places for rent"
                        : "Places for sale"}
                </p>
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
                !loading && <p>No listings for {params.categoryName}</p>
            )}
        </div>
    );
}

export default Category;
