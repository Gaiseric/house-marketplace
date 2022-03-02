import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderBy, limit } from "firebase/firestore";
import { Navigation, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Spinner from "./Spinner";
import useListingsDbOperations, {
    createListingsFromQuerySnap,
} from "../hooks/useListingsDbOperations";

function Slider() {
    const [listings, setListings] = useState(null);
    const { loading, fetchListingsFromDb } = useListingsDbOperations();
    const navigate = useNavigate();

    useEffect(() => {
        fetchListingsFromDb([orderBy("timestamp", "desc"), limit(5)]).then(
            (querySnap) => {
                if (querySnap) {
                    let listings = createListingsFromQuerySnap(querySnap);
                    setListings(listings);
                }
            }
        );
    }, [fetchListingsFromDb]);

    if (loading) {
        return <Spinner />;
    }

    return listings ? (
        <>
            <p className="exploreHeading">Recommended</p>
            <Swiper
                modules={[Navigation, Pagination]}
                slidesPerView={1}
                pagination={{ clickable: true }}
            >
                {listings.map(({ data, id }) => (
                    <SwiperSlide
                        key={id}
                        onClick={() => navigate(`/category/${data.type}/${id}`)}
                    >
                        <div
                            className="swiperSlideDiv"
                            style={{
                                background: `url(${data.imgUrls[0]}) center/cover no-repeat`,
                            }}
                        >
                            <p className="swiperSlideText">{data.name}</p>
                            <p className="swiperSlidePrice">
                                {"$"}
                                {data.discountedPrice ?? data.regularPrice}{" "}
                                {data.type === "rent" && "/ month"}
                            </p>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    ) : (
        <></>
    );
}

export default Slider;
