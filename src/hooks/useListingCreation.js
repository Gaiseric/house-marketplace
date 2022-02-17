import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";
import { v4 as uuidv4 } from "uuid";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";

export default function useListingCreation() {
    const receiveGeoCoords = async (address, geolocation) => {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
        );
        const data = await response.json();
        geolocation.lat = data.resuts[0]?.geometry.location.lat ?? 0;
        geolocation.lng = data.resuts[0]?.geometry.location.lng ?? 0;

        return data.status === "ZERO_RESULTS"
            ? undefined
            : data.results[0]?.formatted_address;
    };

    const saveImagesToStorage = (userUid, images) => {
        const storeImage = (image) => {
            return new Promise((resolve, reject) => {
                const storage = getStorage();
                const fileName = `${userUid}-${image.name}-${uuidv4()}`;
                const storageRef = ref(storage, "images/" + fileName);
                const uploadTask = uploadBytesResumable(storageRef, image);
                uploadTask.on(
                    "state_changed",
                    null,
                    (error) => {
                        reject(error);
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then(
                            (downloadURL) => {
                                resolve(downloadURL);
                            }
                        );
                    }
                );
            });
        };

        return Promise.all([...images].map((image) => storeImage(image)));
    };

    const saveFormDataToDb = (formData, geolocation, imgUrls) => {
        const formDataToDb = {
            ...formData,
            geolocation,
            imgUrls,
            timestamp: serverTimestamp(),
        };

        formDataToDb.location = formData.address;
        delete formDataToDb.images;
        delete formDataToDb.address;
        delete formDataToDb.latitude;
        delete formDataToDb.longitude;
        !formDataToDb.offer && delete formDataToDb.discountedPrice;

        return addDoc(collection(db, "listings"), formDataToDb);
    };

    return { receiveGeoCoords, saveImagesToStorage, saveFormDataToDb };
}
