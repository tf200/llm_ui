<script lang="ts">
    import { onMount } from "svelte";
    import { getFileIcon, getFolderIcon } from "$lib/utils/icons";
    import type { FileListResponse } from "$lib/types/files";

    let { 
        fileList,
        selectedFiles,
        filesLoading,
        input,
        isLoading,
        inputValue = $bindable(),
        onSubmit,
        onToggleFileSelection
    } = $props<{
        fileList: FileListResponse[];
        selectedFiles: string[];
        filesLoading: boolean;
        input: string;
        isLoading: boolean;
        inputValue: string;
        onSubmit: (input: string) => void;
        onToggleFileSelection: (file: string) => void;
    }>();

    let inputElement = $state<HTMLInputElement | null>(null);

    onMount(() => {
        if (inputElement) {
            inputElement.focus();
        }
    });

    function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        if (inputValue.trim() === "" || isLoading) return;
        
        const userInput = inputValue;
        inputValue = "";
        onSubmit(userInput);
    }
</script>

<div class="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
    <div class="w-full max-w-xl space-y-8">
        <h1 class="text-2xl font-semibold text-black text-center">
            Chat about your files
        </h1>

        <!-- Files section -->
        <div class="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div class="flex items-center justify-between mb-3">
                <h2 class="font-medium">File Explorer</h2>
                <div class="text-sm text-gray-500">
                    {fileList.length} files available
                </div>
            </div>

            {#if filesLoading}
                <div class="py-6 text-center text-gray-500">
                    <svg class="animate-spin h-6 w-6 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p>Loading files...</p>
                </div>
            {:else if fileList.length > 0}
                <div class="space-y-2 max-h-48 overflow-y-auto">
                    <div class="text-sm font-medium mb-2 text-gray-500">Files</div>
                    {#each fileList as file}
                        <div class="flex items-center justify-between py-2 px-3 bg-white rounded border border-gray-200">
                            <div class="flex items-center flex-grow overflow-hidden">
                                <input
                                    type="checkbox"
                                    id={`file-${file.file_id}`}
                                    checked={selectedFiles.includes(file.file_id)}
                                    onchange={() => onToggleFileSelection(file.file_id)}
                                    class="mr-3 h-4 w-4 flex-shrink-0"
                                />
                                <div class="flex items-center overflow-hidden">
                                    <span class="text-gray-500 mr-2 flex-shrink-0">
                                        {@html getFileIcon()}
                                    </span>
                                    <div class="overflow-hidden">
                                        <div class="text-sm font-medium truncate" title={file.filename}>
                                            {file.filename}
                                        </div>
                                        <div class="text-xs text-gray-400 truncate" title={file.path}>
                                            {file.path}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
                <div class="mt-3 text-sm text-gray-500">
                    {selectedFiles.length} of {fileList.length} files selected
                </div>
            {:else}
                <div class="py-6 flex flex-col items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <p class="text-sm">No files found</p>
                </div>
            {/if}
        </div>

        <!-- Input section -->
        <div class="flex-shrink-0">
            <form onsubmit={handleSubmit} class="relative">
                <div class="relative rounded-full bg-gray-100 border border-gray-300 flex items-center">
                    <input
                        bind:this={inputElement}
                        bind:value={inputValue}
                        type="text"
                        class="w-full rounded-full bg-transparent p-4 pr-12 text-black focus:outline-none"
                        placeholder="Ask about your files..."
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        aria-label="Send message"
                        class="absolute right-3 rounded-full p-2 {inputValue.trim() && !isLoading
                            ? 'bg-black text-white hover:bg-gray-800'
                            : 'bg-gray-300 text-gray-500'}"
                        disabled={!inputValue.trim() || isLoading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>