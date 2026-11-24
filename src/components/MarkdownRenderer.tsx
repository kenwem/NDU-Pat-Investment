import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-stone lg:prose-xl max-w-none prose-a:text-lime-600 prose-img:rounded-3xl prose-img:shadow-lg prose-blockquote:border-l-4 prose-blockquote:border-lime-500">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ''}</ReactMarkdown>
    </div>
  );
}
