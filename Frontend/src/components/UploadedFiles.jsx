import React from 'react'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Download, File, FileArchive, FileCode, FileText, Image, Trash } from 'lucide-react'
import { formatFileSize, getFileType } from "@/utils/fileUtils"

const FileIcon = ({ type }) => {
    switch (type) {
        case 'text':
            return <FileText className="h-4 w-4" />;
        case 'image':
            return <Image className="h-4 w-4" />;
        case 'excel':
            return <FileText className="h-4 w-4" />;
        case 'pdf':
            return <FileText className="h-4 w-4" />;
        case 'code':
            return <FileCode className="h-4 w-4" />;
        case 'archive':
            return <FileArchive className="h-4 w-4" />;
        default:
            return <File className="h-4 w-4" />;
    }
};

export function UploadedFiles({ files, onPreview, onDownload, onDelete, formatDate }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    Uploaded Files <ChevronDown className="ml-2 h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96">
                {files.length > 0 ? (
                    files.map((file) => (
                        <DropdownMenuItem key={file.key} className="flex flex-col space-y-2 p-3" onSelect={(event) => {
                            event.preventDefault();
                            onPreview(file.fileName);
                        }}>
                            <div className="w-full">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 flex-1 cursor-pointer">
                                        <FileIcon type={getFileType(file.fileName)} />
                                        <span className="font-medium truncate max-w-[200px]">
                                          {file.fileName}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onDownload(file.fileName);
                                            }}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onDelete(file.fileName);
                                            }}
                                            className="h-8 w-8 p-0"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                                    <div>
                                        <span>{getFileType(file.fileName).toUpperCase()}</span>
                                        <span className="mx-2">•</span>
                                        <span>{formatFileSize(file.size)}</span>
                                    </div>
                                    <span>{formatDate(file.lastModified)}</span>
                                </div>
                            </div>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <DropdownMenuItem disabled className="text-center py-4">
                        No files uploaded
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}