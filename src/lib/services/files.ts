import type { DeleteFileResponse, FileListResponse } from "$lib/types/files";

export async function listFiles(): Promise<FileListResponse[]> {
  // In a real app, you might add auth headers here
  // const headers = getAuthHeaders();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/files`,
      {
        // headers: headers, // Uncomment if you need auth headers
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.statusText}`);
    }

    return await response.json() as FileListResponse[];
  } catch (error) {
    // More specific error handling
    if (error instanceof Error) {
      throw new Error(`File listing failed: ${error.message}`);
    }
    throw new Error('File listing failed due to an unknown error');
  }
}



export async function deleteFile(file_id: string): Promise<DeleteFileResponse> {
  // In a real app, you might add auth headers here
  // const headers = getAuthHeaders();

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/files/${file_id}`,
      {
        method: 'DELETE',
        // headers: headers, // Uncomment if you need auth headers
      }
    );

    if (!response.ok) {
      throw new Error(`Failed Deleting Files: ${response.statusText}`);
    }

    return await response.json() as DeleteFileResponse;
  } catch (error) {
    // More specific error handling
    if (error instanceof Error) {
      throw new Error(`File deleting failed: ${error.message}`);
    }
    throw new Error('File deleting failed due to an unknown error');
  }
}



export async function openFile(file_id: string): Promise<void> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/files/${file_id}`,
      {
        method: 'GET',
        // headers: headers, // Uncomment if you need auth headers
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    // Get the blob and create object URL
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    // Open in new tab
    window.open(url, '_blank');

    // Clean up object URL after a short delay to ensure it loads
    setTimeout(() => URL.revokeObjectURL(url), 1000);

  } catch (error) {
    console.error('Error opening file:', error);
    throw error;
  }
}

/**
 * Get file URL for direct linking
 */
export function getFileUrl(file_id: string): string {
  return `${import.meta.env.VITE_API_URL}/files/${file_id}`;
}