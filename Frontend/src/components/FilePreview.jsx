import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export const FilePreview = ({ isOpen, onClose, content, fileName, onDownload }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>{fileName}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh]">
                    <pre className="whitespace-pre-wrap p-4 text-sm">
                        {content}
                    </pre>
                </ScrollArea>
                <DialogFooter>
                    <Button onClick={onDownload}>
                        Download
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};