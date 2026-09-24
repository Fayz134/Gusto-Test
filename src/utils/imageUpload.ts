/**
 * Image processing utility for manual photo uploads
 * Resizes and compresses images via HTML5 Canvas to keep localStorage light & fast
 */
export const processImageFile = (file: File, maxDimension = 1200, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier sélectionné n\'est pas une image valide.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Impossible de lire le fichier.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale down if larger than maxDimension
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original data URL if canvas 2d context fails
            resolve(result);
            return;
          }

          // Clean drawing with smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as JPEG with 0.85 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Canvas compression error, using raw image:', err);
          resolve(result);
        }
      };

      img.onerror = () => {
        reject(new Error('Erreur lors du décodage de l\'image.'));
      };

      img.src = result;
    };

    reader.onerror = () => {
      reject(new Error('Erreur de lecture du fichier image.'));
    };

    reader.readAsDataURL(file);
  });
};
