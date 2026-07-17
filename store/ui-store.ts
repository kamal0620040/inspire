import { create } from "zustand";
import { CameraState } from "@/lib/types";

interface UIState {
  // Camera
  camera: CameraState;
  setCamera: (camera: CameraState) => void;
  updateCamera: (update: Partial<CameraState>) => void;
  resetCamera: () => void;

  // Selection
  selectedIds: string[];
  selectAsset: (id: string, isMulti?: boolean) => void;
  deselectAsset: (id: string) => void;
  toggleSelection: (id: string) => void;
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;

  // Tool
  currentTool: "select" | "pan";
  setCurrentTool: (tool: "select" | "pan") => void;

  uploadDialogOpen: boolean;
  triggerUploadDialog: () => void;
  clearUploadDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Camera
  camera: { x: 0, y: 0, zoom: 1 },
  setCamera: (camera) => set({ camera }),
  updateCamera: (update) =>
    set((state) => ({ camera: { ...state.camera, ...update } })),
  resetCamera: () => set({ camera: { x: 0, y: 0, zoom: 1 } }),

  // Selection
  selectedIds: [],
  selectAsset: (id, isMulti = false) =>
    set((state) => {
      if (isMulti) {
        if (state.selectedIds.includes(id)) {
          return { selectedIds: state.selectedIds.filter((x) => x !== id) };
        } else {
          return { selectedIds: [...state.selectedIds, id] };
        }
      } else {
        return { selectedIds: [id] };
      }
    }),
  deselectAsset: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.filter((x) => x !== id),
    })),
  toggleSelection: (id) =>
    set((state) => {
      const isSelected = state.selectedIds.includes(id);
      return {
        selectedIds: isSelected
          ? state.selectedIds.filter((x) => x !== id)
          : [...state.selectedIds, id],
      };
    }),
  setSelection: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),

  // Tool
  currentTool: "select",
  setCurrentTool: (currentTool) => set({ currentTool }),


  uploadDialogOpen: false,

  triggerUploadDialog: () =>
    set({ uploadDialogOpen: true }),

  clearUploadDialog: () =>
    set({ uploadDialogOpen: false }),
}));
