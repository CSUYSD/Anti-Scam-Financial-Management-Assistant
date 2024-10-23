import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkdownRenderer = ({ content }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-5 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-medium mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                        <SyntaxHighlighter
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code className="bg-muted px-1 py-0.5 rounded" {...props}>
                            {children}
                        </code>
                    );
                }
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownRenderer;