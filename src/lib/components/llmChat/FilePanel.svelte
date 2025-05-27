<script lang="ts">
    import { getFileIcon, getFolderIcon } from "$lib/utils/icons";
    import type { FileListResponse } from "$lib/types/files";

    let { 
        showFilePanel,
        fileList,
        selectedFiles,
        filesLoading,
        onToggleFilePanel,
        onToggleFileSelection
    } = $props<{
        showFilePanel: boolean;
        fileList: FileListResponse[];
        selectedFiles: string[];
        filesLoading: boolean;
        onToggleFilePanel: () => void;
        onToggleFileSelection: (file: string) => void;
    }>();
</script>

<div
    class="fixed top-0 right-0 h-full bg-white border-l border-gray-200 z-20 transition-all duration-300 transform shadow-lg {showFilePanel
        ? 'translate-x-0 w-80'
        : 'translate-x-full w-0'} overflow-hidden"
    style="top: var(--header-height, 64px); height: calc(100vh - var(--header-height, 64px));"
>
    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="font-medium">
            Files ({selectedFiles.length} selected)
        </h2>
        <button
            onclick={onToggleFilePanel}
            class="text-gray-500 hover:text-gray-700"
            aria-label="Close files panel"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    </div>

    <div class="p-4">
        {#if filesLoading}
            <div class="py-6 text-center text-gray-500">
                <svg class="animate-spin h-6 w-6 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Loading files...</p>
            </div>
        {:else}
            <div class="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {#if fileList.length > 0}
                    <div class="text-sm font-medium mb-2 text-gray-500">Files ({fileList.length})</div>
                    {#each fileList as file}
                        <div class="flex p-3 bg-gray-50 rounded-lg border {selectedFiles.includes(file.file_id)
                                ? 'border-blue-200 bg-blue-50'
                                : 'border-gray-200'}">
                            <input
                                type="checkbox"
                                id={`sidebar-file-${file.file_id}`}
                                checked={selectedFiles.includes(file.file_id)}
                                onchange={() => onToggleFileSelection(file.file_id)}
                                class="mr-3 h-4 w-4 mt-1"
                            />
                            <div class="flex-grow overflow-hidden">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-gray-500">
                                        {@html getFileIcon()}
                                    </span>
                                    <span class="font-medium text-sm truncate" title={file.filename}>{file.filename}</span>
                                </div>
                                <div class="text-xs text-gray-400 truncate" title={file.path}>
                                    {file.path}
                                </div>
                            </div>
                        </div>
                    {/each}
                {:else}
                    <div class="py-6 text-center text-gray-500">
                        <p>No files found</p>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>