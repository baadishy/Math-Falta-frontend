import { storage } from './firebase-config.js';
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param {File} file The file to upload.
 * @param {function(number): void} onProgress A callback function to report progress.
 * @returns {Promise<string>} A promise that resolves with the download URL.
 */
export function uploadFileToFirebase(file, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, 'raw-files/' + Date.now() + '-' + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error("Upload failed:", error);
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
}
