// TODO: Check if this component is needed in library

// import { useRef, useState } from "react";
// import {
//   Bold,
//   CirclePlus,
//   Code,
//   Edit,
//   Eye,
//   Heading,
//   Image,
//   Link,
//   List,
//   ListOrdered,
//   Paperclip,
//   Quote,
//   Strikethrough,
//   Underline,
// } from "lucide-react";

// import { MarkdownContent } from "@/components/governance/markdown-content";
// import { Textarea } from "@/components/ui/textarea";
// import { cn, formatMB, isOverLimit } from "@/lib/utils";

// interface CustomTextAreaProps {
//   placeholder?: string;
//   value?: string;
//   onChange?: (value: string) => void;
//   files?: FileList | null;
//   onFilesChange?: (files: FileList | null) => void;
//   disabled?: boolean;
//   className?: string;
//   onFileToast?: (title: string, description: string) => void;
// }

// export const CustomTextArea = ({
//   placeholder = "Add your comment here...",
//   value = "",
//   onChange,
//   files,
//   onFilesChange,
//   disabled = false,
//   className = "",
//   onFileToast,
// }: CustomTextAreaProps) => {
//   const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
//   const [isDragOver, setIsDragOver] = useState(false);

//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const isWriteTab = activeTab === "write";

//   const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     onChange?.(e.target.value);
//   };

//   const insertText = (before: string, after: string = "") => {
//     const textarea = textareaRef.current;
//     if (!textarea) return;

//     // Always use the live DOM value to avoid any state lag
//     const currentText = textarea.value ?? "";
//     const start = textarea.selectionStart;
//     const end = textarea.selectionEnd;
//     const selectedText = currentText.substring(start, end);

//     // Toggle off if already wrapped
//     const beforeStart = start - before.length;
//     const afterEnd = end + after.length;

//     if (beforeStart >= 0 && afterEnd <= currentText.length) {
//       const textBefore = currentText.substring(beforeStart, start);
//       const textAfter = currentText.substring(end, afterEnd);
//       const isAlreadyFormatted = textBefore === before && textAfter === after;

//       if (isAlreadyFormatted) {
//         const newText =
//           currentText.substring(0, beforeStart) + selectedText + currentText.substring(afterEnd);

//         onChange?.(newText);

//         // Reset cursor
//         requestAnimationFrame(() => {
//           textarea.focus();
//           textarea.setSelectionRange(beforeStart, beforeStart + selectedText.length);
//         });
//         return;
//       }
//     }

//     // Add formatting
//     const newText =
//       currentText.substring(0, start) + before + selectedText + after + currentText.substring(end);

//     onChange?.(newText);

//     // Reset cursor
//     requestAnimationFrame(() => {
//       textarea.focus({ preventScroll: true });
//       textarea.setSelectionRange(
//         start + before.length,
//         start + before.length + selectedText.length
//       );
//     });
//   };

//   const handleFileUpload = () => {
//     if (disabled) return;
//     fileInputRef.current?.click();
//   };

//   const mergeFileLists = (prev: FileList | null, next: FileList | null): FileList => {
//     const key = (f: File) => `${f.name}::${f.size}::${f.lastModified}`;
//     const dt = new DataTransfer();
//     const seen = new Set<string>();

//     const addUnique = (files: FileList | null) => {
//       if (!files) return;
//       for (const f of Array.from(files)) {
//         const k = key(f);
//         if (!seen.has(k)) {
//           dt.items.add(f);
//           seen.add(k);
//         }
//       }
//     };

//     addUnique(prev);
//     addUnique(next);
//     return dt.files;
//   };

//   const processFiles = (incoming: FileList) => {
//     // File size check
//     const overLimit = Array.from(incoming).filter((f) => isOverLimit(f.size, 10));
//     if (overLimit.length) {
//       onFileToast?.(
//         `File too large: ${overLimit.map((f) => f.name).join(", ")}`,
//         "Each file must be ≤ 10MB."
//       );
//       return false;
//     }

