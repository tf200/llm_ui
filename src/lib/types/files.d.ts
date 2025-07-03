export interface FileListResponse {
  filename: string;
  fileId: string;
  path: string;
  uploadedAt: string;

}



export interface DeleteFileResponse {
  message: string;
  file_id: string;
}