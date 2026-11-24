import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Upload, Link as LinkIcon, Trash2, Crop, X, Check } from 'lucide-react';
import { storage, auth } from '../../firebase';
import { ensureDirectImgur } from '../../hooks/useSiteSettings';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  aspect?: number;
  label?: string;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (error) => reject(error));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create image blob'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      0.9
    );
  });
}

export default function ImageUpload({
  value,
  onChange,
  folder,
  aspect = 1,
  label = 'Image',
}: ImageUploadProps) {
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [freeCrop, setFreeCrop] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setRawFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const uploadBlob = async (blob: Blob, fileName: string) => {
    setUploading(true);
    setProgress(0);
    setError('');
    const userId = auth.currentUser?.uid || 'admin';
    const storagePath = `uploads/${userId}/images/${folder}/${Date.now()}_${fileName}`;
    const storageRef = ref(storage, storagePath);

    try {
      await new Promise<void>((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, blob);
        task.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgress(pct);
          },
          (err) => reject(err),
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            onChange(url);
            resolve();
          }
        );
      });
      setRawImageSrc(null);
      setRawFile(null);
    } catch (err) {
      console.error('Firebase Storage upload error:', err);
      setError('Storage upload failed. You can paste a direct image URL below instead.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveCropped = async () => {
    if (!rawImageSrc || !croppedAreaPixels) return;
    try {
      const blob = await getCroppedBlob(rawImageSrc, croppedAreaPixels);
      const safeName = (rawFile?.name || 'image.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
      await uploadBlob(blob, safeName.endsWith('.jpg') ? safeName : `${safeName}.jpg`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cropping failed.');
    }
  };

  const handleSkipCrop = async () => {
    if (!rawFile) return;
    const safeName = rawFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    await uploadBlob(rawFile, safeName);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-stone-700">{label}</label>

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-stone-200 bg-stone-50 w-full max-w-xs">
          <img
            src={value}
            alt={label}
            referrerPolicy="no-referrer"
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3">
        <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-stone-300 bg-stone-50 hover:bg-lime-50 hover:border-lime-400 text-stone-700 text-xs font-semibold cursor-pointer transition-colors shrink-0">
          <Upload className="w-4 h-4 text-lime-600" />
          Upload & Crop Image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>

        <div className="relative flex-1">
          <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(ensureDirectImgur(e.target.value))}
            placeholder="OR paste direct image URL (Imgur links auto-convert)"
            className="w-full rounded-xl border border-stone-200 pl-9 pr-3 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
          />
        </div>

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear image URL"
            className="px-3 py-2 rounded-xl border border-stone-200 text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      {/* Crop Modal */}
      {rawImageSrc && (
        <div className="fixed inset-0 z-[70] bg-stone-950/90 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 bg-stone-900 text-white border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Crop className="w-5 h-5 text-lime-400" />
              <span className="font-bold text-sm">Crop & Optimize Image</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFreeCrop((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  freeCrop
                    ? 'bg-lime-500 text-stone-950'
                    : 'bg-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                {freeCrop ? 'Free Crop' : 'Standard Ratio'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRawImageSrc(null);
                  setRawFile(null);
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-stone-950">
            <Cropper
              image={rawImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={freeCrop ? undefined : aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="bg-stone-900 text-white px-6 py-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-64">
              <span className="text-xs font-semibold text-stone-400">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-lime-500"
              />
              <span className="text-xs tabular-nums text-stone-300">{zoom.toFixed(1)}x</span>
            </div>

            {uploading ? (
              <div className="flex items-center gap-3">
                <div className="w-40 h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lime-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold tabular-nums text-lime-400">
                  {progress}%
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRawImageSrc(null);
                    setRawFile(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSkipCrop}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-700 hover:bg-stone-600 text-white cursor-pointer"
                >
                  Skip & Use Original
                </button>
                <button
                  type="button"
                  onClick={handleSaveCropped}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-lime-500 hover:bg-lime-600 text-stone-950 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Save & Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