//     // Create fresh file list
//     const merged = mergeFileLists(files ?? null, incoming);

//     // Update parent with the fresh file list
//     onFilesChange?.(merged);
//     return true;
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const incoming = e.target.files;
//     if (!incoming) return;

//     processFiles(incoming);

//     // Clear the input
//     e.target.value = "";
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (!disabled) {
//       setIsDragOver(true);
//     }
//   };

//   const handleDragLeave = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     // Only set dragover to false if we're leaving the entire component
//     if (!e.currentTarget.contains(e.relatedTarget as Node)) {
//       setIsDragOver(false);
//     }
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragOver(false);

//     if (disabled) return;

//     const droppedFiles = e.dataTransfer.files;
//     if (droppedFiles && droppedFiles.length > 0) {
//       processFiles(droppedFiles);
//     }
//   };

//   const removeFileAt = (index: number) => {
//     if (!files) return;
//     const dt = new DataTransfer();
//     Array.from(files).forEach((f, i) => {
//       if (i !== index) dt.items.add(f);
//     });
//     onFilesChange?.(dt.files);
//   };

//   const clearFiles = () => {
//     onFilesChange?.(null);
//     // Clear the file input to ensure change events fire properly
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const handleTabClick = (tab: "write" | "preview") => {
//     if (!disabled) {
//       setActiveTab(tab);
//     }
//   };

//   const toolbarButtons = [
//     { icon: Bold, action: () => insertText("**", "**"), tooltip: "Bold" },
//     { icon: Heading, action: () => insertText("## "), tooltip: "Heading" },
//     { icon: Strikethrough, action: () => insertText("~~", "~~"), tooltip: "Strikethrough" },
//     { icon: Underline, action: () => insertText("<ins>", "</ins>"), tooltip: "Underline" },
//     { icon: Code, action: () => insertText("`", "`"), tooltip: "Code" },
//     { icon: Link, action: () => insertText("[", "](url)"), tooltip: "Link" },
//     { icon: Quote, action: () => insertText("> "), tooltip: "Quote" },
//     { icon: List, action: () => insertText("- "), tooltip: "Unordered list" },
//     { icon: ListOrdered, action: () => insertText("1. "), tooltip: "Ordered list" },
//     { icon: Image, action: handleFileUpload, tooltip: "Attach Files" },
//   ];

//   return (
//     <div
//       className={cn(
//         "relative overflow-hidden rounded-lg border border-white/20 bg-black transition-colors",
//         disabled && "cursor-not-allowed opacity-50",
//         isDragOver && !disabled && "border-violet-400 bg-violet-950/20",
//         className
//       )}
//       onDragOver={handleDragOver}
//       onDragLeave={handleDragLeave}
//       onDrop={handleDrop}
//     >
//       {/* Hidden file input */}
//       <input
//         ref={fileInputRef}
//         type="file"
//         multiple
//         onChange={handleFileChange}
//         className="hidden"
//         disabled={disabled}
//       />

//       {/* Header */}
//       <div className="flex items-center justify-between border-b border-white/20 bg-black px-3 py-2">
//         <div className="flex items-center space-x-1">
//           <button
//             onClick={() => handleTabClick("write")}
//             disabled={disabled}
//             className={cn(
//               "rounded-md px-3 py-1 text-sm transition-colors focus:ring-0 focus:outline-hidden",
//               isWriteTab
//                 ? "bg-white/20 text-white"
//                 : "text-muted-foreground hover:bg-white/20 hover:text-white"
//             )}
//           >
//             <div className="flex items-center space-x-1">
//               <Edit size={14} />
//               <span>Write</span>
//             </div>
//           </button>
//           <button
//             onClick={() => handleTabClick("preview")}
//             disabled={disabled}
//             className={cn(
//               "rounded-md px-3 py-1 text-sm transition-colors focus:ring-0 focus:outline-hidden",
//               !isWriteTab
//                 ? "bg-white/20 text-white"
//                 : "text-muted-foreground hover:bg-white/20 hover:text-white"
//             )}
//           >
//             <div className="flex items-center space-x-1">
//               <Eye size={14} />
//               <span>Preview</span>
//             </div>
//           </button>
//         </div>

//         {isWriteTab && (
//           <div className="flex items-center space-x-1">
//             <div className="mr-2 flex items-center space-x-1">
//               {toolbarButtons.map((button, index) => (
//                 <div key={index} className="contents">
//                   {(index === 5 || index === 7 || index === 9) && (
//                     <div className="mx-1 h-4 w-px bg-white/20" />
//                   )}
//                   <button
//                     onClick={button.action}
//                     className="text-muted-foreground rounded p-1.5 transition-colors hover:bg-white/20 hover:text-white focus:ring-0 focus:outline-hidden"
//                     title={button.tooltip}
//                     disabled={disabled}
//                   >
//                     <button.icon size={16} />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Content */}
//       <div className="relative">
//         {isWriteTab ? (
//           <Textarea
//             ref={textareaRef}
//             placeholder={placeholder}
//             value={value ?? ""}
//             onChange={handleTextChange}
//             disabled={disabled}
//             className="text-muted-foreground placeholder-muted-foreground field-sizing-content max-h-[300px] min-h-[100px] resize-y border-none bg-black p-4 ring-0! ring-offset-0! outline-hidden! focus:ring-0! focus:ring-offset-0! focus:outline-hidden! focus-visible:ring-0! focus-visible:ring-offset-0!"
//           />
//         ) : (
//           <div className="text-foreground min-h-[100px] bg-black p-4">
//             {value ? (
//               <MarkdownContent
//                 content={value}
//                 className="text-muted-foreground text-sm leading-relaxed"
//               />
//             ) : (
//               <div className="text-muted-foreground text-sm">Nothing to preview</div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Footer: inline files or attach button */}
//       {files && files.length > 0 ? (
//         <div className="text-muted-foreground flex items-center justify-between border-t border-white/20 bg-black px-2 py-2 text-sm">
//           <div className="flex flex-wrap gap-x-2 gap-y-1">
//             {Array.from(files).map((file, i) => (
//               <div
//                 key={`${file.name}-${file.size}-${file.lastModified}`}
//                 className="flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-xs"
//               >
//                 <Paperclip size={14} />
//                 <span className="max-w-[220px] truncate">{file.name}</span>
//                 <span>({formatMB(file.size)})</span>
//                 <button
//                   type="button"
//                   className="ml-1 rounded p-0.5 hover:bg-white/10"
//                   aria-label={`Remove ${file.name}`}
//                   onClick={() => removeFileAt(i)}
//                   disabled={disabled}
//                 >
//                   ×
//                 </button>
//               </div>
//             ))}
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-white/10"
//               onClick={handleFileUpload}
//               disabled={disabled}
//             >
//               <CirclePlus size={14} />
//               Attach more
//             </button>
//             <button
//               type="button"
//               className="rounded px-2 py-1 text-xs hover:bg-white/10"
//               onClick={clearFiles}
//               disabled={disabled}
//             >
//               Clear all
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="border-t border-white/20 bg-black px-2 py-2.5">
//           <button
//             type="button"
//             className={cn(
//               "flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors",
//               isDragOver && !disabled
//                 ? "bg-violet-500/20 text-violet-300"
//                 : "text-muted-foreground hover:bg-white/10 hover:text-white"
//             )}
//             onClick={handleFileUpload}
//             disabled={disabled}
//             title="Maximum 10MB per file"
//           >
//             <Image size={14} />
//             {isDragOver && !disabled
//               ? "Drop files to attach"
//               : "Drag & drop or click to attach files"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };
