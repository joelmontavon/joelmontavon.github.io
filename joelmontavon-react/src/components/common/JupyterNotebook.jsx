import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Highlight, themes } from "prism-react-renderer";
import { Code, FileText, AlertCircle, CheckCircle } from "lucide-react";

/**
 * Jupyter Notebook Renderer Component
 * Renders .ipynb files with support for:
 * - Markdown cells
 * - Code cells with syntax highlighting
 * - Output cells (text, HTML, errors)
 */
export function JupyterNotebook({ notebookUrl, title }) {
  const [notebook, setNotebook] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotebook() {
      try {
        setLoading(true);
        const response = await fetch(notebookUrl);
        if (!response.ok) throw new Error(`Failed to fetch notebook: ${response.status}`);
        const data = await response.json();
        setNotebook(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (notebookUrl) {
      fetchNotebook();
    }
  }, [notebookUrl]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading notebook...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8 text-center text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          Error loading notebook: {error}
        </CardContent>
      </Card>
    );
  }

  if (!notebook) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No notebook data
        </CardContent>
      </Card>
    );
  }

  const cells = notebook.cells || [];

  return (
    <div className="jupyter-notebook">
      {title && (
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <div className="space-y-4">
        {cells.map((cell, index) => (
          <NotebookCell key={index} cell={cell} index={index} />
        ))}
      </div>
    </div>
  );
}

function NotebookCell({ cell, index }) {
  const cellType = cell.cell_type;

  if (cellType === "markdown") {
    return <MarkdownCell source={cell.source} />;
  }

  if (cellType === "code") {
    return <CodeCell cell={cell} index={index} />;
  }

  return null;
}

function MarkdownCell({ source }) {
  // Join source array if needed
  const content = Array.isArray(source) ? source.join("") : source;

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none px-4 py-3 bg-muted/30 rounded-lg">
      <MarkdownContent content={content} />
    </div>
  );
}

function CodeCell({ cell, index }) {
  const source = Array.isArray(cell.source) ? cell.source.join("") : cell.source;
  const outputs = cell.outputs || [];
  const executionCount = cell.execution_count;

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Code Input */}
      <div className="bg-zinc-900">
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 text-xs text-zinc-400 border-b border-zinc-700">
          <Code className="h-3 w-3" />
          <span>In [{executionCount || " "}]:</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <Highlight
            theme={themes.vsDark}
            code={source || ""}
            language="python"
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre className={`${className} text-sm`} style={{ ...style, background: 'transparent' }}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      </div>

      {/* Outputs */}
      {outputs.length > 0 && (
        <div className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-700">
          {outputs.map((output, outputIndex) => (
            <OutputCell key={outputIndex} output={output} executionCount={executionCount} />
          ))}
        </div>
      )}
    </div>
  );
}

function OutputCell({ output, executionCount }) {
  const outputType = output.output_type;

  // Stream output (stdout, stderr)
  if (outputType === "stream") {
    const text = Array.isArray(output.text) ? output.text.join("") : output.text || "";
    const isError = output.name === "stderr";

    return (
      <div className={`px-4 py-2 font-mono text-sm whitespace-pre-wrap ${isError ? 'text-red-500 bg-red-50 dark:bg-red-950/20' : 'text-zinc-700 dark:text-zinc-300'}`}>
        {text}
      </div>
    );
  }

  // Execute result (return value)
  if (outputType === "execute_result") {
    const data = output.data || {};
    const html = data["text/html"];
    const text = data["text/plain"];

    return (
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
          <CheckCircle className="h-3 w-3" />
          <span>Out [{executionCount}]:</span>
        </div>
        {html ? (
          <div
            className="prose prose-sm max-w-none overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: renderHtmlSafe(html) }}
          />
        ) : (
          <pre className="font-mono text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
            {Array.isArray(text) ? text.join("") : text}
          </pre>
        )}
      </div>
    );
  }

  // Error output
  if (outputType === "error") {
    const traceback = output.traceback || [];
    const errorName = output.ename || "Error";
    const errorValue = output.evalue || "";

    return (
      <div className="px-4 py-3 bg-red-50 dark:bg-red-950/20 border-t border-red-200 dark:border-red-900">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold mb-2">
          <AlertCircle className="h-4 w-4" />
          {errorName}: {errorValue}
        </div>
        {traceback.length > 0 && (
          <pre className="font-mono text-xs text-red-700 dark:text-red-300 overflow-x-auto">
            {traceback.join("\n")}
          </pre>
        )}
      </div>
    );
  }

  // Display data (charts, images, etc.)
  if (outputType === "display_data") {
    const data = output.data || {};
    const html = data["text/html"];
    const text = data["text/plain"];
    const imageData = data["image/png"];

    if (imageData) {
      return (
        <div className="px-4 py-2">
          <img
            src={`data:image/png;base64,${imageData}`}
            alt="Output"
            className="max-w-full h-auto rounded"
          />
        </div>
      );
    }

    if (html) {
      return (
        <div
          className="px-4 py-2 prose prose-sm max-w-none overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: renderHtmlSafe(html) }}
        />
      );
    }

    if (text) {
      return (
        <pre className="px-4 py-2 font-mono text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
          {Array.isArray(text) ? text.join("") : text}
        </pre>
      );
    }
  }

  return null;
}

/**
 * Simple markdown content renderer
 * Handles basic markdown syntax
 */
function MarkdownContent({ content }) {
  // This is a simplified markdown renderer
  // For full markdown support, consider using react-markdown

  const lines = content.split('\n');

  return (
    <div className="markdown-content">
      {lines.map((line, index) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold mt-4 mb-2">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
        }

        // Code blocks (inline)
        const codeInline = line.match(/`([^`]+)`/g);
        if (codeInline) {
          let processedLine = line;
          codeInline.forEach(match => {
            const code = match.slice(1, -1);
            processedLine = processedLine.replace(match, `<code class="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-sm font-mono">${code}</code>`);
          });
          return <p key={index} dangerouslySetInnerHTML={{ __html: processedLine }} />;
        }

        // Bold
        const boldMatch = line.match(/\*\*([^*]+)\*\*/g);
        if (boldMatch) {
          let processedLine = line;
          boldMatch.forEach(match => {
            const text = match.slice(2, -2);
            processedLine = processedLine.replace(match, `<strong>${text}</strong>`);
          });
          return <p key={index} dangerouslySetInnerHTML={{ __html: processedLine }} />;
        }

        // List items
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={index} className="ml-4 list-disc">{line.slice(2)}</li>;
        }

        // Empty lines
        if (!line.trim()) {
          return <br key={index} />;
        }

        // Regular paragraph
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}

/**
 * Sanitize HTML for safe rendering
 */
function renderHtmlSafe(html) {
  // Basic sanitization - remove script tags and event handlers
  // For production, consider using DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
}

export default JupyterNotebook;
