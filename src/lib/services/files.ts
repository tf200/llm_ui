import type { FileListResponse } from "$lib/types/files";

export async function listFiles(): Promise<FileListResponse> {
    // In a real app, you might add auth headers here
    // const headers = getAuthHeaders();
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/list-files`,
        {
          // headers: headers, // Uncomment if you need auth headers
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`);
      }
  
      return await response.json() as FileListResponse;
    } catch (error) {
      // More specific error handling
      if (error instanceof Error) {
        throw new Error(`File listing failed: ${error.message}`);
      }
      throw new Error('File listing failed due to an unknown error');
    }
  }