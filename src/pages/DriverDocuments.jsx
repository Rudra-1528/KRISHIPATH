import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Download, Eye, Plus, X } from 'lucide-react';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

const DriverDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const openPDF = () => window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
  const defaultDocs = [
    { id: 'default-license', name: 'Driving License', status: 'Verified', color: '#2e7d32', onClick: openPDF },
    { id: 'default-rc', name: 'Vehicle RC Book', status: 'Verified', color: '#2e7d32', onClick: openPDF },
    { id: 'default-insurance', name: 'Insurance Policy', status: 'Valid', color: 'orange', onClick: openPDF },
    { id: 'default-eway', name: 'E-Way Bill (Cargo)', status: 'Active', color: '#2e7d32', onClick: openPDF },
  ];

  // Fetch documents from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'driver_documents'), (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDocuments(docs.sort((a, b) => b.uploadedAt - a.uploadedAt));
    });
    return () => unsubscribe();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!documentName.trim()) {
      alert('Please enter a document name');
      return;
    }
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading...');

    try {
      // Upload file to Firebase Storage
      const fileRef = ref(storage, `driver_documents/${Date.now()}_${selectedFile.name}`);
      await uploadBytes(fileRef, selectedFile);
      const fileURL = await getDownloadURL(fileRef);

      // Save document info to Firestore
      await addDoc(collection(db, 'driver_documents'), {
        name: documentName.trim(),
        fileName: selectedFile.name,
        fileURL,
        filePath: fileRef.fullPath,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        uploadedAt: Date.now(),
        status: 'Active',
      });

      setUploadStatus('Upload successful!');
      setTimeout(() => {
        setShowUploadModal(false);
        setDocumentName('');
        setSelectedFile(null);
        setUploadStatus('');
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (document) => {
    if (!confirm(`Are you sure you want to delete "${document.name}"?`)) return;

    try {
      // Delete from Storage
      if (document.filePath) {
        const fileRef = ref(storage, document.filePath);
        await deleteObject(fileRef);
      }
      // Delete from Firestore
      await deleteDoc(doc(db, 'driver_documents', document.id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={28} />
          My Documents
        </h2>
        <button
          onClick={() => setShowUploadModal(true)}
          style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', transition: 'background 0.2s' }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#1b5e20')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#2e7d32')}
        >
          <Plus size={18} />
          Upload Document
        </button>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {defaultDocs.map((doc) => (
          <div
            key={doc.id}
            style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <FileText size={24} color="#2e7d32" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.name}
                </h3>
                <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                  {doc.status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <span>📄 {doc.name}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={doc.onClick}
                style={{ background: '#e3f2fd', color: '#1976d2', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', transition: 'background 0.2s' }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#bbdefb')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#e3f2fd')}
                title="View Document"
              >
                <Eye size={16} />
                View
              </button>
            </div>
          </div>
        ))}

        {documents.map((doc) => (
          <div
            key={doc.id}
            style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <FileText size={24} color="#2e7d32" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.name}
                </h3>
                <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                  {doc.status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <span>📄 {doc.fileName}</span>
                <span>📊 {formatFileSize(doc.fileSize)}</span>
                <span>📅 {formatDate(doc.uploadedAt)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => window.open(doc.fileURL, '_blank')}
                style={{ background: '#e3f2fd', color: '#1976d2', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', transition: 'background 0.2s' }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#bbdefb')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#e3f2fd')}
                title="View Document"
              >
                <Eye size={16} />
                View
              </button>
              <button
                onClick={() => handleDelete(doc)}
                style={{ background: '#ffebee', color: '#d32f2f', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', transition: 'background 0.2s' }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#ffcdd2')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#ffebee')}
                title="Delete Document"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#2e7d32', fontSize: '20px' }}>Upload Document</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setDocumentName('');
                  setSelectedFile(null);
                  setUploadStatus('');
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
              >
                <X size={24} color="#666" />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                Document Name *
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g., Driving License, RC Book, Insurance"
                style={{ width: '100%', padding: '12px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                Select File * (Max 5MB)
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}
              />
              {selectedFile && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '6px', fontSize: '12px', color: '#666' }}>
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}
            </div>

            {uploadStatus && (
              <div style={{ marginBottom: '20px', padding: '12px', background: uploadStatus.includes('success') ? '#e8f5e9' : uploadStatus.includes('failed') ? '#ffebee' : '#fff3cd', color: uploadStatus.includes('success') ? '#2e7d32' : uploadStatus.includes('failed') ? '#d32f2f' : '#f57c00', borderRadius: '8px', fontSize: '14px', textAlign: 'center', fontWeight: '600' }}>
                {uploadStatus}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setDocumentName('');
                  setSelectedFile(null);
                  setUploadStatus('');
                }}
                style={{ background: '#f5f5f5', color: '#333', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{ background: uploading ? '#ccc' : '#2e7d32', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDocuments;
