// TODO: Check if this component is needed in library

// import { useState } from "react";
// import { Loader2, Paperclip } from "lucide-react";

// import { getAttachmentDownloadUrl } from "@/api";
// import { Button } from "./button";
// import { cn } from "../lib/utils";
// import { FileAttachment as FileAttachmentType } from "@/types";

// interface FileAttachmentProps {
//   className?: string;
//   file: FileAttachmentType;
// }

// export const FileAttachment = ({ className, file }: FileAttachmentProps) => {
//   const [isDownloading, setIsDownloading] = useState(false);

//   const handleDownload = async (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (isDownloading) return;

//     setIsDownloading(true);
//     try {
//       // Get the signed URL
//       const response = await getAttachmentDownloadUrl(file.id);

//       if (response && response.url) {
//         // Create a hidden anchor element to trigger the download
//         const link = document.createElement("a");
//         link.href = response.url;
//         link.setAttribute("download", file.fileName);
//         link.setAttribute("target", "_blank");
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//       } else {
//         console.error("Invalid download response", response);
//       }
//     } catch (error) {
//       console.error("Failed to download attachment:", error);
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   return (
//     <Button
//       variant="link"
//       size="sm"
//       className={cn("text-foreground h-auto px-0 [&_svg]:size-3.5", className)}
//       onClick={handleDownload}
//       disabled={isDownloading}
//     >
//       {isDownloading ? (
//         <Loader2 className="text-lilac animate-spin" />
//       ) : (
//         <Paperclip className="text-lilac" />
//       )}
//       {file.fileName}
//     </Button>
//   );
// };
