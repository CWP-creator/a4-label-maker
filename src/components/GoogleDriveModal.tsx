import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Search,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { GoogleDriveFile, LabelData, GridConfig } from '../types';
import { listDriveSheets, fetchSpreadsheet, extractSpreadsheetId, ParsedSheetResult } from '../services/googleDrive';
import { googleSignIn, logout, getAccessToken } from '../services/firebase';
import { User } from 'firebase/auth';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onImportSuccess: (result: ParsedSheetResult) => void;
  onUserChange: (user: User | null) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onImportSuccess,
  onUserChange,
}) => {
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('label');
  const [directSheetUrl, setDirectSheetUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadDriveFiles();
    }
  }, [isOpen, currentUser]);

  const loadDriveFiles = async (query = searchQuery) => {
    setErrorMsg(null);
    setLoadingFiles(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Please sign in with Google to browse Drive files.');
      }
      const driveFiles = await listDriveSheets(token, query);
      setFiles(driveFiles);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not list Google Drive spreadsheets';
      setErrorMsg(msg);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const result = await googleSignIn();
      if (result) {
        onUserChange(result.user);
        setStatusMsg('Successfully connected to Google Drive!');
        setTimeout(() => setStatusMsg(null), 3500);
        // Load files immediately with the fresh token
        const filesList = await listDriveSheets(result.accessToken, 'label');
        setFiles(filesList);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onUserChange(null);
      setFiles([]);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleSelectFile = async (fileId: string, fileName?: string) => {
    setErrorMsg(null);
    setIsProcessing(true);
    setStatusMsg(`Loading "${fileName || 'Spreadsheet'}" from Google Sheets...`);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Access token missing. Please sign in again.');
      }
      const result = await fetchSpreadsheet(token, fileId);
      onImportSuccess(result);
      setStatusMsg(`Loaded successfully! Applied settings from "${fileName || result.sheetName}".`);
      setTimeout(() => {
        setStatusMsg(null);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import spreadsheet';
      setErrorMsg(msg);
      setStatusMsg(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportDirectUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directSheetUrl.trim()) return;
    const fileId = extractSpreadsheetId(directSheetUrl);
    await handleSelectFile(fileId, 'Linked Google Sheet');
  };

  if (!isOpen) return null;

  return (
    <div
      id="google-drive-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
    >
      <div
        id="google-drive-modal"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-800">
              <FileSpreadsheet className="w-5 h-5 text-neutral-900" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-950">Google Drive & Sheets Integration</h2>
              <p className="text-xs text-neutral-500">
                Import label layouts directly from your Drive spreadsheets (like "label maker")
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-drive-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
          {/* Status and Error Banners */}
          {statusMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Notice: </span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Auth State Handling */}
          {!currentUser ? (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-neutral-50 rounded-xl border border-neutral-200/80 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-neutral-200 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-neutral-700" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Connect Google Account</h3>
              <p className="text-xs text-neutral-600 max-w-md leading-relaxed">
                Connect your Google Drive to load your "label maker" Google Sheet, extract product names, MRP prices, PAN numbers, and sheet row/column setups automatically with your permission.
              </p>

              {/* Official Google Sign-in button markup per Google Workspace Skill guidelines */}
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleSignIn}
                disabled={isProcessing}
                className="mt-2 inline-flex items-center gap-3 px-4 py-2.5 bg-white border border-neutral-300 rounded-lg shadow-xs hover:bg-neutral-50 active:bg-neutral-100 transition text-xs font-semibold text-neutral-700 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                {isProcessing ? 'Connecting to Google...' : 'Sign in with Google'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Connected User Header */}
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="flex items-center gap-2.5">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Google User"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-neutral-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neutral-800 text-white flex items-center justify-center text-xs font-bold">
                      {currentUser.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-neutral-900">
                      {currentUser.displayName || 'Google Workspace User'}
                    </div>
                    <div className="text-[11px] text-neutral-500">{currentUser.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="refresh-drive-btn"
                    onClick={() => loadDriveFiles()}
                    disabled={loadingFiles}
                    className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-lg transition"
                    title="Refresh spreadsheets"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    id="signout-drive-btn"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>

              {/* Direct Link Form */}
              <form onSubmit={handleImportDirectUrl} className="flex flex-col gap-1.5">
                <label htmlFor="direct-sheet-url-input" className="text-xs font-bold text-neutral-800">
                  Open by Google Sheet Link or ID
                </label>
                <div className="flex gap-2">
                  <input
                    id="direct-sheet-url-input"
                    type="text"
                    value={directSheetUrl}
                    onChange={(e) => setDirectSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="flex-1 text-xs border border-neutral-300 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    id="open-sheet-url-btn"
                    disabled={!directSheetUrl.trim() || isProcessing}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 disabled:opacity-40 transition shrink-0"
                  >
                    {isProcessing ? 'Loading...' : 'Load Sheet'}
                  </button>
                </div>
              </form>

              {/* Search Drive Files */}
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Spreadsheets in Google Drive
                  </span>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                    <input
                      id="search-drive-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        loadDriveFiles(e.target.value);
                      }}
                      placeholder="Filter files..."
                      className="w-full pl-8 pr-2.5 py-1 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* File List */}
                {loadingFiles ? (
                  <div className="py-8 flex flex-col items-center justify-center text-neutral-500 gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-neutral-700" />
                    <span className="text-xs">Searching your Google Drive spreadsheets...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="p-6 text-center bg-neutral-50 rounded-xl border border-neutral-200/70 text-xs text-neutral-600 flex flex-col items-center gap-2">
                    <FileSpreadsheet className="w-8 h-8 text-neutral-400" />
                    <p>No spreadsheets found matching "{searchQuery}".</p>
                    <p className="text-[11px] text-neutral-500">
                      Paste the link to your spreadsheet above or clear the filter.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 border border-neutral-200 rounded-xl">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        id={`drive-file-${file.id}`}
                        className="p-3 hover:bg-neutral-50 flex items-center justify-between gap-3 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-neutral-900 truncate">{file.name}</div>
                            {file.modifiedTime && (
                              <div className="text-[10px] text-neutral-400">
                                Modified {new Date(file.modifiedTime).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded transition"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            id={`import-file-btn-${file.id}`}
                            onClick={() => handleSelectFile(file.id, file.name)}
                            disabled={isProcessing}
                            className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
            <span>Parses Apps Script "LABEL SETUP FORM" and batch tables automatically.</span>
          </div>
          <button
            type="button"
            id="drive-modal-done-btn"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 rounded-lg font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
