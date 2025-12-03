import { NextResponse } from "next/server";
import { createReadStream, statSync } from "node:fs";
import { Readable } from "node:stream";
import { ReadableStream as WebReadableStream } from "node:stream/web";
import path from "node:path";

type Target = "browser" | "vscode";

export const runtime = "nodejs";

function resolveArtifact(target: string) {
  const base = process.cwd();
  const map: Record<Target, { file: string; filename: string; contentType: string }> = {
    browser: {
      file: path.join(base, "integrations", "browser-extension.zip"),
      filename: "diccionario-dev-browser-extension.zip",
      contentType: "application/zip",
    },
    vscode: {
      file: path.join(base, "integrations", "vscode-helper", "diccionario-dev-helper.vsix"),
      filename: "diccionario-dev-helper.vsix",
      contentType: "application/octet-stream",
    },
  };

  return map[target as Target];
}

export async function GET(_request: Request, { params }: { params: { target: string } }) {
  const artifact = resolveArtifact(params.target);
  if (!artifact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    statSync(artifact.file);
  } catch {
    return NextResponse.json({ error: "Artifact not available" }, { status: 404 });
  }

  const nodeStream = createReadStream(artifact.file);
  const stream = Readable.toWeb(nodeStream) as unknown as WebReadableStream;
  return new NextResponse(stream, {
    headers: {
      "Content-Type": artifact.contentType,
      "Content-Disposition": `attachment; filename="${artifact.filename}"`,
    },
  });
}
