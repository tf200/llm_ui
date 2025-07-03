<script lang="ts">
  import { fetchEventSource } from "@microsoft/fetch-event-source";

  // Props
  let { onUploadSuccess, isLoading = false } = $props<{
    onUploadSuccess?: () => void;
    isLoading?: boolean;
  }>();

  // Component State
  let uploadFile = $state<File | null>(null);
  let dragActive = $state(false);
  let error = $state("");
  let statusMessage = $state("");
  let uploading = $state(false);

  // New state for chunk-based progress tracking
  let processedChunks = $state(0);
  let totalChunks = $state(0);
  let documentName = $state("");

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      uploadFile = input.files[0];
      error = "";
      resetProgress();
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
      uploadFile = event.dataTransfer.files[0];
      error = "";
      resetProgress();
    }
  }

  function resetProgress() {
    statusMessage = "";
    processedChunks = 0;
    totalChunks = 0;
    documentName = "";
  }

  async function handleUpload() {
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append("file", uploadFile);

    // Reset UI for new upload
    uploading = true;
    error = "";
    resetProgress();

    try {
      await fetchEventSource(
        `${import.meta.env.VITE_API_URL}/files/upload-sse`,
        {
          method: "POST",
          body: formData,
          openWhenHidden: true,

          // Handle incoming messages from the stream
          onmessage(event) {
            const parsedData = JSON.parse(event.data);

            switch (parsedData.type) {
              case "TOTAL_CHUNKS":
                totalChunks = parsedData.totalChunks;
                documentName = parsedData.documentName;
                statusMessage = `Starting processing for ${uploadFile?.name}...`;
                break;

              case "PROGRESS":
                processedChunks = parsedData.chunk;
                statusMessage = `Processing chunk ${parsedData.chunk} of ${totalChunks}...`;
                break;

              case "COMPLETED":
                statusMessage = `Embedding complete. Saving file metadata...`;
                break;

              case "DATABASE_SAVE_COMPLETED":
                statusMessage = `Successfully uploaded and processed ${uploadFile?.name}.`;
                console.log("Database save complete, calling onUploadSuccess");
                onUploadSuccess?.();
                break;
            }
          },

          // Handle stream closure
          onclose() {
            console.log("SSE Connection closed by server.");
            uploading = false;
          },

          // Handle any errors
          onerror(err) {
            console.error("EventSource failed:", err);
            error =
              "An error occurred during processing. Please check the file and try again.";
            uploading = false;
            throw err;
          },
        },
      );
    } catch (err) {
      console.error("Caught fetchEventSource error:", err);
      if (!error) {
        error =
          err instanceof Error ? err.message : "Upload failed unexpectedly.";
      }
      uploading = false;
    }
  }

  function clearSelection() {
    uploadFile = null;
    error = "";
    resetProgress();
  }
</script>

<div class="w-full max-w-2xl mx-auto">
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <h2 class="text-xl font-semibold mb-4">Upload Document</h2>

    {#if error}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-700">{error}</p>
      </div>
    {/if}

    {#if statusMessage && !error}
      <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-sm text-blue-700">{statusMessage}</p>
      </div>
    {/if}

    {#if uploading && totalChunks > 0}
      <div class="mb-4">
        <div class="flex justify-between mb-1">
          <span class="text-sm font-medium text-gray-700"
            >Processing Chunks</span
          >
          <span class="text-sm font-medium text-gray-700"
            >{processedChunks} / {totalChunks}</span
          >
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style="width: {totalChunks > 0
              ? (processedChunks / totalChunks) * 100
              : 0}%"
          ></div>
        </div>
      </div>
    {/if}

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-blue-500 mr-2"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              ></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <div class="text-left">
              <p class="font-medium text-gray-900">{uploadFile.name}</p>
              <p class="text-sm text-gray-500">
                {(uploadFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>

          <div class="flex justify-center space-x-3">
            <button
              onclick={handleUpload}
              disabled={uploading || isLoading}
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {#if uploading}
                <svg
                  class="animate-spin h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              {:else}
                Upload File
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="mx-auto text-gray-400"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <div>
              <p class="text-lg font-medium text-gray-700 mb-1">
                Drag and drop your file here
              </p>
              <p class="text-sm text-gray-500">or click to browse</p>
            </div>
          </div>
          <input
            type="file"
            class="hidden"
            onchange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            disabled={uploading || isLoading}
          />
        </label>
      {/if}
    </div>
  </div>
</div>
