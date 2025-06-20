use tauri::{Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, CustomMenuItem, SystemTrayMenuItem, AppHandle, api::notification::Notification};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct GitHubRelease {
    tag_name: String,
    name: String,
    body: String,
    html_url: String,
    published_at: String,
    prerelease: bool,
    draft: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct UpdateInfo {
    available: bool,
    current_version: String,
    latest_version: String,
    download_url: Option<String>,
    release_notes: Option<String>,
    error: Option<String>,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn check_for_updates(app_handle: AppHandle) -> Result<UpdateInfo, String> {
    let current_version = app_handle.package_info().version.to_string();
    
    // GitHub repository - you'll need to update this to your actual repo
    let repo_url = "https://api.github.com/repos/YOUR_GITHUB_USERNAME/ichfickdiscord/releases/latest";
    
    match fetch_latest_release(repo_url).await {
        Ok(release) => {
            let latest_version = release.tag_name.trim_start_matches('v');
            let is_newer = compare_versions(&current_version, latest_version);
            
            Ok(UpdateInfo {
                available: is_newer,
                current_version,
                latest_version: latest_version.to_string(),
                download_url: Some(release.html_url.clone()),
                release_notes: Some(release.body),
                error: None,
            })
        }
        Err(e) => {
            Ok(UpdateInfo {
                available: false,
                current_version,
                latest_version: "Unknown".to_string(),
                download_url: None,
                release_notes: None,
                error: Some(format!("Failed to check for updates: {}", e)),
            })
        }
    }
}

async fn fetch_latest_release(url: &str) -> Result<GitHubRelease, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let response = client
        .get(url)
        .header("User-Agent", "IchFickDiscord-Updater")
        .send()
        .await?;
    
    if response.status().is_success() {
        let release: GitHubRelease = response.json().await?;
        Ok(release)
    } else {
        Err(format!("HTTP error: {}", response.status()).into())
    }
}

fn compare_versions(current: &str, latest: &str) -> bool {
    // Simple version comparison - you might want to use a proper semver crate
    let current_parts: Vec<u32> = current.split('.').filter_map(|s| s.parse().ok()).collect();
    let latest_parts: Vec<u32> = latest.split('.').filter_map(|s| s.parse().ok()).collect();
    
    for i in 0..std::cmp::max(current_parts.len(), latest_parts.len()) {
        let current_part = current_parts.get(i).unwrap_or(&0);
        let latest_part = latest_parts.get(i).unwrap_or(&0);
        
        if latest_part > current_part {
            return true;
        } else if latest_part < current_part {
            return false;
        }
    }
    
    false
}

#[tauri::command]
fn get_app_version(app_handle: AppHandle) -> String {
    app_handle.package_info().version.to_string()
}

fn create_system_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

fn handle_system_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            let window = app.get_window("main").unwrap();
            window.show().unwrap();
            window.set_focus().unwrap();
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                _ => {}
            }
        }
        _ => {}
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .system_tray(create_system_tray())
        .on_system_tray_event(handle_system_tray_event)
        .setup(|_app| {
            // Setup complete
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, check_for_updates, get_app_version])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
