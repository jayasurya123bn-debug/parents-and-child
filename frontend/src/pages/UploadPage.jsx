/**
 * src/pages/UploadPage.jsx
 * Upload artwork to Supabase Storage and database.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image as ImageIcon, X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../api/supabaseClient';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function UploadPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [dbUser, setDbUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Upload Form State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('drawing');
  const [selectedChildId, setSelectedChildId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Add Child Form State
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildDob, setNewChildDob] = useState('');
  const [newChildAgeGroup, setNewChildAgeGroup] = useState('middle_childhood');
  const [isAddingChild, setIsAddingChild] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      // Fetch user from public.users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (userData) {
        setDbUser(userData);
        // Fetch children
        const { data: kids } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', userData.id);
        
        if (kids) {
          setChildren(kids);
          if (kids.length > 0) setSelectedChildId(kids[0].id.toString());
        }
      } else {
        setError("Could not find user profile. Please re-register.");
      }
      setLoadingInitial(false);
    };

    fetchData();
  }, [user, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    if (!dbUser) return;
    setIsAddingChild(true);
    setError(null);

    const { data, error } = await supabase.from('children').insert([{
      parent_id: dbUser.id,
      display_name: newChildName,
      date_of_birth: newChildDob,
      age_group: newChildAgeGroup,
      privacy_level: 'community'
    }]).select();

    if (error) {
      setError(error.message);
    } else if (data && data.length > 0) {
      const newChild = data[0];
      setChildren([...children, newChild]);
      setSelectedChildId(newChild.id.toString());
      setShowAddChild(false);
      setNewChildName('');
      setNewChildDob('');
    }
    setIsAddingChild(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title || !selectedChildId || !dbUser) {
      setError("Please fill all required fields and select an image.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${dbUser.id}/${selectedChildId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('artworks')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // 3. Insert into artworks table
      const { error: dbError } = await supabase.from('artworks').insert([{
        child_id: parseInt(selectedChildId),
        parent_id: dbUser.id,
        title,
        description,
        category,
        image_original_url: publicUrl,
        image_original_pid: filePath,
        moderation_status: 'approved', // Auto-approve for demo
        is_published: true
      }]);

      if (dbError) throw dbError;

      setSuccess(true);
      setFile(null);
      setPreview(null);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <Navbar />
      <div className="page-container pt-24 pb-20 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white shadow-glow">
            <Upload size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white">Upload Artwork</h1>
            <p className="text-gray-500">Share your child's creativity with the community</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 text-green-700 p-6 rounded-xl border border-green-200 text-center shadow-sm">
            <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500" />
            <h2 className="text-xl font-bold mb-1">Artwork Uploaded Successfully!</h2>
            <p className="text-sm mb-4">It has been automatically approved and is now live in the gallery.</p>
            <button onClick={() => setSuccess(false)} className="btn-primary py-2 px-6 inline-block">
              Upload Another
            </button>
          </div>
        )}

        {!success && children.length === 0 && !showAddChild ? (
          <div className="glass-card p-10 text-center">
            <div className="text-6xl mb-4">👧👦</div>
            <h2 className="text-xl font-bold mb-2">No Children Profiles Found</h2>
            <p className="text-gray-500 mb-6">You need to add a child profile before you can upload artwork.</p>
            <button onClick={() => setShowAddChild(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus size={18} /> Add Child Profile
            </button>
          </div>
        ) : !success && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Form */}
            <div className="glass-card p-6 md:p-8">
              {showAddChild ? (
                <form onSubmit={handleAddChild} className="space-y-4">
                  <h3 className="text-lg font-bold mb-4">Add Child Profile</h3>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Display Name (First Name)</label>
                    <input type="text" required value={newChildName} onChange={e=>setNewChildName(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Date of Birth</label>
                    <input type="date" required value={newChildDob} onChange={e=>setNewChildDob(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Age Group</label>
                    <select value={newChildAgeGroup} onChange={e=>setNewChildAgeGroup(e.target.value)} className="input-field">
                      <option value="toddler">Toddler (1-3)</option>
                      <option value="early_childhood">Early Childhood (4-7)</option>
                      <option value="middle_childhood">Middle Childhood (8-11)</option>
                      <option value="tween">Tween/Teen (12+)</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={isAddingChild} className="btn-primary flex-1 disabled:opacity-50">
                      {isAddingChild ? 'Saving...' : 'Save Profile'}
                    </button>
                    {children.length > 0 && (
                      <button type="button" onClick={() => setShowAddChild(false)} className="btn-secondary px-4">Cancel</button>
                    )}
                  </div>
                </form>
              ) : (
                <form onSubmit={handleUpload} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Select Child</label>
                    <div className="flex gap-2">
                      <select value={selectedChildId} onChange={e=>setSelectedChildId(e.target.value)} className="input-field flex-1" required>
                        {children.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowAddChild(true)} className="btn-secondary px-3" title="Add Child">
                        <Plus size={16}/>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Artwork Title</label>
                    <input type="text" required value={title} onChange={e=>setTitle(e.target.value)} className="input-field" placeholder="e.g. My Magic Rainbow" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Description (Optional)</label>
                    <textarea value={description} onChange={e=>setDescription(e.target.value)} className="input-field min-h-[80px]" placeholder="Tell us about the artwork..." />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Category</label>
                    <select value={category} onChange={e=>setCategory(e.target.value)} className="input-field">
                      <option value="drawing">Drawing</option>
                      <option value="painting">Painting</option>
                      <option value="craft">Crafts & 3D</option>
                      <option value="digital">Digital Art</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <button type="submit" disabled={isUploading || !file} className="btn-primary w-full py-3 disabled:opacity-50">
                    {isUploading ? 'Uploading...' : 'Publish Artwork'}
                  </button>
                </form>
              )}
            </div>

            {/* Image Preview Area */}
            {!showAddChild && (
              <div className="flex flex-col gap-4">
                <div className="glass-card p-6 flex-1 flex flex-col items-center justify-center border-2 border-dashed border-brand-200 hover:border-brand-400 transition-colors relative overflow-hidden group">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  
                  {preview ? (
                    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
                      <img src={preview} alt="Preview" className="max-w-full max-h-[350px] object-contain rounded-lg shadow-md z-0" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg z-0">
                        <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">Click to change image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 z-0 pointer-events-none">
                      <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-500">
                        <ImageIcon size={28} />
                      </div>
                      <p className="font-bold text-gray-700 mb-1">Click or drag image to upload</p>
                      <p className="text-xs text-gray-500">Supports JPG, PNG (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
