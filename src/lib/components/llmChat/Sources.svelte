<script lang="ts">
    import type { SourceResult } from "$lib/services/chat";
    import { openFile } from "$lib/services/files";

    let { sources } = $props<{
        sources: SourceResult[];
    }>();

    // Group sources by fileId and aggregate pages
    const groupedSources = $derived(() => {
        if (!sources || sources.length === 0) {
            return [];
        }

        const grouped = new Map<
            string,
            {
                title: string;
                pages: Set<string>;
                fileId: string;
            }
        >();

        sources.forEach((source: SourceResult) => {
            if (!grouped.has(source.fileId)) {
                grouped.set(source.fileId, {
                    title: source.title,
                    pages: new Set(),
                    fileId: source.fileId,
                });
            }

            // Add pages to the set (split by comma if multiple pages)
            const pagesList = source.pages.split(",").map((p) => p.trim());
            pagesList.forEach((page) => {
                if (page) {
                    grouped.get(source.fileId)?.pages.add(page);
                }
            });
        });

        return Array.from(grouped.values()).map((group) => ({
            ...group,
            pages: Array.from(group.pages).sort((a, b) => {
                // Sort pages numerically if they're numbers
                const aNum = parseInt(a);
                const bNum = parseInt(b);
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return aNum - bNum;
                }
                return a.localeCompare(b);
            }),
        }));
    });

    // Clean up title by removing the fileId suffix
    function cleanTitle(title: string): string {
        // Remove the UUID pattern at the end if present
        return title
            .replace(
                /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.pdf$/,
                "",
            )
            .trim();
    }

    // Handle file click
    async function handleFileClick(fileId: string, event: MouseEvent) {
        event.preventDefault();
        try {
            await openFile(fileId);
        } catch (error) {
            console.error("Error opening file:", error);
            // Optionally show user-friendly error message
        }
    }
</script>

<div class="mt-3">
    <div class="flex items-center space-x-2 mb-3">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-gray-400"
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            ></path>
            <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <span class="text-xs font-medium text-gray-500">Sources</span>
    </div>

    <div class="space-y-2">
        {#each groupedSources() as source}
            <div class="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                        <div class="text-xs font-medium text-gray-800">
                            <button
                                class="text-left truncate hover:text-blue-600 hover:underline transition-colors duration-200 focus:outline-none focus:text-blue-600 focus:underline"
                                onclick={(e) =>
                                    handleFileClick(source.fileId, e)}
                                title="Click to open PDF in new tab"
                            >
                                {cleanTitle(source.title)}
                            </button>
                        </div>
                        <div class="flex items-center mt-1 space-x-1">
                            <span class="text-xs text-gray-500">Pages:</span>
                            <div class="flex flex-wrap gap-1">
                                {#each source.pages as page}
                                    <span
                                        class="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-white border border-gray-200 text-gray-600"
                                    >
                                        {page}
                                    </span>
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>
