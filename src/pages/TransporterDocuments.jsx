import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Plus, Eye, Trash2, X, Upload, ChevronDown, ChevronRight } from 'lucide-react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { translations } from '../translations';

const TransporterDocuments = () => {
  const { lang } = useOutletContext();
  const t = translations.menu?.[lang] || translations.menu?.en || {};

  // Drivers list from Fleet (transporter's drivers)
  const initialDriversData = [
    { 
      id: "DRV-101", 
      name: "Rudra Pratap", 
      truck: "VAC13143",
      phone: "+919580214142",
      route: "Mumbai → Nashik"
    },
    { 
      id: "DRV-102", 
      name: "Shaurya Mudgal", 
      truck: "MH-12-9988",
      phone: "+919354937688",
      route: "Pune → Mumbai"
    },
    { 
      id: "DRV-103", 
      name: "Vikram Singh", 
      truck: "GJ-05-1122",
      phone: "+919988777665",
      route: "Surat → Vadodara"
    },
    { 
      id: "DRV-104", 
      name: "Amit Sharma", 
      truck: "MH-04-5544",
      phone: "+919000011111",
      route: "Thane → Pune"
    },
    { 
      id: "DRV-999", 
      name: "Rohit Sharma", 
      truck: "GJ-01-LIVE",
      phone: "+916204773940",
      route: "Lavad → Gandhinagar"
    },
  ];

  // Default documents for each driver
  const defaultDocsByDriver = {
    'DRV-999': [
      { id: 'dl-999', name: 'Driving License', status: 'Verified', fileName: 'Rohit_DL.pdf' },
      { id: 'rc-999', name: 'RC Book', status: 'Verified', fileName: 'GJ-01-LIVE_RC.pdf' },
      { id: 'insurance-999', name: 'Insurance', status: 'Verified', fileName: 'GJ-01-LIVE_Insurance.pdf' },
    ],
    'DRV-101': [
      { id: 'dl-101', name: 'Driving License', status: 'Verified', fileName: 'Rudra_DL.pdf' },
      { id: 'rc-101', name: 'RC Book', status: 'Verified', fileName: 'VAC13143_RC.pdf' },
      { id: 'insurance-101', name: 'Insurance', status: 'Verified', fileName: 'VAC13143_Insurance.pdf' },
      { id: 'fitness-101', name: 'Fitness Certificate', status: 'Pending', fileName: 'VAC13143_Fitness.pdf' },
      { id: 'pollution-101', name: 'Pollution Certificate', status: 'Verified', fileName: 'VAC13143_Pollution.pdf' },
    ],
    'DRV-102': [
      { id: 'dl-102', name: 'Driving License', status: 'Verified', fileName: 'Shaurya_DL.pdf' },
      { id: 'rc-102', name: 'RC Book', status: 'Verified', fileName: 'MH-12-9988_RC.pdf' },
      { id: 'insurance-102', name: 'Insurance', status: 'Verified', fileName: 'MH-12-9988_Insurance.pdf' },
    ],
    'DRV-103': [
      { id: 'dl-103', name: 'Driving License', status: 'Verified', fileName: 'Vikram_DL.pdf' },
      { id: 'rc-103', name: 'RC Book', status: 'Expired', fileName: 'GJ-05-1122_RC.pdf' },
      { id: 'insurance-103', name: 'Insurance', status: 'Verified', fileName: 'GJ-05-1122_Insurance.pdf' },
    ],
    'DRV-104': [
      { id: 'dl-104', name: 'Driving License', status: 'Verified', fileName: 'Amit_DL.pdf' },
      { id: 'rc-104', name: 'RC Book', status: 'Verified', fileName: 'MH-04-5544_RC.pdf' },
      { id: 'insurance-104', name: 'Insurance', status: 'Pending', fileName: 'MH-04-5544_Insurance.pdf' },
      { id: 'aadhar-104', name: 'Aadhar Card', status: 'Verified', fileName: 'Amit_Aadhar.pdf' },
    ],
  };

  const [driversData, setDriversData] = useState(initialDriversData);
  const [expandedDriver, setExpandedDriver] = useState('DRV-101');
  const [documents, setDocuments] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('DRV-101');
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverTruck, setNewDriverTruck] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverRoute, setNewDriverRoute] = useState('');

  // Fetch all driver documents from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'driver_documents'), (snapshot) => {
      const docsMap = {};
      driversData.forEach(driver => {
        docsMap[driver.id] = [];
      });
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (docsMap[data.driverId]) {
          docsMap[data.driverId].push({
            id: doc.id,
            ...data,
          });
        }
      });
      
      setDocuments(docsMap);
    });

    return () => unsubscribe();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentName || !selectedDriverId) {
      setUploadStatus('Please fill all fields and select a file');
      return;
    }

    setUploading(true);
    try {
      const fileRef = ref(storage, `driver_documents/${selectedDriverId}/${Date.now()}_${selectedFile.name}`);
      await uploadBytes(fileRef, selectedFile);
      const downloadURL = await getDownloadURL(fileRef);

      // Save metadata to Firestore
      const newDoc = {
        driverId: selectedDriverId,
        name: documentName,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileURL: downloadURL,
        uploadedAt: new Date(),
        status: 'Uploaded',
      };

      const docRef = await collection(db, 'driver_documents').add(newDoc);
      setDocuments(prev => ({
        ...prev,
        [selectedDriverId]: [...(prev[selectedDriverId] || []), { id: docRef.id, ...newDoc }]
      }));

      setUploadStatus('Document uploaded successfully!');
      setTimeout(() => {
        setShowUploadModal(false);
        setDocumentName('');
        setSelectedFile(null);
        setUploadStatus('');
      }, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete ${doc.name}?`)) return;

    try {
      if (doc.fileURL) {
        const fileRef = ref(storage, doc.fileURL);
        await deleteObject(fileRef);
      }
      await deleteDoc(doc(db, 'driver_documents', doc.id));
      setDocuments(prev => ({
        ...prev,
        [selectedDriverId]: prev[selectedDriverId].filter(d => d.id !== doc.id)
      }));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes, k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate?.() || new Date(date);
    return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddDriver = () => {
    if (!newDriverName || !newDriverTruck || !newDriverPhone || !newDriverRoute) {
      alert('Please fill all fields');
      return;
    }

    const newDriverId = 'DRV-' + Date.now();
    const newDriver = {
      id: newDriverId,
      name: newDriverName,
      truck: newDriverTruck,
      phone: newDriverPhone,
      route: newDriverRoute,
    };

    setDriversData([...driversData, newDriver]);
    setExpandedDriver(newDriverId);
    setNewDriverName('');
    setNewDriverTruck('');
    setNewDriverPhone('');
    setNewDriverRoute('');
    setShowAddDriverModal(false);
    alert(`Driver ${newDriverName} added successfully!`);
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: '600' }}>
            <FileText size={32} />
            Driver Documents
          </h2>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>Manage documents for all drivers and trucks</p>
        </div>
        <button
          onClick={() => setShowAddDriverModal(true)}
          style={{
            background: '#2e7d32',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#1b5e20')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#2e7d32')}
        >
          <Plus size={18} />
          Add New Driver
        </button>
      </div>

      {/* Drivers List */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {driversData.map((driver) => {
          const driverDocs = documents[driver.id] || [];
          const defaultDocs = defaultDocsByDriver[driver.id] || [];
          const isExpanded = expandedDriver === driver.id;
          const allDocs = [...defaultDocs, ...driverDocs];

          return (
            <div key={driver.id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              {/* Driver Header */}
              <div
                onClick={() => setExpandedDriver(isExpanded ? null : driver.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 20px',
                  background: '#f9f9f9',
                  cursor: 'pointer',
                  borderBottom: isExpanded ? '1px solid #eee' : 'none',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#f9f9f9')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                  <div style={{ fontSize: '20px', color: '#2e7d32' }}>
                    {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {driver.name}
                      <span style={{ fontSize: '11px', fontWeight: '400', color: '#666', background: '#e8f5e9', padding: '2px 8px', borderRadius: '4px' }}>
                        {driver.id}
                      </span>
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                      🚚 {driver.truck} • 📱 {driver.phone} • 📍 {driver.route}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '12px' }}>
                  <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 12px', borderRadius: '12px', fontWeight: '600' }}>
                    {allDocs.length} docs
                  </span>
                </div>
              </div>

              {/* Documents List (Expandable) */}
              {isExpanded && (
                <div style={{ padding: '20px', display: 'grid', gap: '12px' }}>
                  {allDocs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '14px' }}>
                      No documents uploaded yet
                    </div>
                  ) : (
                    allDocs.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '15px',
                          background: '#f9f9f9',
                          borderRadius: '8px',
                          gap: '12px',
                          borderLeft: doc.status === 'Expired' ? '4px solid #d32f2f' : doc.status === 'Pending' ? '4px solid #f57c00' : '4px solid #4caf50',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <FileText size={18} color="#2e7d32" />
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{doc.name}</span>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                padding: '3px 8px',
                                borderRadius: '10px',
                                background: doc.status === 'Expired' ? '#ffebee' : doc.status === 'Pending' ? '#fff3cd' : doc.status === 'Verified' ? '#e8f5e9' : '#e3f2fd',
                                color: doc.status === 'Expired' ? '#c62828' : doc.status === 'Pending' ? '#f57c00' : doc.status === 'Verified' ? '#2e7d32' : '#1976d2',
                              }}
                            >
                              {doc.status}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                            {doc.fileName} {doc.fileSize && `• ${formatFileSize(doc.fileSize)}`} {doc.uploadedAt && `• ${formatDate(doc.uploadedAt)}`}
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          {doc.fileURL && (
                            <button
                              onClick={() => window.open(doc.fileURL, '_blank')}
                              style={{
                                background: '#e3f2fd',
                                color: '#1976d2',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                transition: 'background 0.2s',
                              }}
                              onMouseOver={(e) => (e.currentTarget.style.background = '#bbdefb')}
                              onMouseOut={(e) => (e.currentTarget.style.background = '#e3f2fd')}
                              title="View Document"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          )}
                          {!defaultDocsByDriver[driver.id]?.some(d => d.id === doc.id) && (
                            <button
                              onClick={() => handleDelete(doc)}
                              style={{
                                background: '#ffebee',
                                color: '#d32f2f',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                transition: 'background 0.2s',
                              }}
                              onMouseOver={(e) => (e.currentTarget.style.background = '#ffcdd2')}
                              onMouseOut={(e) => (e.currentTarget.style.background = '#ffebee')}
                              title="Delete Document"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Upload Button for this driver */}
                  <button
                    onClick={() => {
                      setSelectedDriverId(driver.id);
                      setShowUploadModal(true);
                    }}
                    style={{
                      background: '#e8f5e9',
                      color: '#2e7d32',
                      border: '2px dashed #2e7d32',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      marginTop: '10px',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#c8e6c9';
                      e.currentTarget.style.borderColor = '#1b5e20';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#e8f5e9';
                      e.currentTarget.style.borderColor = '#2e7d32';
                    }}
                  >
                    <Plus size={18} />
                    Add Document
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
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

            {/* Driver Info */}
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: '#f5f5f5',
              borderRadius: '8px',
              borderLeft: '4px solid #2e7d32',
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#666', fontWeight: '600' }}>UPLOADING FOR:</p>
              <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#333', fontWeight: '600' }}>
                {driversData.find(d => d.id === selectedDriverId)?.name}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                {driversData.find(d => d.id === selectedDriverId)?.truck} • {driversData.find(d => d.id === selectedDriverId)?.id}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                Document Name *
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g., Updated Driving License, New Insurance"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                }}
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
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              />
              {selectedFile && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  background: '#f5f5f5',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#666',
                }}>
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}
            </div>

            {uploadStatus && (
              <div style={{
                marginBottom: '20px',
                padding: '12px',
                background: uploadStatus.includes('success') ? '#e8f5e9' : uploadStatus.includes('failed') ? '#ffebee' : '#fff3cd',
                color: uploadStatus.includes('success') ? '#2e7d32' : uploadStatus.includes('failed') ? '#d32f2f' : '#f57c00',
                borderRadius: '8px',
                fontSize: '14px',
                textAlign: 'center',
                fontWeight: '600',
              }}>
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
                style={{
                  background: '#f5f5f5',
                  color: '#333',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  background: uploading ? '#ccc' : '#2e7d32',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddDriverModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#2e7d32', fontSize: '20px' }}>Add New Driver</h3>
              <button
                onClick={() => {
                  setShowAddDriverModal(false);
                  setNewDriverName('');
                  setNewDriverTruck('');
                  setNewDriverPhone('');
                  setNewDriverRoute('');
                }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
              >
                <X size={24} color="#666" />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                Driver Name *
              </label>
              <input
                type="text"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                placeholder="e.g., John Doe"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                Truck ID *
              </label>
              <input
                type="text"
                value={newDriverTruck}
                onChange={(e) => setNewDriverTruck(e.target.value)}
                placeholder="e.g., MH-15-AB1234"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                value={newDriverPhone}
                onChange={(e) => setNewDriverPhone(e.target.value)}
                placeholder="e.g., +919876543210"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                Route *
              </label>
              <input
                type="text"
                value={newDriverRoute}
                onChange={(e) => setNewDriverRoute(e.target.value)}
                placeholder="e.g., Mumbai → Bangalore"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddDriverModal(false);
                  setNewDriverName('');
                  setNewDriverTruck('');
                  setNewDriverPhone('');
                  setNewDriverRoute('');
                }}
                style={{
                  background: '#f5f5f5',
                  color: '#333',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddDriver}
                style={{
                  background: '#2e7d32',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#1b5e20')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#2e7d32')}
              >
                <Plus size={16} />
                Add Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransporterDocuments;
