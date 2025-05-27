<script lang="ts">
  import {getFileIcon} from "$lib/utils/icons";
  import type { FileListResponse } from "$lib/types/files";
  import {deleteFile} from "$lib/services/files";

  let {
    fileList,
    isLoading,
    error,
    onRefresh
  } = $props<{
    fileList: FileListResponse[];
    isLoading: boolean;
    error?: string;
    onRefresh?: () => void;
  }>();

  let deletingFiles = $state(new Set<string>());

  async function handleDelete(file: FileListResponse) {
    if (deletingFiles.has(file.file_id)) return;
    
    deletingFiles.add(file.file_id);
    // No need to reassign - $state handles reactivity automatically
    
    try {
      await deleteFile(file.file_id);
      // Refresh the file list after successful deletion
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete file:', err);
      // You might want to show an error message here
    } finally {
      deletingFiles.delete(file.file_id);
      // No need to reassign - $state handles reactivity automatically
    }
  }
</script>

<div class="w-full max-w-2xl mx-auto">
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="p-4 border-b border-gray-200 flex justify-between items-center">
      <h2 class="text-xl font-semibold">Files</h2>
      <div class="flex items-center space-x-4">
        <span class="text-sm text-gray-500">
          {fileList.length} files
        </span>
        {#if onRefresh}
          <button
            onclick={onRefresh}
            disabled={isLoading}
            class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center"
          >
            {#if isLoading}
              <svg class="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                <polyline points="1 4 1 10 7 10"></polyline>
                <polyline points="23 20 23 14 17 14"></polyline>
                <path d="m20.49 9A9 9 0 0 0 5.64 5.64l1.27 1.27a7 7 0 0 1 11.85 1.17"></path>
                <path d="m3.51 15a9 9 0 0 0 14.85 3.36l-1.27-1.27a7 7 0 0 1-11.85-1.17"></path>
              </svg>
              Refresh
            {/if}
          </button>
        {/if}
      </div>
    </div>

    <div class="p-4">
      {#if error}
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500 mr-2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <div>
              <p class="text-sm text-red-700">{error}</p>
              {#if onRefresh}
                <button
                  onclick={onRefresh}
                  class="mt-1 text-sm text-red-600 underline hover:text-red-800"
                >
                  Try again
                </button>
              {/if}
            </div>
          </div>
        </div>
      {:else if isLoading}
        <div class="py-8 text-center">
          <svg class="animate-spin h-8 w-8 mx-auto mb-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-500">Loading files...</p>
        </div>
      {:else if fileList.length === 0}
        <div class="py-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 text-gray-400">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <div>
            <p class="text-lg font-medium text-gray-700 mb-1">No files found</p>
            <p class="text-sm text-gray-500">Upload some files to get started</p>
          </div>
        </div>
      {:else}
        <div class="space-y-2 max-h-96 overflow-y-auto">
          {#each fileList as file}
            <div class="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <span class="text-gray-500 mr-3 flex-shrink-0">
                {@html getFileIcon()}
              </span>
              <div class="flex-grow overflow-hidden">
                <div class="font-medium text-sm text-gray-900 truncate" title={file.filename}>
                  {file.filename}
                </div>
                <div class="text-xs text-gray-500 truncate" title={file.path}>
                  {file.path}
                </div>
              </div>
              <div class="text-xs text-gray-400 ml-2 flex-shrink-0">
                ID: {file.file_id}
              </div>
              <button
                onclick={() => handleDelete(file)}
                disabled={deletingFiles.has(file.file_id)}
                class="ml-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title="Delete file"
              >
                {#if deletingFiles.has(file.file_id)}
                  <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="m19 6-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                {/if}
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>