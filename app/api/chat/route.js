import { OpenAI } from "openai";
import { NextResponse } from "next/server";
// Pull in Blob and File constructors in Node
import { Blob } from "buffer";
import { File } from "node:buffer";
import axios from "axios";

export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store threads by user ID
const userThreads = new Map();

export async function GET() {
  return NextResponse.json({ status: "API route is working" });
}

export async function POST(request) {
  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OpenAI API key is not set");
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    console.log("🔁 Chat API called");

    // 1. parse form-data
    const formData = await request.formData();
    const message = formData.get("message")?.toString() || "";
    const userId = formData.get("userId")?.toString() || "default";

    if (!message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    console.log("📥 Message received:", message);
    console.log("👤 User ID:", userId);

    // 2. collect files
    const files = [];
    for (const [key, value] of formData.entries()) {
      console.log("🧾 FormData entry:", key);
      if (key.startsWith("file") && value instanceof Blob) {
        files.push(value);
        console.log(
          `📂 Accepted file: key=${key}, size=${value.size}, type=${value.type}`
        );
      }
    }
    console.log("🗂️ Files to process:", files.length);

    // 3. create assistant if not exists
    let assistantId = process.env.OPENAI_ASSISTANT_ID;
    if (!assistantId) {
      console.log("🛠️ Creating assistant...");
      const assistant = await openai.beta.assistants.create({
        name: "X-Gaming AI Assistant",
        instructions:
          "You are a helpful gaming AI assistant that can analyze data with code_interpreter. When CSV files are uploaded, analyze the data and create visualizations. For questions about user metrics like DAU/WAU/MAU, use the get_metrics function to retrieve accurate data from our database. Focus on gaming industry insights, game development advice, and data analysis.",
        model: "gpt-4o",
        tools: [
          { type: "code_interpreter" },
          { 
            type: "function",
            function: {
              name: "get_metrics",
              description: "Get user metrics like DAU, WAU, MAU, and other gaming statistics from our database",
              parameters: {
                type: "object",
                properties: {
                  metric_type: {
                    type: "string",
                    enum: ["dau", "wau", "mau", "retention", "engagement", "statistics"],
                    description: "The type of metric to retrieve"
                  },
                  time_period: {
                    type: "string",
                    description: "Time period for the metrics, e.g., 'past week', 'April', etc."
                  }
                },
                required: ["metric_type"]
              }
            }
          }
        ]
      });
      assistantId = assistant.id;
      console.log("✅ Assistant created:", assistantId);
    }

    // 4. get or create thread for user
    let threadId = userThreads.get(userId);
    if (!threadId) {
      console.log("🧵 Creating new thread for user:", userId);
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      userThreads.set(userId, threadId);
      console.log("✅ Thread created:", threadId);
    } else {
      console.log("✅ Using existing thread:", threadId);
      
      // Check for active runs and wait for them to complete
      const runs = await openai.beta.threads.runs.list(threadId);
      const activeRun = runs.data.find(run => 
        run.status === 'in_progress' || run.status === 'queued'
      );
      
      if (activeRun) {
        console.log("⏳ Waiting for active run to complete:", activeRun.id);
        await openai.beta.threads.runs.cancel(threadId, activeRun.id);
        console.log("✅ Cancelled active run");
      }
    }

    // 5. upload files if any
    let attachments = [];
    if (files.length > 0) {
      const fileIds = [];
      for (const incomingBlob of files) {
        const arrayBuffer = await incomingBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        let ext = "txt";
        const fileName = incomingBlob.name || "";
        const isCSV = fileName.toLowerCase().endsWith('.csv') || incomingBlob.type === "text/csv";
        
        if (incomingBlob.type === "application/pdf") {
          ext = "pdf";
        } else if (isCSV) {
          ext = "csv";
        }
        
        const filename = `uploaded_${Date.now()}.${ext}`;
        console.log(`📤 Preparing upload of: ${filename}`);

        const fileForUpload = new File([buffer], filename, {
          type: incomingBlob.type || "application/octet-stream"
        });

        const uploaded = await openai.files.create({
          file: fileForUpload,
          purpose: "assistants",
        });
        console.log("✅ Uploaded file ID:", uploaded.id);
        fileIds.push(uploaded.id);
      }

      attachments = fileIds.map((id) => ({
        file_id: id,
        tools: [{ type: "code_interpreter" }],
      }));
    }

    // 6. send user message
    console.log("✉️ Sending user message...");
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
      ...(attachments.length > 0 && { attachments }),
    });

    // 7. run the assistant
    console.log("🚀 Launching assistant run with streaming...");
    const run = await openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });

    // 8. return streaming response
    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const event of run) {
              console.log("📡 Stream event:", event.event);
              
              if (event.event === 'thread.message.delta') {
                const delta = event.data.delta.content?.[0];
                if (delta?.type === 'text' && delta.text?.value) {
                  controller.enqueue(`data: ${JSON.stringify({
                    type: 'text',
                    content: delta.text.value
                  })}\n\n`);
                }
              }
              else if (event.event === 'thread.run.requires_action') {
                console.log("🔧 Function call required");
                const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
                const toolOutputs = [];
                
                for (const toolCall of toolCalls) {
                  if (toolCall.function.name === "get_metrics") {
                    try {
                      const args = JSON.parse(toolCall.function.arguments);
                      const bqResponse = await axios.post("http://127.0.0.1:8696/run_bq_tool", {
                        question: `Get ${args.metric_type} data ${args.time_period ? 'for ' + args.time_period : ''}`
                      }, {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 5000
                      });
                      
                      toolOutputs.push({
                        tool_call_id: toolCall.id,
                        output: JSON.stringify(bqResponse.data.result)
                      });
                    } catch (error) {
                      console.error("❌ BQ API Error:", error.message);
                      toolOutputs.push({
                        tool_call_id: toolCall.id,
                        output: JSON.stringify({
                          message: "API currently unavailable. This is dummy data for testing.",
                          data: [
                            {"date": "2025-01-01", "dau": 1500},
                            {"date": "2025-01-02", "dau": 1750},
                            {"date": "2025-01-03", "dau": 1600}
                          ]
                        })
                      });
                    }
                  }
                }
                
                if (toolOutputs.length > 0) {
                  await openai.beta.threads.runs.submitToolOutputs(
                    threadId, 
                    event.data.id, 
                    { tool_outputs: toolOutputs }
                  );
                }
              }
              else if (event.event === 'thread.run.completed') {
                console.log("✅ Run completed, checking for images...");
                // Get all messages, but only use the latest assistant message
                const msgs = await openai.beta.threads.messages.list(threadId);
                // Find the latest assistant message
                const assistantMsgs = msgs.data.filter((m) => m.role === "assistant");
                const latestAssistantMsg = assistantMsgs.length > 0 ? assistantMsgs[0] : null;
                if (latestAssistantMsg && latestAssistantMsg.content) {
                  for (const chunk of latestAssistantMsg.content) {
                    if (chunk.type === "image_file") {
                      try {
                        const fileId = chunk.image_file.file_id;
                        const imageContent = await openai.files.content(fileId);
                        const buffer = Buffer.from(await imageContent.arrayBuffer());
                        const base64Image = buffer.toString('base64');
                        const imageUrl = `data:image/png;base64,${base64Image}`;
                        controller.enqueue(`data: ${JSON.stringify({
                          type: 'image',
                          image: imageUrl
                        })}\n\n`);
                      } catch (err) {
                        console.error("Error getting image:", err);
                      }
                    }
                  }
                }
                controller.enqueue(`data: ${JSON.stringify({
                  type: 'done'
                })}\n\n`);
              }
              else if (event.event === 'thread.run.failed') {
                throw new Error('Assistant run failed');
              }
            }
            
            controller.close();
            console.log("🏁 Streaming completed");
            
          } catch (error) {
            console.error("❌ Streaming error:", error);
            controller.enqueue(`data: ${JSON.stringify({
              type: 'error',
              message: error.message
            })}\n\n`);
            controller.close();
          }
        }
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      }
    );
    
  } catch (err) {
    const detail =
      err?.response?.data    ||
      err?.response?.statusText ||
      err?.message           ||
      "Unknown error";
    console.error("❌ API Error:", detail);
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}