// TODO: Check if this component is needed in library

// import { useState } from "react";
// import Editor from "react-simple-code-editor";
// import { CheckCheck, Copy, Paintbrush } from "lucide-react";
// import { highlight, languages } from "prismjs";

// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { cn } from "@/lib/utils";

// import "prismjs/components/prism-json";
// import "prismjs/themes/prism.css";

// interface CodeEditorProps {
//   content: string;
//   onChange?: (value: string) => void;
//   onFormat?: () => void;
//   readOnly?: boolean;
//   title?: string;
//   className?: string;
// }

// export const CodeEditor = ({
//   content,
//   onChange,
//   onFormat,
//   readOnly = false,
//   title = "JSON Editor",
//   className,
// }: CodeEditorProps) => {
//   const [isCopied, setIsCopied] = useState(false);

//   const handleCopy = () => {
//     if (navigator.clipboard) {
//       navigator.clipboard
//         .writeText(content)
//         .then(() => {
//           setIsCopied(true);
//           setTimeout(() => {
//             setIsCopied(false);
//           }, 1000);
//         })
//         .catch((err) => {
//           console.error("Failed to copy text: ", err);
//         });
//     }
//   };

//   const handleValueChange = (value: string) => {
//     onChange?.(value);
//   };

//   const highlightCode = (code: string) => {
//     return highlight(code, languages.json, "json");
//   };

//   return (
//     <div className={cn("border-border flex flex-col rounded-lg border bg-zinc-950", className)}>
//       {/* Header */}
//       <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-2">
//         <span className="text-foreground text-sm font-medium">{title}</span>
//         <div className="flex items-center gap-2">
//           <Button variant="outline" size="sm" onClick={handleCopy}>
//             {isCopied ? (
//               <div className="flex items-center gap-1 text-green-500">
//                 <CheckCheck /> Copied!
//               </div>
//             ) : (
//               <>
//                 <Copy /> Copy
//               </>
//             )}
//           </Button>
//           <Button variant="outline" size="sm" onClick={onFormat}>
//             <Paintbrush /> Format
//           </Button>
//         </div>
//       </div>

//       {/* Editor with ScrollArea */}
//       <ScrollArea className="bg-foreground/5 h-[500px] flex-1">
//         <Editor
//           value={content}
//           onValueChange={handleValueChange}
//           highlight={highlightCode}
//           padding={16}
//           style={{
//             fontFamily: '"Fira Code", monospace',
//             fontSize: 14,
//             backgroundColor: "transparent",
//             minHeight: "100%",
//           }}
//           textareaClassName="focus:outline-hidden"
//           readOnly={readOnly}
//         />
//       </ScrollArea>
//     </div>
//   );
// };
