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
    video_sources: Vec<String>,
    audio_sources: Vec<String>,
    image_poster: Option<String>,
    original_lyrics: Option<String>, // Original .lrc file
    translations: Vec<String>,       // List of translation files (e.g., .zh.lrc, .en.lrc)
}

#[tauri::command]
fn list_media_files() -> Result<Vec<MusicVideo>, String> {
    let media_dir = PathBuf::from("..\\public\\media");
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

        if path.is_dir() {
            let folder_name = path.file_name().unwrap().to_string_lossy().to_string();
            let mut has_lrc = false;
            let mut video_sources: Vec<String> = Vec::new();
            let mut audio_sources: Vec<String> = Vec::new();
            let mut image_poster: Option<String> = None;
            let mut original_lyrics: Option<String> = None;
            let mut translations: Vec<String> = Vec::new();

            for file in fs::read_dir(&path).map_err(|e| e.to_string())? {
                let file = file.map_err(|e| e.to_string())?;
                let file_path = file.path();
                let extension = file_path.extension().and_then(|ext| ext.to_str());

                match extension {
                    Some("lrc") => {
                        let file_stem = file_path.file_stem().unwrap().to_string_lossy();
                        if file_stem == folder_name {
                            original_lyrics = Some(file_path.to_string_lossy().to_string());
                            has_lrc = true;
                        } else if file_stem.starts_with(&folder_name) {
                            translations.push(file_path.to_string_lossy().to_string());
                        }
                    }
                    Some("webm") | Some("mp4") => {
                        video_sources.push(file_path.to_string_lossy().to_string());
                    }
                    Some("mp3") => {
                        audio_sources.push(file_path.to_string_lossy().to_string());
                    }
                    Some("jpg") | Some("png") => {
                        image_poster = Some(file_path.to_string_lossy().to_string());
                    }
                    _ => {}
                }
            }

            let mut artist: Option<String> = None;
            let mut album: Option<String> = None;

            if has_lrc {
                let lrc_path = path.join(format!("{}.lrc", folder_name));
                if let Ok(content) = fs::read_to_string(lrc_path) {
                    let metadata = extract_metadata(&content);
                    artist = Some(metadata.artist);
                    album = Some(metadata.album);
                };
            }

            let music_video = MusicVideo {
                title: folder_name,
                has_lrc,
                artist,
                album,
                video_sources,
                audio_sources,
                image_poster,
                original_lyrics,
                translations,
            };
            media_files.push(music_video);
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
pub struct SongMetadata {
    pub artist: String,
    pub album: String,
    pub title: String,
}

#[derive(Serialize)]
pub struct LyricMetadata {
    pub artist: String,
    pub album: String,
    pub title: String,
    pub lyrics: Vec<Lyric>,
}

// Function to extract metadata (artist, album, title)
fn extract_metadata(content: &str) -> SongMetadata {
    let mut artist = String::new();
    let mut album = String::new();
    let mut title = String::new();

    for line in content.lines() {
        if line.starts_with("[ar:") {
            artist = line.replace("[ar:", "").replace("]", "").trim().to_string();
        } else if line.starts_with("[al:") {
            album = line.replace("[al:", "").replace("]", "").trim().to_string();
        } else if line.starts_with("[ti:") {
            title = line.replace("[ti:", "").replace("]", "").trim().to_string();
        }
    }

    SongMetadata {
        artist,
        album,
        title,
    }
}

// Function to extract the lyrics and timestamps
fn extract_lyrics(content: &str) -> Vec<Lyric> {
    let mut lyrics: Vec<Lyric> = Vec::new();
    let time_regex = Regex::new(r"\[(\d+):(\d+)\.(\d+)\]").unwrap();
    let furigana_regex = Regex::new(r"(\p{Script=Han}+)\((.*?)\)").unwrap();

    for line in content.lines() {
        if let Some(captures) = time_regex.captures(line) {
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

    lyrics
}

#[tauri::command]
fn parse_lyrics_file(file_path: String) -> Result<LyricMetadata, String> {
    let media_dir = PathBuf::from(file_path.clone());
    if !media_dir.exists() {
        return Err(format!("File not found: {:?}", media_dir));
    }

    if let Ok(content) = fs::read_to_string(media_dir) {
        let metadata = extract_metadata(&content);
        let lyrics = extract_lyrics(&content);
        Ok(LyricMetadata {
            lyrics,
            artist: metadata.artist,
            album: metadata.album,
            title: metadata.title,
        })
    } else {
        Err("Failed to read file".to_string())
    }
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
