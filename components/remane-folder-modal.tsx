"use client";

import { renameFolderAction } from "@/app/actions/renameFolder";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Folder } from "@/lib/types";
import { Loader2 } from "lucide-react"
import { useState, useTransition } from "react"

export function RenameFolderModal({ open, setOpen, folder }: { open: boolean; setOpen: (open: boolean) => void; folder: Folder }) {
    const [folderName, setFolderName] = useState(() => folder.name);
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    function reset() {
        setOpen(false);
        setFolderName("");
        setError("");
    }
    
  function handleCreate() {
      setError("");
  
      const name = folderName.trim();
  
      if (!name) {
        setError("Folder name is required.");
        return;
      }
  
      startTransition(async () => {
        const result = await renameFolderAction(folder.id, name);
  
        if (!result.success) {
          setError(result.message);
          return;
        }

        reset();
      });
}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogContent className="sm:max-w-sm bg-glass/90 backdrop-blur-xl border border-dark/80 dark:border-white/30 shadow-md">
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              Enter a new name for the folder.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="name-1">Name</Label>
              <Input
                id="name-1"
                name="name"
                value={folderName}
                disabled={isPending}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </Field>
          </FieldGroup>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" disabled={isPending}
             onClick={(e) => {
              e.preventDefault();
              handleCreate();
            }}
            >
              {isPending ? <Loader2 className="animate-spin" /> : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
