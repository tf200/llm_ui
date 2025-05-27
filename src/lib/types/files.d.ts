export interface FileListResponse {
    filename: string;
    file_id: string;
    path : string;
  }



export interface DeleteFileResponse {
  message: string;
  file_id: string;
}