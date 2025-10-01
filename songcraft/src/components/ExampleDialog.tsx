import { useState } from "react";
import { Button } from "../ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";

export function ExampleDialog() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-fg-primary">
        Radix UI Integration
      </h2>

      {/* Your custom button */}
      <button className="btn">Custom Button (Layer Components)</button>

      {/* Radix UI Button */}
      <Button variant="default" className="ml-4">
        Radix Button (Primary)
      </Button>

      <Button variant="outline" className="ml-4">
        Radix Button (Outline)
      </Button>

      {/* Dialog Example */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="dialog-content">
          <DialogHeader className="dialog-header">
            <DialogTitle className="dialog-title">Radix UI Dialog</DialogTitle>
            <DialogDescription className="dialog-description">
              This is a dialog built with Radix UI primitives and styled with
              your custom design tokens.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-fg-primary">
              The dialog uses your semantic color tokens and integrates
              seamlessly with your layer-based CSS architecture.
            </p>
          </div>
          <DialogFooter className="dialog-footer">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
