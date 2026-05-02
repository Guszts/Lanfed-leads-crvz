import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { Groq } from "groq-sdk";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Configure multer for file uploads in memory for small files or disk for larger
const upload = multer({ storage: multer.memoryStorage() });

let groq: Groq | null = null;
function getGroq() {
  if (!groq) {
    const key = process.env.GROQ_API_KEY;
    if (!key) {
      throw new Error("GROQ_API_KEY environment variable is required to process files with AI");
    }
    groq = new Groq({ apiKey: key });
  }
  return groq;
}

// API Routes
app.post("/api/process-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const fileContent = req.file.buffer.toString("utf-8");
    
    // Check if it's too large to send to Groq API naively (max tokens limit)
    // For large files, you might need chunking, but let's try a single request first
    if (fileContent.length > 30000) {
       console.warn("File is very large, might exceed Groq token limits.");
    }

    const groqClient = getGroq();

    const prompt = `
Você é um assistente especializado em estruturar dados de leads.
Recebi o conteúdo de um arquivo (CSV, JSON ou texto bruto) com informações de contatos/empresas.
Sua tarefa é extrair todos os leads possíveis, identificando "Nome", "MapsLink" e "Telefone".
O "MapsLink" pode ser qualquer URL do Google Maps, ou deixe vazio se não houver.
O "Telefone" deve ser extraído ou formatado.
Ignore linhas que não sejam informações válidas de contatos.

Conteúdo do arquivo:
${fileContent.substring(0, 30000)} // Limite para evitar exaurir tokens

Retorne **apenas** um array JSON válido, onde cada objeto tem o formato:
{ "name": "Nome da empresa", "mapsLink": "Link do Google Maps", "phone": "O Telefone", "category": "Categoria Opcional" }
Não adicione nenhum texto, markdown (\`\`\`json) ou explicações fora do array JSON.
`;

    const completion = await groqClient.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192", // Usando o llama3 para melhor aderência a JSON
      temperature: 0.1,
    });

    let rawOutput = completion.choices[0]?.message?.content || "[]";
    
    // Clean up potential markdown wrapper from Llama/Groq
    if (rawOutput.includes("```json")) {
      rawOutput = rawOutput.replace(/```json/g, "").replace(/```/g, "");
    }
    
    let leads = [];
    try {
      leads = JSON.parse(rawOutput.trim());
    } catch (e) {
      console.error("Failed to parse Groq output as JSON:", rawOutput);
      return res.status(500).json({ error: "O modelo falhou em retornar um JSON válido." });
    }

    // Filter missing fields if the user requested "Se algo faltar, não vai contar como um lead"
    leads = leads.filter((l: any) => l.name && l.mapsLink && l.phone);

    res.json({ leads });
  } catch (err: any) {
    console.error("Error processing file:", err);
    res.status(500).json({ error: err.message || "Erro interno ao processar o arquivo" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
