const URL_PATTERN = /(https?:\/\/[^\s]+)/g;
const HTML_TAG_PATTERN = /<[a-zA-Z][\s\S]*?>/;

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

const bodyClass =
  "mt-8 border-t border-line pt-8 text-base leading-relaxed text-ink md:mt-10 md:pt-10 md:text-lg";

export function BlogPostBody({ body }: { body: string }) {
  if (HTML_TAG_PATTERN.test(body)) {
    return (
      <div
        className={`${bodyClass} blog-html-body`}
        // Admin-only content — trusted source.
        dangerouslySetInnerHTML={{ __html: body }}
      />
    );
  }

  const paragraphs = body.split("\n\n").filter(Boolean);

  return (
    <div className={`${bodyClass} space-y-5`}>
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 24)}`} className="whitespace-pre-line">
          {renderParagraphText(paragraph)}
        </p>
      ))}
    </div>
  );
}
