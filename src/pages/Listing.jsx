import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import shareIcon from "../assets/svg/shareIcon.svg";
import { toast } from "react-toastify";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import useAuthStatus from "../hooks/useAuthStatus";
import useListingsDbOperations from "../hooks/useListingsDbOperations";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Listing() {
    const [listing, setListing] = useState(null);
    const [shareLinkCopied, setShareLinkCopied] = useState(false);
    const { loggedUser } = useAuthStatus();
    const { loading, fetchListingFromDb } = useListingsDbOperations();
    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        fetchListingFromDb("listings", params.listingId)
            .then((docSnap) => {
                if (docSnap) {
                    setListing(docSnap);
                }
            })
            .catch((error) => {
                navigate(-1);
                toast.error(error);
            });
    }, [fetchListingFromDb, navigate, params.listingId]);

    const onClick = () => {
        navigator.clipboard.writeText(window.location.href);
        setShareLinkCopied(true);
        setTimeout(() => {
            setShareLinkCopied(false);
        }, 2000);
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        listing && (
            <main>
                <Swiper
                    modules={[Navigation, Pagination]}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                >
                    {listing.imgUrls.map((url, index) => (
                        <SwiperSlide key={index}>
                            <div
                                className="swiperSlideDiv"
                                style={{
                                    background: `url(${url}) center/cover no-repeat`,
                                }}
                            ></div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                <div className="shareIconDiv" onClick={onClick}>
                    <img src={shareIcon} alt="share" />
                </div>
                {shareLinkCopied && <p className="linkCopied">Link Copied!</p>}
                <div className="listingDetails">
                    <p className="listingName">
                        {listing.name} - $
                        {listing.offer
                            ? listing.discountedPrice
                            : listing.regularPrice}
                    </p>
                    <p className="listingLocation">{listing.location}</p>
                    <p className="listingType">
                        For {listing.type === "rent" ? "Rent" : "Sale"}
                    </p>
                    {listing.offer && (
                        <p className="discountPrice">
                            {"$"}
                            {listing.regularPrice -
                                listing.discountedPrice}{" "}
                            discount
                        </p>
                    )}
                    <ul className="listingDetailsList">
                        <li>
                            {listing.bedrooms > 1
                                ? `${listing.bedrooms} Bedrooms`
                                : "1 Bedroom"}
                        </li>
                        <li>
                            {listing.bathrooms > 1
                                ? `${listing.bathrooms} Bathrooms`
                                : "1 Bathroom"}
                        </li>
                        <li>{listing.parking && "Parking Spot"}</li>
                        <li>{listing.furnished && "Furnished"}</li>
                    </ul>
                    <p className="listingLocationTitle">Location</p>
                    <div className="leafletContainer">
                        <MapContainer
                            style={{ height: "100%", width: "100%" }}
                            center={[
                                listing.geolocation.lat,
                                listing.geolocation.lng,
                            ]}
                            zoom={13}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker
                                position={[
                                    listing.geolocation.lat,
                                    listing.geolocation.lng,
                                ]}
                            >
                                <Popup>{listing.location}</Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                    {loggedUser?.uid !== listing.userRef && (
                        <Link
                            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
                            className="primaryButton"
                        >
                            Contact Landlord
                        </Link>
                    )}
                </div>
            </main>
        )
    );
}

export default Listing;
