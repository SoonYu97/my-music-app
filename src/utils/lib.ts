import { BaseDirectory, mkdir, exists } from "@tauri-apps/plugin-fs";

export async function createSingAlongFolder() {
  try {
    if (await exists("Sing-Along", { baseDir: BaseDirectory.Video })) {
      return;
    }
    await mkdir("Sing-Along", { baseDir: BaseDirectory.Video });
    console.log(`Sing-Along folder created at: ${BaseDirectory.Video}`);
  } catch (error) {
    console.error("Failed to create directory:", error);
  }
}
