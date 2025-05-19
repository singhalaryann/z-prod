// import { OpenAI } from "openai";
// import { NextResponse } from "next/server";
// // Pull in Blob and File constructors in Node
// import { Blob } from "buffer";
// import { File } from "node:buffer";

// export const runtime = 'nodejs';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // In-memory demo storage
// let assistantId = null;
// let threadsByUser = {};

// export async function GET() {
//   return NextResponse.json({ status: "API route is working" });
// }

// export async function POST(request) {
//   try {
//     console.log("🔁 Chat API called");

//     // 1. parse form-data
//     const formData = await request.formData();
//     const message = formData.get("message")?.toString() || "";
//     const userId  = formData.get("userId")?.toString()  || "default";

//     console.log("📥 Message received:", message);
//     console.log("👤 User ID:", userId);

//     // 2. collect files
//     const files = [];
//     for (const [key, value] of formData.entries()) {
//       console.log("🧾 FormData entry:", key);
//       if (key.startsWith("file") && value instanceof Blob) {
//         files.push(value);
//         console.log(
//           `📂 Accepted file: key=${key}, size=${value.size}, type=${value.type}`
//         );
//       }
//     }
//     console.log("🗂️ Files to process:", files.length);

//     // Clear existing assistant if needed
//     if (process.env.RESET_ASSISTANT === "true" && assistantId) {
//       console.log("🗑️ Deleting existing assistant...");
//       try {
//         await openai.beta.assistants.del(assistantId);
//         assistantId = null;
//         console.log("✅ Assistant deleted");
//       } catch (err) {
//         console.log("⚠️ Failed to delete assistant:", err.message);
//         assistantId = null;
//       }
//     }

//     // 3. create assistant once
//     if (!assistantId) {
//       console.log("🛠️ Creating assistant...");
//       const assistant = await openai.beta.assistants.create({
//         name: "Chat Helper",
//         instructions:
//           "You are a helpful assistant that can write code to solve problems with code_interpreter. When CSV files are uploaded, use code_interpreter to analyze the data and create visualizations.",
//         model: "gpt-4o",
//         tools: [{ type: "code_interpreter" }],
//       });
//       assistantId = assistant.id;
//       console.log("✅ Assistant created:", assistantId);
//     }

//     // 4. create/reuse thread
//     if (!threadsByUser[userId]) {
//       const thread = await openai.beta.threads.create();
//       threadsByUser[userId] = thread.id;
//       console.log("🧵 Thread created:", thread.id);
//     }
//     const threadId = threadsByUser[userId];

//     // 5. upload files if any
//     let attachments = [];
//     if (files.length > 0) {
//       const fileIds = [];
//       const fileTypes = {}; // Store file types for later reference

//       for (const incomingBlob of files) {
//         // arrayBuffer -> Buffer
//         const arrayBuffer = await incomingBlob.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);

//         // Determine file extension based on type or name
//         let ext = "txt";
//         const fileName = incomingBlob.name || "";
//         const isCSV = fileName.toLowerCase().endsWith('.csv') || incomingBlob.type === "text/csv";
        
//         if (incomingBlob.type === "application/pdf") {
//           ext = "pdf";
//         } else if (isCSV) {
//           ext = "csv";
//         }
        
//         const filename = `uploaded_${Date.now()}.${ext}`;
//         console.log(`📤 Preparing upload of: ${filename} with type ${incomingBlob.type}`);

//         // Create a File object instead of a Blob with name property
//         const fileForUpload = new File([buffer], filename, {
//           type: incomingBlob.type || "application/octet-stream"
//         });

//         // upload
//         const uploaded = await openai.files.create({
//           file: fileForUpload,
//           purpose: "assistants",
//         });
//         console.log("✅ Uploaded file ID:", uploaded.id);
//         fileIds.push(uploaded.id);
//         fileTypes[uploaded.id] = { isCSV, originalName: fileName };
//       }

//       // Apply code_interpreter to all files
//       attachments = fileIds.map((id) => ({
//         file_id: id,
//         tools: [{ type: "code_interpreter" }],
//       }));
//       console.log("📎 Attachments:", attachments);
//     }

//     // 6. send user message (with attachments if present)
//     console.log("✉️ Sending user message...");
//     await openai.beta.threads.messages.create(threadId, {
//       role: "user",
//       content: message,
//       ...(attachments.length > 0 && { attachments }),
//     });

//     // 7. run the assistant
//     console.log("🚀 Launching assistant run...");
//     const run = await openai.beta.threads.runs.create(threadId, {
//       assistant_id: assistantId,
//       tool_choice:  "auto",
//     });
//     console.log("🕒 Run ID:", run.id);

//     // 8. poll until complete
//     let status = await openai.beta.threads.runs.retrieve(threadId, run.id);
//     let tries  = 0;
//     while (
//       status.status !== "completed" &&
//       status.status !== "failed" &&
//       tries < 60
//     ) {
//       console.log(`⏳ Run status: ${status.status}`);
//       await new Promise((r) => setTimeout(r, 1000));
//       status = await openai.beta.threads.runs.retrieve(threadId, run.id);
//       tries++;
//     }
//     if (status.status !== "completed") {
//       throw new Error(`Run did not complete: ${status.status}`);
//     }

//     // 9. fetch the assistant's reply
// // 9. fetch the assistant's reply
// console.log("📥 Fetching assistant response...");
// const msgs = await openai.beta.threads.messages.list(threadId);
// console.log("📜 Messages list:", JSON.stringify(msgs.data, null, 2));

// const assistantMsg = msgs.data.find((m) => m.role === "assistant") || {};
// let responseText = "";
// let images = [];

// if (assistantMsg.content) {
//   for (const chunk of assistantMsg.content) {
//     if (chunk.type === "text") {
//       responseText += chunk.text.value;
//     } 
//     else if (chunk.type === "image_file") {
//       try {
//         // Get the file ID
//         const fileId = chunk.image_file.file_id;
        
//         // Get the image content
//         const imageContent = await openai.files.content(fileId);
//         // Convert to base64
//         const buffer = Buffer.from(await imageContent.arrayBuffer());
//         const base64Image = buffer.toString('base64');
        
//         // Add to images array
//         const imageUrl = `data:image/png;base64,${base64Image}`;
//         images.push(imageUrl);
        
//         // Add reference in the text
//         responseText += `\n[Image ${images.length}]\n`;
//       } catch (err) {
//         console.error("Error getting image:", err);
//         responseText += "\n[Image could not be loaded]\n";
//       }
//     }
//   }
// }

// console.log("✅ Assistant reply:", responseText);
// console.log(`📊 Found ${images.length} images`);

// return NextResponse.json({ 
//   response: responseText,
//   images: images 
// });  } catch (err) {
//     const detail =
//       err?.response?.data    ||
//       err?.response?.statusText ||
//       err?.message           ||
//       "Unknown error";
//     console.error("❌ API Error:", detail);
//     return NextResponse.json({ error: detail }, { status: 500 });
//   }
// }