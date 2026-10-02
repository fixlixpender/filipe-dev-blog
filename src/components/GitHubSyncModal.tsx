import React, { useState } from 'react';
import { 
  X, 
  GitBranch, 
  Globe, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Layers, 
  Cpu, 
  CheckCircle2 
} from 'lucide-react';
import { Post } from '../types';
import { generateRepositoryFiles, downloadFile } from '../utils/exportGit';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  onOpenDashboard: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  posts,
  onOpenDashboard,
}) => {
  const [copiedClone, setCopiedClone] = useState(false);
  const [copiedAction, setCopiedAction] = useState(false);

  if (!isOpen) return null;

  const repoFiles = generateRepositoryFiles(posts);
  const workflowFile = repoFiles.find((f) => f.path.includes('deploy.yml'));

  const cloneCommand = 'git clone https://github.com/filipe/filipe-dev-blog.git && cd filipe-dev-blog && npm install';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                GitHub Repository & Vercel Deployment
              </h3>
              <p className="text-xs text-zinc-500 font-mono">
                Static Site Generator (Next.js SSG) Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-600 dark:text-zinc-300">
          
          {/* Key Architectural Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
              <Layers className="w-4 h-4 text-emerald-500 mb-1.5" />
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Next.js SSG</h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Pre-renders all static pages at build time. Zero runtime database lag.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
              <Globe className="w-4 h-4 text-blue-500 mb-1.5" />
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Vercel Global Edge</h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Distributed content delivery via Anycast network for 15ms global TTFB.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
              <CheckCircle2 className="w-4 h-4 text-purple-500 mb-1.5" />
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Anonymous Readers</h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Zero sign-in barrier. Content is public, lightning fast, and privacy-first.
              </p>
            </div>
          </div>

          {/* Quick Clone */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                1. Clone Repository & Setup
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(cloneCommand);
                  setCopiedClone(true);
                  setTimeout(() => setCopiedClone(false), 2000);
                }}
                className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {copiedClone ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedClone ? 'Copied!' : 'Copy Shell Command'}</span>
              </button>
            </div>
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto">
              <code>{cloneCommand}</code>
            </div>
          </div>

          {/* GitHub Actions CI/CD Workflow */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                2. Automated Deployment Workflow (.github/workflows/deploy.yml)
              </span>
              <button
                onClick={() => {
                  if (workflowFile) {
                    navigator.clipboard.writeText(workflowFile.content);
                    setCopiedAction(true);
                    setTimeout(() => setCopiedAction(false), 2000);
                  }
                }}
                className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {copiedAction ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAction ? 'Copied YAML!' : 'Copy Workflow YAML'}</span>
              </button>
            </div>
            <pre className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-[10px] text-zinc-300 max-h-36 overflow-y-auto leading-relaxed">
              <code>{workflowFile?.content}</code>
            </pre>
          </div>

          {/* Download & Author Dashboard Trigger */}
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                Need to publish or export more articles?
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Use the Author Custom Dashboard to draft, preview, and generate git-ready markdown files.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  const bundle = JSON.stringify(repoFiles, null, 2);
                  downloadFile('filipe-dev-blog-repo-bundle.json', bundle, 'application/json');
                }}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Git Bundle</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenDashboard();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Open Author Studio</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Continuous Integration: GitHub Actions → Vercel Production</span>
          <span className="text-emerald-500 font-semibold">Ready for main</span>
        </div>
      </div>
    </div>
  );
};
