import { useState, useCallback } from "react";
import {
    doc,
    addDoc,
    updateDoc,
    collection,
    serverTimestamp,
    getDoc,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { v4 as uuidv4 } from "uuid";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";

export default function useDbOperations() {
    const [loading, setLoading] = useState(false);

    const saveListingToDb = async (formData) => {
        setLoading(true);
        let imgUrls;

        try {
            imgUrls = await saveImagesToStorage(
                formData.userRef,
                formData.images
            );
        } catch {
            setLoading(false);
            return Promise.reject("Unable to save images");
        }

        const formDataToDb = {
            ...formData,
            imgUrls,
            timestamp: serverTimestamp(),
        };

        delete formDataToDb.images;
        !formDataToDb.offer && delete formDataToDb.discountedPrice;

        try {
            const docRef = await addDoc(
                collection(db, "listings"),
                formDataToDb
            );
            setLoading(false);
            return docRef;
        } catch {
            setLoading(false);
            return Promise.reject("Unable to save listing");
        }
    };

    const updateListingInDb = useCallback(async (formData, listingId) => {
        setLoading(true);
        let imgUrls;

        try {
            imgUrls = await saveImagesToStorage(
                formData.userRef,
                formData.images
            );
        } catch {
            setLoading(false);
            return Promise.reject("Unable to update images");
        }

        const formDataToDb = {
            ...formData,
            imgUrls,
            timestamp: serverTimestamp(),
        };

        delete formDataToDb.images;
        !formDataToDb.offer && delete formDataToDb.discountedPrice;

        try {
            const docRef = doc(db, "listings", listingId);
            await updateDoc(docRef, formDataToDb);
            setLoading(false);
            return docRef;
        } catch {
            setLoading(false);
            return Promise.reject("Unable to update listing");
        }
    }, []);

    const fetchListingFromDb = useCallback(async (listingId) => {
        setLoading(true);
        try {
            const docRef = doc(db, "listings", listingId);
            const docSnap = await getDoc(docRef);
            setLoading(false);
            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                return null;
            }
        } catch {
            setLoading(false);
            return Promise.reject("Unable to fetch listing");
        }
    }, []);

    return {
        loading,
        saveListingToDb,
        updateListingInDb,
        fetchListingFromDb,
    };
}

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
