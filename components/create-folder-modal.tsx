"use client";

import { createFolderAction } from "@/app/actions/createFolder"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useState, useTransition } from "react"

export function CreateFolderModal({ children }: { children: React.ReactElement }) {
    const [open, setOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
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
        const result = await createFolderAction(name);
  
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
        <DialogTrigger render={children} />
        <DialogContent className="sm:max-w-sm bg-glass">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder.
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
            className="cursor-pointer"
            >
              {isPending ? <Loader2 className="animate-spin" /> : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
