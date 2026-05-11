const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

function renderParagraphText(text: string) {
  const parts = text.split(URL_PATTERN);

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noreferrer noopener"
        className="text-ink underline decoration-line underline-offset-4 hover:text-ink-soft"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

export function BlogPostBody({ body }: { body: string }) {
  const paragraphs = body.split("\n\n").filter(Boolean);

  return (
    <div className="mt-8 space-y-5 border-t border-line pt-8 text-base leading-relaxed text-ink md:mt-10 md:pt-10 md:text-lg">
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 24)}`} className="whitespace-pre-line">
          {renderParagraphText(paragraph)}
        </p>
      ))}
    </div>
  );
}
