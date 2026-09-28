import React, { useEffect, useId, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
}

// Lazy-loaded so the ~500KB mermaid bundle is only fetched when a diagram is actually used.
let mermaidModulePromise: Promise<typeof import('mermaid')> | null = null;
const loadMermaid = () => {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import('mermaid').then((mod) => {
      // 'strict' matches ReactMarkdown's default of not rendering raw HTML from source content.
      mod.default.initialize({ startOnLoad: false, securityLevel: 'strict' });
      return mod;
    });
  }
  return mermaidModulePromise;
};

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const reactId = useId();
  const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    // Debounced so live typing in edit mode doesn't re-render the diagram on every keystroke.
    const timer = setTimeout(async () => {
      try {
        const mermaid = (await loadMermaid()).default;
        const { svg: renderedSvg } = await mermaid.render(diagramId, chart);
        if (!cancelled) {
          setSvg(renderedSvg);
        }
      } catch (err) {
        if (!cancelled) {
          setSvg(null);
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [chart, diagramId]);

  if (error) {
    return (
      <div className="mermaid-error" role="alert">
        <p>Mermaid diagram error: {error}</p>
        <pre>{chart}</pre>
      </div>
    );
  }

  if (!svg) {
    return <div className="mermaid-loading">Rendering diagram…</div>;
  }

  return <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default MermaidDiagram;
