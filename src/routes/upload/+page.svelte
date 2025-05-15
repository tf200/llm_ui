<script lang="ts">
  import { onMount } from "svelte";
  import { listFiles } from "$lib/services/files";
  import type { FileListResponse } from "$lib/types/files";

  let fileList: FileListResponse = {
    path: "",
    files: [],
    directories: [],
  };

  let isLoading = false;
  let error = "";
  let uploadFile: File | null = null;
  let dragActive = false;
  let statusMessage = "";

  onMount(async () => {
    await fetchFiles();
  });

  async function fetchFiles() {
    try {
      isLoading = true;
      error = "";
      fileList = await listFiles();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load files";
    } finally {
      isLoading = false;
    }
  }

  let uploadFiles: FileList | null = null;

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      uploadFiles = input.files;
      uploadFile = input.files[0]; // For preview
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
      uploadFile = event.dataTransfer.files[0]; // For preview
    }
  }

  // Implemented upload function
  async function handleUpload() {
    if (!uploadFiles || uploadFiles.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < uploadFiles.length; i++) {
      formData.append("files", uploadFiles[i]);
    }

    try {
      isLoading = true;
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
      console.log("Upload successful:", result);

      // Reset after successful upload
      uploadFile = null;
      uploadFiles = null;

      // Show success message
      statusMessage = `Successfully uploaded and embedded ${result.files.length} file(s). Total chunks processed: ${result.chunks_embedded}`;

      // Refresh file list after upload
      await fetchFiles();
    } catch (err) {
      error = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload error:", error);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="container mx-auto p-6">
  <h1 class="text-2xl font-bold mb-6">File Upload</h1>

  <!-- Upload Component -->
  <div class="mb-8">
    <div
      class={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
      on:dragover={handleDragOver}
      on:dragleave={handleDragLeave}
      on:drop={handleDrop}
    >
      {#if uploadFile}
        <div class="mb-4">
          <p class="text-lg">
            Selected file: <span class="font-semibold">{uploadFile.name}</span>
          </p>
          <p class="text-sm text-gray-500">
            {(uploadFile.size / 1024).toFixed(2)} KB | {uploadFile.type ||
              "Unknown type"}
          </p>
          {#if uploadFiles && uploadFiles.length > 1}
            <p class="text-sm font-medium mt-1">
              +{uploadFiles.length - 1} more file(s) selected
            </p>
          {/if}
        </div>
        <button
          on:click={handleUpload}
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Upload {uploadFiles && uploadFiles.length > 1
            ? `${uploadFiles.length} Files`
            : "File"}
        </button>
        <button
          on:click={() => {
            uploadFile = null;
            uploadFiles = null;
          }}
          class="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          Cancel
        </button>
      {:else}
        <label class="cursor-pointer">
          <div class="flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p class="mb-2 text-lg font-medium text-gray-700">
              Drag and drop your file here
            </p>
            <p class="text-sm text-gray-500">or click to select a file</p>
          </div>
          <input
            type="file"
            multiple
            class="hidden"
            on:change={handleFileChange}
          />
        </label>
      {/if}
    </div>
  </div>

  <!-- File List Component -->
  <div>
    <h2 class="text-xl font-semibold mb-4">Files</h2>

    <!-- Loading Overlay -->
    {#if isLoading}
      <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="flex items-center space-x-4">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
            ></div>
            <p>Processing files...</p>
          </div>
        </div>
      </div>
    {:else if error}
      <div class="p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
        <button
          on:click={fetchFiles}
          class="mt-2 text-sm text-red-700 underline"
        >
          Try again
        </button>
      </div>
    {:else if fileList.files.length === 0 && fileList.directories.length === 0}
      <div class="p-4 text-center text-gray-500">
        <p>No files found in {fileList.path || "current directory"}</p>
      </div>
    {:else}
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="p-3 bg-gray-50 border-b border-gray-200">
          <p class="font-medium">Current path: {fileList.path || "/"}</p>
        </div>

        <!-- Directories -->
        {#if fileList.directories.length > 0}
          <div class="border-b border-gray-200">
            <h3 class="px-4 py-2 bg-gray-50 text-sm font-medium">
              Directories
            </h3>
            <ul>
              {#each fileList.directories as directory}
                <li class="border-t border-gray-100 first:border-none">
                  <div class="flex items-center px-4 py-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-yellow-500 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    <span>{directory}</span>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        <!-- Files -->
        {#if fileList.files.length > 0}
          <div>
            <h3 class="px-4 py-2 bg-gray-50 text-sm font-medium">Files</h3>
            <ul>
              {#each fileList.files as file}
                <li class="border-t border-gray-100 first:border-none">
                  <div class="flex items-center px-4 py-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-blue-500 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{file}</span>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/if}

    <div class="mt-4">
      <button
        on:click={fetchFiles}
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Refresh Files
      </button>
    </div>
  </div>
</div>
