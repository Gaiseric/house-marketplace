import { Link } from "react-router-dom";
import { PropTypes } from "prop-types";
import { ReactComponent as DeleteIcon } from "../assets/svg/deleteIcon.svg";
import bedIcon from "../assets/svg/bedIcon.svg";
import bathtubIcon from "../assets/svg/bathtubIcon.svg";

function ListingItem({ listing: { id, data: listing }, onDelete }) {
    return (
        <li className="categoryListing">
            <Link
                className="categoryListingLink"
                to={`/category/${listing.type}/${id}`}
            >
                <img
                    src={listing.imgUrls[0]}
                    alt={listing.name}
                    className="categoryListingImg"
                />
                <div className="categoryListingDetails">
                    <p className="categoryListingLocation">
                        {listing.location}
                    </p>
                    <p className="categoryListingName">{listing.name}</p>
                    <p className="categoryListingPrice">
                        $
                        {listing.offer
                            ? listing.discountedPrice
                            : listing.regularPrice}
                        {listing.type === "rent" && " / Month"}
                    </p>
                    <div className="categoryListingInfoDiv">
                        <img src={bedIcon} alt="bed" />
                        <p className="categoryListingInfoText">
                            {listing.bedrooms > 1
                                ? `${listing.bedrooms} Bedrooms`
                                : "1 Bedroom"}
                        </p>
                        <img src={bathtubIcon} alt="bath" />
                        <p className="categoryListingInfoText">
                            {listing.bathrooms > 1
                                ? `${listing.bathrooms} Bathrooms`
                                : "1 Bathroom"}
                        </p>
                    </div>
                </div>
            </Link>
            {onDelete && (
                <DeleteIcon
                    className="removeIcon"
                    fill="rgb(231, 76, 60)"
                    onClick={() => onDelete(id, listing.name)}
                />
            )}
        </li>
    );
}

ListingItem.defaultProps = {
    onDelete: null,
};

ListingItem.propTypes = {
    listing: PropTypes.object.isRequired,
    onDelete: PropTypes.func,
};

export default ListingItem;
