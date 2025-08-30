export interface GenerateQuestionRequest {
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  requirements?: string;
}

export interface GeneratedQuestion {
  title: string;
  description: string;
  constraints: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: Array<{
    input: string;
    output: string;
  }>;
}

export async function generateQuestion(request: GenerateQuestionRequest): Promise<GeneratedQuestion> {
  const openaiApiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "sk-test";
  
  const prompt = `Generate a ${request.difficulty} level coding problem about ${request.topic}.
  ${request.requirements ? `Additional requirements: ${request.requirements}` : ''}
  
  Return a JSON object with the following structure:
  {
    "title": "Problem title",
    "description": "Detailed problem description with clear requirements",
    "constraints": "Problem constraints and limits",
    "examples": [
      {
        "input": "example input",
        "output": "expected output", 
        "explanation": "explanation of the example"
      }
    ],
    "testCases": [
      {
        "input": "test input",
        "output": "expected output"
      }
    ]
  }
  
  Include 2-3 examples and 5-7 test cases covering edge cases.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert competitive programming problem setter. Generate high-quality DSA problems with clear descriptions and comprehensive test cases."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      // Fallback question if AI response is malformed
      return {
        title: "Two Sum Problem",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        constraints: "2 ≤ nums.length ≤ 10⁴\n-10⁹ ≤ nums[i] ≤ 10⁹\n-10⁹ ≤ target ≤ 10⁹\nOnly one valid answer exists.",
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
          }
        ],
        testCases: [
          { input: "[2,7,11,15]\n9", output: "[0,1]" },
          { input: "[3,2,4]\n6", output: "[1,2]" },
          { input: "[3,3]\n6", output: "[0,1]" },
          { input: "[1,2,3,4,5]\n9", output: "[3,4]" },
          { input: "[0,4,3,0]\n0", output: "[0,3]" }
        ]
      };
    }
  } catch (error) {
    console.error("Error generating question:", error);
    // Return fallback question
    return {
      title: "Array Sum Problem",
      description: "Given an array of integers, find the sum of all elements.",
      constraints: "1 ≤ array.length ≤ 1000\n-1000 ≤ array[i] ≤ 1000",
      examples: [
        {
          input: "[1, 2, 3, 4, 5]",
          output: "15",
          explanation: "Sum of all elements: 1 + 2 + 3 + 4 + 5 = 15"
        }
      ],
      testCases: [
        { input: "[1,2,3,4,5]", output: "15" },
        { input: "[-1,1,0]", output: "0" },
        { input: "[10]", output: "10" },
        { input: "[]", output: "0" },
        { input: "[-5,-10,-15]", output: "-30" }
      ]
    };
  }
}

export async function getCodeFeedback(code: string, question: string, error: string): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "sk-test";
  
  const prompt = `A user submitted the following code for this problem:

Problem: ${question}

Code:
${code}

Error/Issue: ${error}

Provide a helpful hint or explanation of what might be wrong with the code. Be constructive and educational.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful coding mentor. Provide constructive feedback on coding problems."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      return "Unable to generate feedback at this time. Please review your code and try again.";
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    return "Unable to generate feedback at this time. Please review your code and try again.";
  }
}
