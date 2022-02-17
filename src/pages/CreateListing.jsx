import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStatus from "../hooks/useAuthStatus";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import useListingCreation from "../hooks/useListingCreation";

function CreateListing() {
    const [geolocationEnabled, setGeolocationEnabled] = useState(false);

    const [loading, setLoading] = useState(false);

    const { loggedUser, checkingStatus } = useAuthStatus();

    const { receiveGeoCoords, saveImagesToStorage, saveFormDataToDb } =
        useListingCreation();

    const [formData, setFormData] = useState({
        type: "rent",
        name: "",
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: "",
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: {},
        latitude: 0,
        longitude: 0,
    });

    const navigate = useNavigate();

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

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.discountedPrice >= formData.regularPrice) {
            setLoading(false);
            toast.error("Discounted price needs to be less than regular price");
            return;
        }
        if (formData.images.length > 6) {
            setLoading(false);
            toast.error("Max 6 images allowed");
            return;
        }

        let geolocation = {};
        if (geolocationEnabled) {
            try {
                let formattedAddress = await receiveGeoCoords(
                    formData.address,
                    geolocation
                );
                if (
                    formattedAddress === undefined ||
                    formattedAddress.includes("undefined")
                ) {
                    setLoading(false);
                    toast.error("Please enter a correct address");
                    return;
                }
            } catch {
                setLoading(false);
                toast.error("Unable to receive geolocation coordinates");
                return;
            }
        } else {
            geolocation.lat = formData.latitude;
            geolocation.lng = formData.longitude;
        }

        let imgUrls;
        try {
            imgUrls = await saveImagesToStorage(
                loggedUser.uid,
                formData.images
            );
        } catch {
            setLoading(false);
            toast.error("Problems with images uploading");
        }

        try {
            const docRef = await saveFormDataToDb(
                formData,
                geolocation,
                imgUrls
            );
            setLoading(false);
            toast.success("Listing saved to database");
            navigate(`/category/${formData.type}/${docRef.id}`);
        } catch {
            setLoading(false);
            toast.error("Problems with storing to database");
        }
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
                <p className="pageHeader">Create a Listing</p>
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
                        id="address"
                        type="text"
                        value={formData.address}
                        onChange={onMutate}
                        required
                    />
                    {!geolocationEnabled && (
                        <div className="formLatLng">
                            <div>
                                <label className="formLabel">Latitude</label>
                                <input
                                    type="number"
                                    className="formInputSmall"
                                    id="latitude"
                                    value={formData.latitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                            <div>
                                <label className="formLabel">Longitude</label>
                                <input
                                    type="number"
                                    className="formInputSmall"
                                    id="longitude"
                                    value={formData.longitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                        </div>
                    )}
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
                        Create Listing
                    </button>
                </form>
            </main>
        </div>
    );
}

export default CreateListing;
