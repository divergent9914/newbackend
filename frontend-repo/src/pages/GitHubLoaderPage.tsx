import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Github, Search, Folder, FolderOpen, File, ChevronLeft, 
  ExternalLink, AlertTriangle, Loader2, Code
} from 'lucide-react';

interface RepoFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
}

interface RepoFetchResponse {
  files: RepoFile[];
  currentPath: string;
  parentPath: string | null;
}

const GitHubLoaderPage = () => {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState('');
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<RepoFile | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const fetchRepoMutation = useMutation({
    mutationFn: async (data: { owner: string; repo: string; branch: string; path?: string }) => {
      const response = await fetch('/api/github/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch repository data');
      }
      
      return response.json();
    },
    onSuccess: (data: RepoFetchResponse) => {
      setFiles(data.files);
      setCurrentPath(data.currentPath);
      setParentPath(data.parentPath);
      setError(null);
      setSelectedFile(null);
      setFileContent(null);
    },
    onError: (err: Error) => {
      setError(err.message);
      setFiles([]);
      setSelectedFile(null);
      setFileContent(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner || !repo) {
      setError('Repository owner and name are required');
      return;
    }
    
    fetchRepoMutation.mutate({ owner, repo, branch });
  };

  const navigateToPath = (path: string) => {
    fetchRepoMutation.mutate({ owner, repo, branch, path });
  };

  const navigateUp = () => {
    if (parentPath !== null) {
      navigateToPath(parentPath);
    }
  };

  const selectFile = async (file: RepoFile) => {
    if (file.type === 'dir') {
      navigateToPath(file.path);
      return;
    }
    
    setSelectedFile(file);
    setIsLoadingFile(true);
    
    try {
      const response = await fetch('/api/github/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          repo,
          branch,
          path: file.path,
          getContent: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }
      
      const data = await response.json();
      setFileContent(data.content);
    } catch (err) {
      setError('Failed to load file content');
      setFileContent(null);
    } finally {
      setIsLoadingFile(false);
    }
  };

  return (
    <div className="github-loader-container">
      <h1 className="dashboard-title">GitHub Loader</h1>
      <p className="section-description">
        Load and explore repositories from GitHub to integrate with your API Gateway.
      </p>
      
      {error && (
        <div className="error-message">
          <AlertTriangle size={20} className="text-red-500" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="github-form-container">
        <h2 className="text-xl font-semibold mb-4">Repository Information</h2>
        <form onSubmit={handleSubmit} className="github-form">
          <div className="form-group">
            <label htmlFor="owner">Repository Owner</label>
            <input
              type="text"
              id="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g., facebook"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="repo">Repository Name</label>
            <input
              type="text"
              id="repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="e.g., react"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="branch">Branch</label>
            <input
              type="text"
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g., main"
              required
            />
          </div>
          <button
            type="submit"
            className="github-submit-btn"
            disabled={fetchRepoMutation.isPending}
          >
            {fetchRepoMutation.isPending ? (
              <>
                <Loader2 size={20} className="spin-icon" />
                Loading Repository...
              </>
            ) : (
              <>
                <Github size={20} />
                Load Repository
              </>
            )}
          </button>
        </form>
      </div>
      
      {files.length > 0 && (
        <div className="github-explorer">
          <h2 className="text-xl font-semibold mb-4">Repository Explorer</h2>
          
          <div className="path-navigator">
            <button
              onClick={navigateUp}
              disabled={parentPath === null}
              className="nav-button"
            >
              <ChevronLeft size={16} />
              Up
            </button>
            <div className="current-path">
              <Folder size={16} className="text-yellow-500" />
              <span>{currentPath || '/'}</span>
            </div>
            <a
              href={`https://github.com/${owner}/${repo}/tree/${branch}/${currentPath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-button"
            >
              <ExternalLink size={16} />
              View on GitHub
            </a>
          </div>
          
          <div className="explorer-container">
            <div className="file-list">
              {files.map((file) => (
                <div
                  key={file.path}
                  className={`file-item ${selectedFile?.path === file.path ? 'bg-gray-800' : ''}`}
                  onClick={() => selectFile(file)}
                >
                  {file.type === 'dir' ? (
                    <FolderOpen size={18} className="file-icon folder" />
                  ) : (
                    <File size={18} className="file-icon file" />
                  )}
                  <span className="file-name">{file.name}</span>
                </div>
              ))}
            </div>
            
            <div className="file-preview">
              {selectedFile ? (
                <>
                  <h3 className="file-preview-title">
                    <File size={18} className="text-blue-500" />
                    {selectedFile.name}
                  </h3>
                  
                  {isLoadingFile ? (
                    <div className="loading-file">
                      <Loader2 size={20} className="spin-icon mr-2" />
                      Loading file content...
                    </div>
                  ) : fileContent ? (
                    <pre className="file-content">{fileContent}</pre>
                  ) : (
                    <div className="empty-file">
                      <Code size={20} className="mr-2" />
                      No preview available
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-file">
                  <Search size={20} className="mr-2" />
                  Select a file to preview its contents
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubLoaderPage;