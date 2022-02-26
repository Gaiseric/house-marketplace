import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuthStatus from "../hooks/useAuthStatus";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import useListingsDbOperations from "../hooks/useListingsDbOperations";

function EditListing() {
    const [listing, setListing] = useState(null);
    const { loggedUser, checkingStatus } = useAuthStatus();
    const { loading, updateListingInDb, fetchListingFromDb } =
        useListingsDbOperations();
    const [formData, setFormData] = useState({
        type: "rent",
        name: "",
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        location: "",
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: {},
        geolocation: {
            lat: 0,
            lng: 0,
        },
    });
    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        if (!checkingStatus) {
            if (loggedUser) {
                setFormData((prevState) => {
                    return { ...prevState, userRef: loggedUser.uid };
                });
            } else {
                navigate("/sign-in");
            }
        }
    }, [checkingStatus, loggedUser, navigate]);

    useEffect(() => {
        fetchListingFromDb("listings", params.listingId)
            .then((docSnap) => {
                if (docSnap) {
                    setListing(docSnap);
                    setFormData({
                        ...docSnap,
                        images: {},
                    });
                }
            })
            .catch((error) => {
                navigate(-1);
                toast.error(error);
            });
    }, [fetchListingFromDb, navigate, params.listingId]);

    useEffect(() => {
        if (listing && listing.userRef !== loggedUser.uid) {
            navigate("/");
            toast.error("You can not edit that listing");
        }
    }, [listing, loggedUser, navigate]);

    const onSubmit = (e) => {
        e.preventDefault();

        if (formData.discountedPrice >= formData.regularPrice) {
            toast.error("Discounted price needs to be less than regular price");
            return;
        }
        if (formData.images.length > 6) {
            toast.error("Max 6 images allowed");
            return;
        }

        updateListingInDb(formData, params.listingId)
            .then((docRef) => {
                toast.success("Listing updated in database");
                navigate(`/category/${formData.type}/${docRef.id}`);
            })
            .catch((error) => {
                toast.error(error);
            });
    };

    const onMutate = (e) => {
        let boolean = null;
        if (e.target.value === "true") {
            boolean = true;
        } else if (e.target.value === "false") {
            boolean = false;
        }
        if (e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                images: e.target.files,
            }));
        } else if (e.target.id === "lat" || e.target.id === "lng") {
            setFormData((prevState) => ({
                ...prevState,
                geolocation: {
                    ...prevState.geolocation,
                    [e.target.id]: Number(e.target.value),
                },
            }));
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]:
                    boolean ??
                    (e.target.type === "number"
                        ? Number(e.target.value)
                        : e.target.value),
            }));
        }
    };

    if (checkingStatus) {
        return <Spinner />;
    }
    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="profile">
            <header>
                <p className="pageHeader">Edit Listing</p>
            </header>
            <main>
                <form className="listingForm" onSubmit={onSubmit}>
                    <label className="formLabel">Sale / Rent</label>
                    <div className="formButtons">
                        <button
                            type="button"
                            className={
                                formData.type === "sale"
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            id="type"
                            value="sale"
                            onClick={onMutate}
                        >
                            Sale
                        </button>
                        <button
                            type="button"
                            className={
                                formData.type === "rent"
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            id="type"
                            value="rent"
                            onClick={onMutate}
                        >
                            Rent
                        </button>
                    </div>
                    <label className="formLabel">Name</label>
                    <input
                        type="text"
                        className="formInputName"
                        id="name"
                        value={formData.name}
                        onChange={onMutate}
                        maxLength="32"
                        minLength="10"
                        required
                    />
                    <div className="formRooms">
                        <div>
                            <label className="formLabel">Bedrooms</label>
                            <input
                                type="number"
                                className="formInputSmall"
                                id="bedrooms"
                                value={formData.bedrooms}
                                onChange={onMutate}
                                min="1"
                                max="50"
                                required
                            />
                        </div>
                        <div>
                            <label className="formLabel">Bathrooms</label>
                            <input
                                type="number"
                                className="formInputSmall"
                                id="bathrooms"
                                value={formData.bathrooms}
                                onChange={onMutate}
                                min="1"
                                max="50"
                                required
                            />
                        </div>
                    </div>
                    <label className="formLabel">Parking spot</label>
                    <div className="formButtons">
                        <button
                            type="button"
                            className={
                                formData.parking
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            id="parking"
                            value={true}
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            type="button"
                            className={
                                !formData.parking && formData.parking !== null
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            id="parking"
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>
                    <label className="formLabel">Furnished</label>
                    <div className="formButtons">
                        <button
                            type="button"
                            className={
                                formData.furnished
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            id="furnished"
                            value={true}
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            type="button"
                            className={
                                !formData.furnished &&
                                formData.furnished !== null
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            id="furnished"
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>
                    <label className="formLabel">Address</label>
                    <textarea
                        className="formInputAddress"
                        id="location"
                        type="text"
                        value={formData.location}
                        onChange={onMutate}
                        required
                    />
                    <div className="formLatLng">
                        <div>
                            <label className="formLabel">Latitude</label>
                            <input
                                type="number"
                                className="formInputSmall"
                                id="lat"
                                value={formData.geolocation.lat}
                                onChange={onMutate}
                                required
                            />
                        </div>
                        <div>
                            <label className="formLabel">Longitude</label>
                            <input
                                type="number"
                                className="formInputSmall"
                                id="lng"
                                value={formData.geolocation.lng}
                                onChange={onMutate}
                                required
                            />
                        </div>
                    </div>
                    <label className="formLabel">Offer</label>
                    <div className="formButtons">
                        <button
                            className={
                                formData.offer
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            type="button"
                            id="offer"
                            value={true}
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !formData.offer && formData.offer !== null
                                    ? "formButtonActive"
                                    : "formButton"
                            }
                            type="button"
                            id="offer"
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>
                    <label className="formLabel">Regular Price</label>
                    <div className="formPriceDiv">
                        <input
                            className="formInputSmall"
                            type="number"
                            id="regularPrice"
                            value={formData.regularPrice}
                            onChange={onMutate}
                            min="50"
                            max="750000000"
                            required
                        />
                        {formData.type === "rent" && (
                            <p className="formPriceText">$ / Month</p>
                        )}
                    </div>
                    {formData.offer && (
                        <>
                            <label className="formLabel">
                                Discounted Price
                            </label>
                            <input
                                className="formInputSmall"
                                type="number"
                                id="discountedPrice"
                                value={formData.discountedPrice}
                                onChange={onMutate}
                                min="50"
                                max="750000000"
                                required={formData.offer}
                            />
                        </>
                    )}
                    <label className="formLabel">Images</label>
                    <p className="imagesInfo">
                        The first image will be the cover (max 6).
                    </p>
                    <input
                        className="formInputFile"
                        type="file"
                        id="images"
                        onChange={onMutate}
                        max="6"
                        accept=".jpg,.png,.jpeg"
                        multiple
                        required
                    />
                    <button
                        type="submit"
                        className="primaryButton createListingButton"
                    >
                        Edit Listing
                    </button>
                </form>
            </main>
        </div>
    );
}

export default EditListing;
