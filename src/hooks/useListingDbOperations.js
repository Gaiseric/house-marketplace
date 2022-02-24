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

export default function useListingDbOperations() {
    return {
        saveImagesToStorage,
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

const saveListingToDb = (formData, imgUrls) => {
    const formDataToDb = {
        ...formData,
        imgUrls,
        timestamp: serverTimestamp(),
    };

    delete formDataToDb.images;
    !formDataToDb.offer && delete formDataToDb.discountedPrice;

    return addDoc(collection(db, "listings"), formDataToDb);
};

const updateListingInDb = async (formData, imgUrls, listingId) => {
    const formDataToDb = {
        ...formData,
        imgUrls,
        timestamp: serverTimestamp(),
    };

    delete formDataToDb.images;
    !formDataToDb.offer && delete formDataToDb.discountedPrice;

    const docRef = doc(db, "listings", listingId);
    await updateDoc(docRef, formDataToDb);
    return docRef;
};

const fetchListingFromDb = async (listingId) => {
    const docRef = doc(db, "listings", listingId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
};
