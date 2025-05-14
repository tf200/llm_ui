export function renderMessageContent(content: string): string {
    if (!content) return "";

    // Process code blocks first to avoid formatting conflicts inside code
    let processedContent = content.replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        (match, language, code) => {
            const lang = language ? ` class="language-${language}"` : "";
            return `<pre class="bg-gray-100 p-3 rounded my-2 overflow-x-auto"><code${lang}>${escapeHtml(code)}</code></pre>`;
        },
    );

    // Process inline code (must come after block code)
    processedContent = processedContent.replace(
        /`([^`]+)`/g,
        '<code class="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">$1</code>',
    );

    // Bold text
    processedContent = processedContent.replace(
        /\*\*([^*]+)\*\*/g,
        "<strong>$1</strong>",
    );
    processedContent = processedContent.replace(
        /__([^_]+)__/g,
        "<strong>$1</strong>",
    );

    // Italic text
    processedContent = processedContent.replace(
        /\*([^*]+)\*/g,
        "<em>$1</em>",
    );
    processedContent = processedContent.replace(
        /_([^_]+)_/g,
        "<em>$1</em>",
    );

    // Improved Links handling - Process links BEFORE headers and lists to avoid conflicts
    processedContent = processedContent.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        (match, text, url) => {
            // Make sure the URL is properly formatted
            let formattedUrl = url;
            if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/') && !url.startsWith('#')) {
                formattedUrl = 'https://' + url;
            }

            // Add target="_blank" for external links and rel="noopener noreferrer" for security
            const isExternal = formattedUrl.startsWith('http');
            const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';

            return `<a href="${formattedUrl}" class="text-blue-600 hover:underline"${targetAttr}>${text}</a>`;
        }
    );

    // Also handle plain URLs (auto-linking)
    const urlRegex = /(^|[^"'])(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gm;
    processedContent = processedContent.replace(
        urlRegex,
        '$1<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$2</a>'
    );

    // Headers (h1-h3)
    processedContent = processedContent.replace(
        /^#### (.+)$/gm,
        '<h4 class="text-base font-semibold mt-3 mb-1">$1</h4>',
    );
    processedContent = processedContent.replace(
        /^### (.+)$/gm,
        '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>',
    );
    processedContent = processedContent.replace(
        /^## (.+)$/gm,
        '<h2 class="text-xl font-bold mt-5 mb-2">$1</h2>',
    );
    processedContent = processedContent.replace(
        /^# (.+)$/gm,
        '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>',
    );


    // Process lists
    const processList = (
        content: string,
        marker: string,
        listType: string,
    ): string => {
        const regex = new RegExp(`^${marker} (.+)$`, "gm");
        const listClass = listType === "ul" ? "list-disc" : "list-decimal";

        let result = content;
        let match;
        let listItems: string[] = [];
        let lastIndex = 0;
        let inList = false;

        // Find all list items
        const lines = content.split("\n");
        let processed = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.match(regex)) {
                // This is a list item
                const itemContent = line.replace(regex, "$1");

                if (!inList) {
                    // Start new list
                    inList = true;
                    processed.push(
                        `<${listType} class="${listClass} my-2 pl-4">`,
                    );
                }

                processed.push(`<li>${itemContent}</li>`);
            } else {
                // Not a list item
                if (inList) {
                    // Close the list
                    processed.push(`</${listType}>`);
                    inList = false;
                }

                processed.push(line);
            }
        }

        // Close any open list
        if (inList) {
            processed.push(`</${listType}>`);
        }

        return processed.join("\n");
    };

    // Process unordered lists
    processedContent = processList(processedContent, "-", "ul");

    // Process ordered lists
    processedContent = processList(processedContent, "\\d+\\.", "ol");

    // Blockquotes
    processedContent = processedContent.replace(
        /^> (.+)$/gm,
        '<blockquote class="border-l-4 border-gray-300 pl-4 py-1 my-2 text-gray-700">$1</blockquote>',
    );

    // Horizontal rules
    processedContent = processedContent.replace(
        /^---$/gm,
        '<hr class="my-4 border-t border-gray-300">',
    );

    // Handle paragraphs properly
    let blocks = processedContent.split(/\n\n+/);
    processedContent = blocks
        .map((block) => {
            // Skip if block is empty or already has HTML tags
            if (
                block.trim() === "" ||
                (block.trim().startsWith("<") &&
                    block.includes("</") &&
                    !block.startsWith("<code") &&
                    !block.startsWith("<em") &&
                    !block.startsWith("<strong"))
            ) {
                return block;
            }

            // Preserve single line breaks by converting to <br> tags
            const formattedBlock = block.replace(/\n/g, "<br>\n");
            return `<p class="my-2">${formattedBlock}</p>`;
        })
        .join("\n");

    return processedContent;
}

// Helper function to escape HTML special characters in code blocks
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}