import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export interface TestCase {
  input: string;
  output: string;
}

export interface ExecutionResult {
  status: "accepted" | "wrong_answer" | "runtime_error" | "time_limit_exceeded";
  executionTime: number;
  passedTests: number;
  totalTests: number;
  errorMessage?: string;
  feedback?: string;
}

export async function executeCode(
  code: string,
  language: string,
  testCases: TestCase[],
  timeLimit: number = 5000 // 5 seconds default
): Promise<ExecutionResult> {
  const tempDir = `/tmp/code_execution_${randomUUID()}`;
  
  try {
    await fs.mkdir(tempDir, { recursive: true });
    
    let filename: string;
    let command: string[];
    
    switch (language.toLowerCase()) {
      case "python":
        filename = "solution.py";
        command = ["python3", filename];
        break;
      case "javascript":
        filename = "solution.js";
        command = ["node", filename];
        break;
      case "java":
        filename = "Solution.java";
        // Wrap code in a class if it's not already
        if (!code.includes("class")) {
          code = `public class Solution {\n${code}\n}`;
        }
        command = ["java", filename];
        break;
      case "cpp":
        filename = "solution.cpp";
        command = ["g++", "-o", "solution", filename, "&&", "./solution"];
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    const filePath = path.join(tempDir, filename);
    await fs.writeFile(filePath, code);

    let passedTests = 0;
    let executionTime = 0;
    let errorMessage = "";

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const startTime = Date.now();
      
      try {
        const result = await runSingleTest(tempDir, command, testCase.input, timeLimit);
        const endTime = Date.now();
        executionTime += (endTime - startTime);
        
        if (result.error) {
          errorMessage = result.error;
          break;
        }
        
        if (result.output.trim() === testCase.output.trim()) {
          passedTests++;
        } else {
          errorMessage = `Test case ${i + 1} failed. Expected: ${testCase.output}, Got: ${result.output}`;
          break;
        }
      } catch (error) {
        errorMessage = `Runtime error in test case ${i + 1}: ${error}`;
        break;
      }
    }

    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });

    if (errorMessage) {
      if (errorMessage.includes("timeout") || errorMessage.includes("time limit")) {
        return {
          status: "time_limit_exceeded",
          executionTime,
          passedTests,
          totalTests: testCases.length,
          errorMessage,
        };
      } else if (errorMessage.includes("Runtime error") || errorMessage.includes("Error")) {
        return {
          status: "runtime_error",
          executionTime,
          passedTests,
          totalTests: testCases.length,
          errorMessage,
        };
      } else {
        return {
          status: "wrong_answer",
          executionTime,
          passedTests,
          totalTests: testCases.length,
          errorMessage,
        };
      }
    }

    return {
      status: "accepted",
      executionTime,
      passedTests,
      totalTests: testCases.length,
    };

  } catch (error) {
    // Clean up on error
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
    
    return {
      status: "runtime_error",
      executionTime: 0,
      passedTests: 0,
      totalTests: testCases.length,
      errorMessage: `Setup error: ${error}`,
    };
  }
}

async function runSingleTest(
  workDir: string,
  command: string[],
  input: string,
  timeLimit: number
): Promise<{ output: string; error?: string }> {
  return new Promise((resolve, reject) => {
    const process = spawn(command[0], command.slice(1), {
      cwd: workDir,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let output = "";
    let error = "";
    let killed = false;

    const timeout = setTimeout(() => {
      killed = true;
      process.kill("SIGKILL");
      reject(new Error("Time limit exceeded"));
    }, timeLimit);

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      error += data.toString();
    });

    process.on("close", (code) => {
      clearTimeout(timeout);
      
      if (killed) {
        return;
      }

      if (code !== 0) {
        resolve({ output: "", error: error || `Process exited with code ${code}` });
      } else {
        resolve({ output: output.trim(), error: error ? error : undefined });
      }
    });

    process.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    // Send input to the process
    if (input) {
      process.stdin.write(input);
      process.stdin.end();
    }
  });
}
