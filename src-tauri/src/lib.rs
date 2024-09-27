use regex::Regex;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

// mod app;
// use app::settings::AppSettings;

#[derive(Debug, Serialize, Deserialize)]
pub struct MusicVideo {
    title: String,
    has_lrc: bool,
    artist: Option<String>,
    album: Option<String>,
}

#[tauri::command]
fn list_media_files() -> Result<Vec<MusicVideo>, String> {
    let media_dir = PathBuf::from("../public/media");
    let mut media_files = Vec::new();

    if !media_dir.exists() {
        return Err("Media directory not found.".into());
    }
    if !media_dir.is_dir() {
        return Err("Media is not a directory.".into());
    }

    let entries = fs::read_dir(media_dir.clone()).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if let Some(extension) = path.extension() {
            if extension == "mp3" || extension == "mp4" || extension == "webm" {
                if let Some(file_stem) = path.file_stem() {
                    if let Some(file_name) = path.file_name() {
                        let lrc_path =
                            media_dir.join(format!("{}.lrc", file_stem.to_string_lossy()));
                        let has_lrc = lrc_path.exists();

                        let mut artist: Option<String> = None;
                        let mut album: Option<String> = None;

                        if has_lrc {
                            if let Some(metadata) = extract_lyrics_metadata(&lrc_path) {
                                artist = Some(metadata.artist);
                                album = Some(metadata.album);
                            }
                        }

                        let music_video = MusicVideo {
                            title: file_name.to_string_lossy().to_string(),
                            has_lrc,
                            artist,
                            album,
                        };
                        media_files.push(music_video);
                    }
                }
            }
        }
    }

    Ok(media_files)
}

#[derive(Serialize)]
pub struct Lyric {
    pub time: f64,
    pub text: String,
}

#[derive(Serialize)]
pub struct LyricsMetadata {
    pub artist: String,
    pub album: String,
    pub title: String,
    pub lyrics: Vec<Lyric>,
}

// Extracts metadata from the .lrc file
fn extract_lyrics_metadata(file_path: &PathBuf) -> Option<LyricsMetadata> {
    if let Ok(content) = fs::read_to_string(file_path) {
        let mut artist = String::new();
        let mut album = String::new();
        let mut title = String::new();
        let mut lyrics: Vec<Lyric> = Vec::new();

        let time_regex = Regex::new(r"\[(\d+):(\d+)\.(\d+)\]").unwrap();
        let furigana_regex = Regex::new(r"(\p{Script=Han}+)\((.*?)\)").unwrap();

        for line in content.lines() {
            if line.starts_with("[ar:") {
                artist = line.replace("[ar:", "").replace("]", "").trim().to_string();
            } else if line.starts_with("[al:") {
                album = line.replace("[al:", "").replace("]", "").trim().to_string();
            } else if line.starts_with("[ti:") {
                title = line.replace("[ti:", "").replace("]", "").trim().to_string();
            } else if let Some(captures) = time_regex.captures(line) {
                // Parse time
                let minutes: f64 = captures[1].parse().unwrap();
                let seconds: f64 = captures[2].parse().unwrap();
                let milliseconds: f64 = captures[3].parse().unwrap();
                let time = minutes * 60.0 + seconds + milliseconds / 1000.0;

                // Extract the text and replace furigana with <ruby><rt>
                let mut text = time_regex.replace(line, "").to_string();
                text = furigana_regex
                    .replace_all(&text, r"<ruby>$1<rt>$2</rt></ruby>")
                    .to_string();

                lyrics.push(Lyric { time, text });
            }
        }

        return Some(LyricsMetadata {
            artist,
            album,
            title,
            lyrics,
        });
    }

    None
}

#[tauri::command]
fn parse_lyrics_file(file_path: String) -> Result<LyricsMetadata, String> {
    let media_dir = PathBuf::from(file_path.clone());
    if !media_dir.exists() {
        return Err(format!("File not found: {:?}", media_dir));
    }
    // Read and parse lyrics metadata
    extract_lyrics_metadata(&media_dir).ok_or_else(|| "Failed to parse lyrics".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            list_media_files,
            parse_lyrics_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
