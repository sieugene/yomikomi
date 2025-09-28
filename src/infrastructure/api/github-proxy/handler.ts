import { NextRequest, NextResponse } from "next/server";

export const API_GITHUB_PROXY = {
  GET: async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const url = searchParams.get("url");

      if (!url) {
        return NextResponse.json(
          { error: "URL parameter is required" },
          { status: 400 }
        );
      }

      const githubUrlPattern = /^https:\/\/(raw\.)?github(usercontent)?\.com\//;
      if (!githubUrlPattern.test(url)) {
        return NextResponse.json(
          { error: "Only GitHub URLs are allowed" },
          { status: 400 }
        );
      }

      const response = await fetch(url);

      if (!response.ok) {
        return NextResponse.json(
          { error: `GitHub request failed: ${response.status}` },
          { status: response.status }
        );
      }

      const contentType =
        response.headers.get("content-type") || "application/octet-stream";

      const buffer = await response.arrayBuffer();

      if (
        contentType.includes("application/json") ||
        contentType.includes("text/plain")
      ) {
        const text = new TextDecoder().decode(buffer);
        try {
          const data = JSON.parse(text);
          return NextResponse.json(data);
        } catch {
          return new NextResponse(text, {
            status: 200,
            headers: {
              "Content-Type": "text/plain",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET",
              "Access-Control-Allow-Headers": "Content-Type",
            },
          });
        }
      }

      const responseHeaders = new Headers({
        "Content-Type": contentType,
        "Content-Length": buffer.byteLength.toString(),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      });

      return new NextResponse(buffer, {
        status: 200,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error("GitHub proxy error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
};
