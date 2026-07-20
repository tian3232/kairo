import { useRef, useState } from 'react';
import { Upload, X, FileVideo, ImageIcon } from 'lucide-react';
import { generateThumbnail } from '@/lib/video-thumbnail';

interface FileUploadProps {
    value: string;
    onChange: (url: string) => void;
    type: 'image' | 'video';
    label?: string;
    accept?: string;
    onVideoThumbnail?: (thumbnailUrl: string) => void;
}

export default function FileUpload({ value, onChange, type, label, accept, onVideoThumbnail }: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [generatingThumb, setGeneratingThumb] = useState(false);

    const defaultAccept = type === 'image' ? 'image/*' : 'video/mp4,video/webm,video/x-matroska';

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        const endpoint = type === 'image' ? '/admin/upload/image' : '/admin/upload/video';

        try {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    setProgress(Math.round((e.loaded / e.total) * 100));
                }
            });

            const result = await new Promise<{ path: string; url: string }>((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        try {
                            const json = JSON.parse(xhr.responseText);
                            reject(new Error(json.message || 'Error al subir archivo'));
                        } catch {
                            reject(new Error('Error al subir archivo'));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error('Error de red'));
                xhr.open('POST', endpoint);
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.setRequestHeader('X-CSRF-TOKEN', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '');
                xhr.send(formData);
            });

            onChange(result.path);

            if (type === 'video' && onVideoThumbnail) {
                setGeneratingThumb(true);
                try {
                    const thumbUrl = await generateThumbnail(file);
                    onVideoThumbnail(thumbUrl);
                } catch {
                    // Thumbnail generation is best-effort
                } finally {
                    setGeneratingThumb(false);
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al subir');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleClear = () => {
        onChange('');
        setError(null);
    };

    return (
        <div>
            {label && <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>}

            {value ? (
                <div className="relative rounded-lg border border-border bg-muted p-3">
                    {type === 'image' ? (
                        <div className="flex items-center gap-3">
                            <img src={value.startsWith('/') ? value : `/storage/${value}`} alt="" className="h-16 w-16 rounded object-cover" />
                            <div className="flex-1 truncate text-sm text-muted-foreground">{value}</div>
                            <button type="button" onClick={handleClear} className="text-destructive hover:opacity-70">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <FileVideo className="h-8 w-8 text-muted-foreground" />
                            <div className="flex-1 truncate text-sm text-muted-foreground">{value}</div>
                            {generatingThumb && (
                                <span className="text-xs text-muted-foreground animate-pulse">Generando thumbnail...</span>
                            )}
                            <button type="button" onClick={handleClear} className="text-destructive hover:opacity-70">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept ?? defaultAccept}
                        onChange={handleUpload}
                        className="hidden"
                    />

                    {uploading ? (
                        <div className="rounded-lg border border-border bg-muted p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                                <Upload className="h-4 w-4 animate-pulse" />
                                Subiendo... {progress}%
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-border">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground hover:border-primary/50 hover:bg-muted/50"
                        >
                            {type === 'image' ? (
                                <ImageIcon className="h-5 w-5" />
                            ) : (
                                <FileVideo className="h-5 w-5" />
                            )}
                            {type === 'image' ? 'Subir imagen' : 'Subir video'}
                        </button>
                    )}

                    {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="O ingresa una URL directamente"
                        className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </>
            )}
        </div>
    );
}
