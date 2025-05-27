<script lang="ts">
  import { onMount } from "svelte";
  import { listFiles } from "$lib/services/files";
  import type { FileListResponse } from "$lib/types/files";
  import UploadComponent from "$lib/components/fileUpload/FileUpload.svelte";
  import FileListComponent from "$lib/components/fileList/FileList.svelte";

  let fileList: FileListResponse[] = [];
  let isLoading = false;
  let error = "";

  onMount(async () => {
    await fetchFiles();
  });

  async function fetchFiles() {
    try {
      isLoading = true;
      error = "";
      console.log("Before fetch, fileList:", fileList); // Debug log
      fileList = await listFiles();
      console.log("After fetch, fileList:", fileList); // Debug log
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load files";
      console.error("Error fetching files:", err);
      fileList = []; // Ensure it's still an array on error
    } finally {
      isLoading = false;
    }
  }

  function handleUploadSuccess() {
    // Refresh file list after successful upload
    fetchFiles();
  }
</script>

<div class="min-h-screen bg-gray-50">
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">File Management</h1>
        <p class="text-gray-600">Upload and manage your files</p>
      </div>

      <div class="space-y-8">
        <!-- Upload Component -->
        <UploadComponent 
          onUploadSuccess={handleUploadSuccess}
          isLoading={isLoading}
        />

        <!-- File List Component -->
        <FileListComponent 
          fileList={fileList}
          isLoading={isLoading}
          error={error}
          onRefresh={fetchFiles}
        />
      </div>
    </div>
  </div>
</div>