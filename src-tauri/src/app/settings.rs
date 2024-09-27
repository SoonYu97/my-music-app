use tauri_plugin_store::Store;

#[derive(Debug, Clone)]
pub struct AppSettings {
    pub media_directory: String,
    pub theme: String,
}

impl AppSettings {
    pub fn load_from_store<R: tauri::Runtime>(
        store: &Store<R>,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let media_directory = store
            .get("appSettings.mediaDirectory")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .unwrap_or_else(|| "/path".to_string());

        let theme = store
            .get("appSettings.theme")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .unwrap_or_else(|| "dark".to_string());

        Ok(AppSettings {
            media_directory,
            theme,
        })
    }
}