<script lang="ts">
  let {
    onUploadSuccess,
    isLoading = false
  } = $props<{
    onUploadSuccess?: () => void;
    isLoading?: boolean;
  }>();

  let uploadFiles = $state<FileList | null>(null);
  let uploadFile = $state<File | null>(null);
  let dragActive = $state(false);
  let error = $state("");
  let statusMessage = $state("");
  let uploading = $state(false);

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      uploadFiles = input.files;
      uploadFile = input.files[0];
      error = "";
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragActive = true;
  }

  function handleDragLeave() {
    dragActive = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragActive = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      uploadFiles = event.dataTransfer.files;
      uploadFile = event.dataTransfer.files[0];
      error = "";
    }
  }

  async function handleUpload() {
    if (!uploadFiles || uploadFiles.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < uploadFiles.length; i++) {
      formData.append("files", uploadFiles[i]);
    }

    try {
      uploading = true;
      error = "";
      statusMessage = "";

      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `Upload failed with status: ${response.status}`
        );
      }

      const result = await response.json();
      
      // Reset after successful upload
      uploadFile = null;
      uploadFiles = null;

      // Show success message
      statusMessage = `Successfully uploaded and embedded ${result.length} file(s). Total chunks processed`;

      console.log("About to call onUploadSuccess, callback exists:", typeof onUploadSuccess === 'function');

      // Notify parent component
      onUploadSuccess?.();
    } catch (err) {
      error = err instanceof Error ? err.message : "Upload failed";
    } finally {
      uploading = false;
    }
  }

  function clearSelection() {
    uploadFile = null;
    uploadFiles = null;
    error = "";
    statusMessage = "";
  }
</script>

<div class="w-full max-w-2xl mx-auto">
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <h2 class="text-xl font-semibold mb-4">Upload Files</h2>
    
    <!-- Status Messages -->
    {#if error}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-700">{error}</p>
      </div>
    {/if}

    {#if statusMessage}
      <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-sm text-green-700">{statusMessage}</p>
      </div>
    {/if}

    <!-- Upload Area -->
    <div
      class="border-2 border-dashed rounded-lg p-8 text-center transition-colors {dragActive 
        ? 'border-blue-400 bg-blue-50' 
        : 'border-gray-300 hover:border-gray-400'}"
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleDrop}
      role="button"
      tabindex="0"
    >
      {#if uploadFile}
        <div class="space-y-4">
          <div class="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500 mr-2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <div class="text-left">
              <p class="font-medium text-gray-900">{uploadFile.name}</p>
              <p class="text-sm text-gray-500">
                {(uploadFile.size / 1024).toFixed(2)} KB • {uploadFile.type || "Unknown type"}
              </p>
            </div>
          </div>
          
          {#if uploadFiles && uploadFiles.length > 1}
            <p class="text-sm text-gray-600">
              +{uploadFiles.length - 1} more file(s) selected
            </p>
          {/if}

          <div class="flex justify-center space-x-3">
            <button
              onclick={handleUpload}
              disabled={uploading || isLoading}
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {#if uploading}
                <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              {:else}
                Upload {uploadFiles && uploadFiles.length > 1 ? `${uploadFiles.length} Files` : "File"}
              {/if}
            </button>
            <button
              onclick={clearSelection}
              disabled={uploading}
              class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      {:else}
        <label class="cursor-pointer block">
          <div class="space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-gray-400">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <div>
              <p class="text-lg font-medium text-gray-700 mb-1">
                Drag and drop your files here
              </p>
              <p class="text-sm text-gray-500">
                or click to browse files
              </p>
            </div>
          </div>
          <input
            type="file"
            multiple
            class="hidden"
            onchange={handleFileChange}
            disabled={uploading || isLoading}
          />
        </label>
      {/if}
    </div>
  </div>
</div>