import { useEffect, useRef } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  readonly?: boolean;
}

// Simple code editor using textarea with basic syntax highlighting styling
// In a production app, you would integrate Monaco Editor here
export default function CodeEditor({ 
  value, 
  onChange, 
  language, 
  height = "300px", 
  readonly = false 
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Auto-resize textarea to fit content
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, parseInt(height)) + "px";
    }
  }, [value, height]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key for indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newValue = value.substring(0, start) + "    " + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const getPlaceholderForLanguage = (lang: string) => {
    switch (lang) {
      case "python":
        return `def solution():
    # Write your solution here
    pass

# Test your solution
if __name__ == "__main__":
    result = solution()
    print(result)`;
      case "javascript":
        return `function solution() {
    // Write your solution here
    return null;
}

// Test your solution
console.log(solution());`;
      case "java":
        return `public class Solution {
    public static void main(String[] args) {
        // Write your solution here
        System.out.println("Hello World");
    }
}`;
      case "cpp":
        return `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    cout << "Hello World" << endl;
    return 0;
}`;
      default:
        return "// Write your code here";
    }
  };

  return (
    <div className="border border-border rounded-md bg-card">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={!value ? getPlaceholderForLanguage(language) : ""}
        readOnly={readonly}
        className="code-editor w-full p-4 bg-transparent text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
        style={{ 
          height,
          minHeight: "200px",
          maxHeight: "600px",
          fontFamily: '"JetBrains Mono", Consolas, Monaco, monospace',
          fontSize: "14px",
          lineHeight: "1.5",
          tabSize: 4,
        }}
        spellCheck={false}
        data-testid="code-editor"
      />
      
      {/* Language indicator */}
      <div className="px-4 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span data-testid="text-language-indicator">
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </span>
          <div className="flex items-center space-x-4 text-xs">
            <span>Use Tab for indentation</span>
            <span>Ctrl+A to select all</span>
          </div>
        </div>
      </div>
    </div>
  );
}
