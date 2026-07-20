/**
 * Extract a thumbnail frame from a video file using canvas.
 * Seeks to 10% of the video duration and captures a single frame.
 */
export function extractVideoFrame(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);

        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = () => {
            video.currentTime = Math.min(video.duration * 0.1, 5);
        };

        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 360;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error('No canvas context'));
                return;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                (blob) => {
                    URL.revokeObjectURL(url);
                    if (blob) resolve(blob);
                    else reject(new Error('Failed to create blob'));
                },
                'image/jpeg',
                0.8
            );
        };

        video.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load video'));
        };

        video.src = url;
    });
}

/**
 * Extract a frame from a video file and upload it as a thumbnail.
 * Returns the thumbnail URL path.
 */
export async function generateThumbnail(file: File): Promise<string> {
    const blob = await extractVideoFrame(file);
    const formData = new FormData();
    formData.append('file', blob, 'thumbnail.jpg');

    const response = await fetch('/admin/upload/image', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: formData,
    });

    if (!response.ok) throw new Error('Failed to upload thumbnail');

    const result = await response.json();
    return result.path;
}
