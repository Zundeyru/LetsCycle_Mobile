export interface PhotoDto {
  id: string;
  mimeType: string;
  size: number;
  createdAt: string;
  /** Path relatif ke server API; butuh sesi login untuk dibuka. */
  url: string;
}

export interface PhotoListResponse {
  photos: PhotoDto[];
}

export interface PhotoUploadResponse {
  photo: PhotoDto;
}
