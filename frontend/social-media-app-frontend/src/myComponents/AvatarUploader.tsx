import { useState } from "react";


export const AvatarUploader = () => {
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    return {AvatarUploaderComponent : <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
        {avatarPreview ? (
            <img
                src={avatarPreview}
                className="w-full h-full object-cover"
            />
        ) : (
            <label className="cursor-pointer text-sm font-small text-blue-500">
                Upload avatar
                <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarChange}
                />
            </label>
        )}
    </div>, avatar}
    
}