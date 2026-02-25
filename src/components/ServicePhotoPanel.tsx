import { useRef } from 'react';
import { useAppContext } from '../context/useAppContext';

const ServicePhotoPanel = () => {
    const { servicePhotos, addServicePhoto, removeServicePhoto, currentUser, showToast } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                showToast('Please select image files only');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                const url = ev.target?.result as string;
                addServicePhoto({
                    url,
                    caption: file.name.replace(/\.[^.]+$/, ''),
                    serviceItemId: null,
                    uploadedBy: currentUser.name,
                });
            };
            reader.readAsDataURL(file);
        });

        // Reset input so same file can be re-selected
        e.target.value = '';
    };

    return (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-indigo-400 text-base">photo_camera</span>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Asset Verification</p>
                        <p className="text-xs font-bold text-slate-200">{servicePhotos.length} documentation photo{servicePhotos.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-indigo-500 transition-all"
                >
                    Capture
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            {/* Photo grid */}
            {servicePhotos.length === 0 ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:bg-white/5 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-600 text-[32px]">add_photo_alternate</span>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tap to document assets</p>
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Verification shared with client report</p>
                </div>
            ) : (
                <div className="p-3 grid grid-cols-3 gap-2">
                    {servicePhotos.map((photo) => (
                        <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                            <img
                                src={photo.url}
                                alt={photo.caption}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-[#0a0a0c]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                <p className="text-[8px] text-white font-bold text-center truncate w-full uppercase tracking-tight">
                                    {photo.caption}
                                </p>
                                <button
                                    onClick={() => removeServicePhoto(photo.id)}
                                    className="size-6 rounded bg-red-500/80 flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-white text-[14px]">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                    {/* Add more button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-400 hover:border-white/20 transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ServicePhotoPanel;
