import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, GitBranch, Code, File, FolderOpen, ExternalLink, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Repository {
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  language: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface FileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: string;
  content?: string;
  html_url: string;
}

const GitHubLoader: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [path, setPath] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<{name: string, path: string}[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const parseGitHubUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname !== 'github.com') {
        throw new Error('Not a GitHub URL');
      }
      
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length < 2) {
        throw new Error('Invalid repository path');
      }
      
      return {
        owner: parts[0],
        repo: parts[1],
      };
    } catch (error) {
      toast({
        title: 'Invalid GitHub URL',
        description: 'Please enter a valid GitHub repository URL',
        variant: 'destructive'
      });
      return null;
    }
  };

  const handleSearch = () => {
    const parsed = parseGitHubUrl(repoUrl);
    if (parsed) {
      setOwner(parsed.owner);
      setRepo(parsed.repo);
      setPath('');
      setBreadcrumbs([{ name: parsed.repo, path: '' }]);
    }
  };

  const handlePathClick = (item: FileContent) => {
    if (item.type === 'dir') {
      setPath(item.path);
      
      // Update breadcrumbs
      const parts = item.path.split('/');
      const newBreadcrumbs = [{ name: repo, path: '' }];
      
      let currentPath = '';
      for (let i = 0; i < parts.length; i++) {
        currentPath += (currentPath ? '/' : '') + parts[i];
        newBreadcrumbs.push({
          name: parts[i],
          path: currentPath
        });
      }
      
      setBreadcrumbs(newBreadcrumbs);
    } else {
      // Get file content
      window.open(item.html_url, '_blank');
    }
  };

  const handleBreadcrumbClick = (breadcrumb: {name: string, path: string}) => {
    setPath(breadcrumb.path);
    
    // Update breadcrumbs
    const index = breadcrumbs.findIndex(b => b.path === breadcrumb.path);
    if (index >= 0) {
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
  };

  // Fetch repository info
  const { data: repository, isLoading: repoLoading, error: repoError } = useQuery({
    queryKey: ['github', 'repo', owner, repo],
    enabled: !!owner && !!repo,
    queryFn: async () => {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!response.ok) {
        throw new Error('Repository not found');
      }
      return response.json() as Promise<Repository>;
    }
  });

  // Fetch repository contents
  const { data: contents, isLoading: contentsLoading, error: contentsError } = useQuery({
    queryKey: ['github', 'contents', owner, repo, path],
    enabled: !!owner && !!repo,
    queryFn: async () => {
      const url = path 
        ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
        : `https://api.github.com/repos/${owner}/${repo}/contents`;
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch repository contents');
      }
      return response.json() as Promise<FileContent[]>;
    }
  });

  // Import repository to current project mutation
  const importMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/integrations/github/import', 
        JSON.stringify({
          owner,
          repo,
          path: path || '/'
        })
      );
    },
    onSuccess: () => {
      toast({
        title: 'Repository imported',
        description: 'The selected repository has been imported successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['api'] });
    },
    onError: (error) => {
      toast({
        title: 'Import failed',
        description: error.message || 'Failed to import repository',
        variant: 'destructive'
      });
    }
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">GitHub Repository Loader</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="repo-url" className="mb-2 block">Repository URL</Label>
              <div className="flex gap-2">
                <Input
                  id="repo-url"
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </div>
          </div>

          {repoLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {repoError && (
            <div className="flex items-center justify-center p-8 text-status-error">
              <AlertCircle className="h-6 w-6 mr-2" />
              <p>Repository not found or inaccessible</p>
            </div>
          )}

          {repository && (
            <Tabs defaultValue="files" className="mt-4">
              <TabsList>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="info">Repository Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="files" className="mt-4">
                <div className="mb-3 flex items-center gap-2 text-sm text-neutral-medium">
                  <FolderOpen className="h-4 w-4" />
                  {breadcrumbs.map((breadcrumb, index) => (
                    <React.Fragment key={breadcrumb.path}>
                      {index > 0 && <span>/</span>}
                      <button
                        className="hover:text-primary hover:underline"
                        onClick={() => handleBreadcrumbClick(breadcrumb)}
                      >
                        {breadcrumb.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {contentsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : contentsError ? (
                  <div className="flex items-center justify-center p-8 text-status-error">
                    <AlertCircle className="h-6 w-6 mr-2" />
                    <p>Failed to load repository contents</p>
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-neutral-lightest border-b py-2 px-4 flex justify-between items-center">
                      <div className="text-sm font-medium">Name</div>
                      <Button
                        size="sm"
                        disabled={importMutation.isPending}
                        onClick={() => importMutation.mutate()}
                      >
                        {importMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Import to Project
                      </Button>
                    </div>
                    <div className="divide-y">
                      {contents?.map((item) => (
                        <div
                          key={item.sha}
                          className="py-2 px-4 hover:bg-neutral-lightest cursor-pointer flex items-center"
                          onClick={() => handlePathClick(item)}
                        >
                          {item.type === 'dir' ? (
                            <FolderOpen className="h-5 w-5 mr-2 text-primary" />
                          ) : (
                            <File className="h-5 w-5 mr-2 text-neutral-medium" />
                          )}
                          <span className="text-sm">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="info" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    {repository.owner && (
                      <img 
                        src={repository.owner.avatar_url}
                        alt={repository.owner.login}
                        className="h-12 w-12 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">
                        {repository.name}
                      </h3>
                      <p className="text-sm text-neutral-medium">
                        {repository.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <GitBranch className="h-3.5 w-3.5" />
                      {repository.default_branch}
                    </Badge>
                    {repository.language && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Code className="h-3.5 w-3.5" />
                        {repository.language}
                      </Badge>
                    )}
                    <Badge variant="outline">★ {repository.stargazers_count}</Badge>
                    <Badge variant="outline">🍴 {repository.forks_count}</Badge>
                    <Badge variant="outline">Issues: {repository.open_issues_count}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-medium">Created: </span>
                      {new Date(repository.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-neutral-medium">Last updated: </span>
                      {new Date(repository.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  <Button variant="outline" className="flex items-center gap-1" asChild>
                    <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      View on GitHub
                    </a>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GitHubLoader;