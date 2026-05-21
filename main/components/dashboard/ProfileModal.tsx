import React, { useState, useRef, useEffect } from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userAvatar: string;
  setUserName: (name: string) => void;
  setUserAvatar: (avatar: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userName, userAvatar, setUserName, setUserAvatar }) => {
  const [editedName, setEditedName] = useState(userName);
  const [editedAvatar, setEditedAvatar] = useState(userAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedName(userName);
    setEditedAvatar(userAvatar);
  }, [isOpen, userName, userAvatar]);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditedAvatar(URL.createObjectURL(file));
    }
  };
  
  const handleSave = () => {
    setUserName(editedName);
    setUserAvatar(editedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md p-8 border border-subtle" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium font-heading text-text">Edit Profile</h2>
          <button onClick={onClose} className="text-2xl font-light p-1 rounded-full text-text-muted hover:bg-slate-100">&times;</button>
        </div>

        <div className="flex flex-col items-center space-y-4">
            <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img 
                src={editedAvatar} 
                alt="Avatar" 
                className="w-32 h-32 rounded-full object-cover border-4 border-subtle"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-semibold">Change Photo</span>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                />
            </div>

            <div className="w-full">
                <label className="block text-text-muted text-sm font-medium mb-1" htmlFor="profileName">Full Name</label>
                <input 
                    id="profileName"
                    type="text" 
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="appearance-none border border-subtle bg-background rounded-lg w-full py-2.5 px-3 text-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-text bg-subtle hover:bg-slate-300 font-semibold transition-colors">
                Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-dark font-semibold transition-colors">
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;