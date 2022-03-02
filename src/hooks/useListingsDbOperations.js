import { useState, useCallback } from "react";
import {
    doc,
    addDoc,
    updateDoc,
    collection,
    serverTimestamp,
    getDoc,
    getDocs,
    query,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { v4 as uuidv4 } from "uuid";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";

export default function useListingsDbOperations() {
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
        const formDataToDb = {
            ...formData,
            timestamp: serverTimestamp(),
        };

        if (formData.deletedImgUrls.length > 0) {
            try {
                await deleteImagesFromStorage(formData.deletedImgUrls);
            } catch {
                setLoading(false);
                return Promise.reject("Unable to delete images");
            }
        }

        if (formData.images.length > 0) {
            try {
                let imgUrls = await saveImagesToStorage(
                    formData.userRef,
                    formData.images
                );
                formDataToDb.imgUrls = [...formData.imgUrls, ...imgUrls];
            } catch {
                setLoading(false);
                return Promise.reject("Unable to update images");
            }
        }

        delete formDataToDb.deletedImgUrls;
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

    const fetchListingFromDb = useCallback(async (collection, docId) => {
        setLoading(true);
        try {
            const docRef = doc(db, collection, docId);
            const docSnap = await getDoc(docRef);
            setLoading(false);
            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                return null;
            }
        } catch {
            setLoading(false);
            return Promise.reject("Unable to fetch data");
        }
    }, []);

    const fetchListingsFromDb = useCallback(async (queryParam) => {
        setLoading(true);
        try {
            const listingsRef = collection(db, "listings");
            const q = query(listingsRef, ...queryParam);
            const querySnap = await getDocs(q);
            setLoading(false);
            if (!querySnap.empty) {
                return querySnap;
            } else {
                return null;
            }
        } catch {
            setLoading(false);
            return Promise.reject("Unable to fetch data");
        }
    }, []);

    return {
        loading,
        saveListingToDb,
        updateListingInDb,
        fetchListingFromDb,
        fetchListingsFromDb,
    };
}

export const createListingsFromQuerySnap = (querySnap) => {
    let listings = [];
    querySnap.forEach((doc) => {
        return listings.push({
            id: doc.id,
            data: doc.data(),
        });
    });
    return listings;
};

const deleteImagesFromStorage = (urls) => {
    const deleteImage = (imageUrl) => {
        const storage = getStorage();
        const httpsReference = ref(storage, imageUrl);
        return deleteObject(httpsReference);
    };

    return Promise.all([...urls].map((imageUrl) => deleteImage(imageUrl)));
};

const saveImagesToStorage = (userUid, images) => {
    const storeImage = (image) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage();
            const fileName = `${image.name}-${uuidv4()}`;
            const storageRef = ref(storage, `images/${userUid}/` + fileName);
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
