import React, { useState, useRef } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { useNavigate } from 'react-router-dom';
import './resumeUpload.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, mirrors backend

const ResumeUpload = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | confirming | success | error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setError('');
  };

  const validate = (f) => {
    if (!f) return 'No file selected.';
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      return 'Only PDF files are allowed.';
    }
    if (f.size <= 0) return 'File is empty.';
    if (f.size > MAX_FILE_SIZE) return 'File size exceeds the 5MB limit.';
    return '';
  };

  const handleFile = (f) => {
    const validationError = validate(f);
    if (validationError) {
      setError(validationError);
      setFile(null);
      setStatus('error');
      return;
    }
    setError('');
    setFile(f);
    setStatus('idle');
    setProgress(0);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onInputChange = (e) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };
  const openPicker = () => inputRef.current && inputRef.current.click();

  const handleUpload = async () => {
    if (!file) return;
    const validationError = validate(file);
    if (validationError) { setError(validationError); setStatus('error'); return; }

    setError('');
    setStatus('uploading');
    setProgress(0);

    try {
      // Step 1: request a presigned upload URL
      const { data } = await axios.post(`${API_URL}/api/resumes/upload`, {
        fileName: file.name,
        fileSize: file.size,
      }, { withCredentials: true });

      const { resumeId, uploadUrl } = data;
      if (!resumeId || !uploadUrl) throw new Error('Invalid upload response from server.');

      // Step 2: PUT the file directly to S3 (do NOT send the auth cookie to S3)
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': 'application/pdf' },
        withCredentials: false,
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      });

      // Step 3: confirm the upload so the server marks it UPLOADED
      setStatus('confirming');
      await axios.post(`${API_URL}/api/resumes/confirm-upload/${resumeId}`, {}, { withCredentials: true });

      setProgress(100);
      setStatus('success');
    } catch (err) {
      console.error('Resume upload error', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Upload failed. Please try again.');
      setStatus('error');
    }
  };

  const isBusy = status === 'uploading' || status === 'confirming';

  return (
    <div className="resume-page">
      <header className="resume-header">
        <button className="resume-back" onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <h1>Upload Resume</h1>
      </header>

      <div className="resume-card">
        <p className="resume-subtitle">Upload your resume as a PDF (max 5MB).</p>

        <div
          className={`dropzone ${isDragging ? 'dragging' : ''} ${isBusy ? 'disabled' : ''}`}
          onClick={isBusy ? undefined : openPicker}
          onDrop={isBusy ? (e) => e.preventDefault() : onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          role="button"
          tabIndex={0}
        >
          <input ref={inputRef} type="file" accept="application/pdf,.pdf" onChange={onInputChange} hidden />
          <div className="dropzone-icon">📄</div>
          {file ? (
            <>
              <p className="dropzone-file">{file.name}</p>
              <p className="dropzone-hint">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </>
          ) : (
            <>
              <p className="dropzone-title">Drag &amp; drop your PDF here</p>
              <p className="dropzone-hint">or click to browse</p>
            </>
          )}
        </div>

        {isBusy && (
          <div className="progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${status === 'confirming' ? 100 : progress}%` }} />
            </div>
            <span className="progress-label">
              {status === 'confirming' ? 'Finalizing…' : `Uploading… ${progress}%`}
            </span>
          </div>
        )}

        {status === 'success' && <div className="resume-success">✓ Resume uploaded successfully.</div>}
        {error && <div className="resume-error">{error}</div>}

        <div className="resume-actions">
          <button className="btn btn-primary" onClick={handleUpload} disabled={!file || isBusy}>
            {status === 'uploading' ? 'Uploading…' : status === 'confirming' ? 'Finalizing…' : 'Upload'}
          </button>
          {file && !isBusy && (
            <button className="btn btn-secondary" onClick={reset}>Clear</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
