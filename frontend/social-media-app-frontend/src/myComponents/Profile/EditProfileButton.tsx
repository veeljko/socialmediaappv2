import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/features/auth/types";
import { useUpdateProfileMutation } from "@/services/authApi";
import { Camera, Save, Settings } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { PopUpComponent } from "../PopupComponents/PopUpComponent";

export function EditProfileButton({ profileData }: { profileData: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(profileData.email ?? "");
  const [firstName, setFirstName] = useState(profileData.firstName ?? "");
  const [lastName, setLastName] = useState(profileData.lastName ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  useEffect(() => {
    if (!isOpen) return;
    setEmail(profileData.email ?? "");
    setFirstName(profileData.firstName ?? "");
    setLastName(profileData.lastName ?? "");
    setAvatarFile(null);
  }, [isOpen, profileData.email, profileData.firstName, profileData.lastName]);

  const previewUrl = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : profileData.avatar?.secure_url || null),
    [avatarFile, profileData.avatar?.secure_url]
  );

  useEffect(() => {
    return () => {
      if (avatarFile && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [avatarFile, previewUrl]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAvatarFile(event.target.files?.[0] ?? null);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("email", email.trim());
    formData.append("firstName", firstName.trim());
    formData.append("lastName", lastName.trim());

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      await updateProfile(formData).unwrap();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => setIsOpen(true)}
        aria-label="Edit profile"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <PopUpComponent isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="px-6 py-8">
          <div className="mb-5 text-center">
            <p className="text-xl font-semibold tracking-tight">Edit profile</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your profile details.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="h-24 w-24 overflow-hidden rounded-full border border-border bg-muted">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-accent">
                <Camera className="h-4 w-4" />
                Change avatar
                <Input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              type="email"
            />
            <Input
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="First name"
            />
            <Input
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Last name"
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading || !email.trim()}>
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </div>
        </div>
      </PopUpComponent>
    </>
  );
}
