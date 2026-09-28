import React from 'react';
import { PluginSettings } from '../types/sigma';
import MermaidDiagram from '../components/MermaidDiagram';

// Shared between the normal preview pane and the edit-mode preview pane so both stay in sync.
export const createMarkdownComponents = (settings: PluginSettings): Record<string, React.ComponentType<any>> => ({
  ...['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li'].reduce((acc, tag) => {
    acc[tag] = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) =>
      React.createElement(tag, {
        ...props,
        style: {
          color: settings.textColor,
          textAlign: settings.blockAlignment
        }
      }, children);
    return acc;
  }, {} as Record<string, React.ComponentType<any>>),
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      {...props}
      style={{
        color: settings.textColor,
        borderLeftColor: settings.textColor,
        textAlign: settings.blockAlignment
      }}
    >
      {children}
    </blockquote>
  ),
  pre: ({ children, ...props }: any) => {
    const child = React.Children.only(children) as React.ReactElement<{ className?: string }>;
    if (/language-mermaid/.test(child?.props?.className || '')) {
      // Mermaid diagrams render their own container; skip the default <pre> wrapper.
      return <>{children}</>;
    }
    return <pre {...props}>{children}</pre>;
  },
  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    if (match?.[1] === 'mermaid') {
      return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
    }
    return <code className={className} {...props}>{children}</code>;
  },
});
