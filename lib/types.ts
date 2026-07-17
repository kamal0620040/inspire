export type FolderView = "canvas" | "board";

export interface Profile {
  id: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  view: FolderView;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  asset_count?: number;
}

export interface Asset {
  id: string;
  folder_id: string;
  user_id: string;
  type: "image" | "video";
  storage_path: string;
  thumbnail_path: string | null;
  url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  file_name: string | null;
  order_index: number;
  
  // Canvas layout
  x: number;
  y: number;
  rotation: number;
  scale: number;
  z_index: number;
  
  created_at: string;
  updated_at: string;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}
